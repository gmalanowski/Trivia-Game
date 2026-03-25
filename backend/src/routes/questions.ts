import { Hono } from "hono";
import type { FetchQuestionsOptions } from "../lib/opentdb";
import { fetchQuestions, OpenTDBError } from "../lib/opentdb";

const questions = new Hono();

questions.get("/", async (c) => {
  const amountParam = c.req.query("amount");
  const categoryParam = c.req.query("category");
  const difficultyParam = c.req.query("difficulty");
  const typeParam = c.req.query("type");

  // amount is required by OpenTDB API, default to 10 if not provided
  const amount = amountParam ? parseInt(amountParam, 10) : 10;

  if (Number.isNaN(amount) || amount <= 0 || amount > 50) {
    return c.json(
      { error: "Invalid amount parameter. Must be between 1 and 50." },
      400,
    );
  }

  const options: FetchQuestionsOptions = { amount };

  if (categoryParam) {
    const category = parseInt(categoryParam, 10);
    if (!Number.isNaN(category)) {
      options.category = category;
    }
  }

  if (
    difficultyParam === "easy" ||
    difficultyParam === "medium" ||
    difficultyParam === "hard"
  ) {
    options.difficulty = difficultyParam;
  }

  if (typeParam === "multiple" || typeParam === "boolean") {
    options.type = typeParam;
  }

  try {
    const data = await fetchQuestions(options);
    return c.json(data, 200);
  } catch (error) {
    if (error instanceof OpenTDBError) {
      let httpStatus: 200 | 400 | 401 | 404 | 409 | 429 | 500 = 400;

      switch (error.code) {
        case 1:
          httpStatus = 404;
          break; // No Results
        case 2:
          httpStatus = 400;
          break; // Invalid Parameter
        case 3:
          httpStatus = 401;
          break; // Token Not Found
        case 4:
          httpStatus = 409;
          break; // Token Empty
        case 5:
          httpStatus = 429;
          break; // Rate Limit
        default:
          httpStatus = 400;
      }

      return c.json({ error: error.message, code: error.code }, httpStatus);
    }

    console.error("OpenTDB API Error:", error);
    return c.json(
      { error: "An unexpected error occurred while fetching questions." },
      500,
    );
  }
});

export default questions;
