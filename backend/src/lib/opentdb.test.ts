import { describe, expect, test } from "bun:test";
import { fetchQuestions, OpenTDBError } from "./opentdb";

// Open Trivia DB restricts to 1 request per 5 seconds
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("Open Trivia DB Service", () => {
  test("fetches exactly 5 questions successfully", async () => {
    const questions = await fetchQuestions({ amount: 5 });
    expect(questions).toBeArray();
    expect(questions.length).toBe(5);
    expect(questions[0]?.question).toBeDefined();
    expect(questions[0]?.correct_answer).toBeDefined();
    expect(questions[0]?.incorrect_answers).toBeArray();
  }, 10000);

  test("fetches specific difficulty and type", async () => {
    await delay(5050);
    const questions = await fetchQuestions({
      amount: 2,
      difficulty: "easy",
      type: "boolean",
    });

    expect(questions).toBeArray();
    expect(questions.length).toBe(2);

    for (const q of questions) {
      expect(q.difficulty).toBe("easy");
      expect(q.type).toBe("boolean");
    }
  }, 15000);

  test("throws OpenTDBError on invalid amount (e.g. asking for 100 questions in a small category)", async () => {
    await delay(5050);
    // Category 30 is Science: Gadgets, which should not have 50 hard boolean questions
    try {
      await fetchQuestions({
        amount: 50,
        category: 30,
        difficulty: "hard",
        type: "boolean",
      });
      // Should not reach here if the API successfully fails
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeInstanceOf(OpenTDBError);
      if (error instanceof OpenTDBError) {
        expect(error.code).toBe(1); // No Results
      }
    }
  }, 15000);
});
