import { describe, expect, test } from "bun:test";
import app from "../index";

/**
 * Reads all SSE events from a response stream.
 * Keeps reading until the stream ends (writer closes).
 */
async function readAllSSE(
  response: Response,
  timeoutMs = 15000,
): Promise<Array<{ event: string; data: unknown }>> {
  const decoder = new TextDecoder();
  const events: Array<{ event: string; data: unknown }> = [];
  const reader = response.body!.getReader();

  const timer = setTimeout(() => {
    reader.cancel();
  }, timeoutMs);

  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // Parse any complete SSE events from buffer
      const parts = buffer.split("\n\n");
      buffer = parts.pop() || "";

      for (const part of parts) {
        if (!part.trim()) continue;
        const lines = part.split("\n");
        let event = "";
        let rawData = "";

        for (const line of lines) {
          if (line.startsWith("event: ")) event = line.slice(7).trim();
          else if (line.startsWith("data: ")) rawData = line.slice(6).trim();
        }

        if (event && rawData) {
          try {
            events.push({ event, data: JSON.parse(rawData) });
          } catch {
            /* ignore parse errors */
          }
        }
      }
    }
  } catch {
    /* stream cancelled by timeout */
  } finally {
    clearTimeout(timer);
  }

  return events;
}

describe("Questions API Endpoint", () => {
  test("GET /questions returns default 10 questions via SSE", async () => {
    const req = new Request("http://localhost/api/v1/questions");
    const res = await app.request(req);
    expect(res.status).toBe(200);

    const events = await readAllSSE(res, 15000);

    const queueEvent = events.find((e) => e.event === "queue");
    expect(queueEvent).not.toBeNull();
    expect((queueEvent!.data as any).position).toBe(1);
    expect((queueEvent!.data as any).totalInQueue).toBe(1);
    expect((queueEvent!.data as any).estimatedWaitSeconds).toBe(0);

    const resultEvent = events.find((e) => e.event === "result");
    expect(resultEvent).not.toBeNull();
    const questions = (resultEvent!.data as any).data;
    expect(questions).toBeArray();
    expect(questions.length).toBe(10);
    expect(questions[0].question).toBeDefined();
  }, 20000);

  test("GET /questions with query parameters via SSE", async () => {
    await new Promise((r) => setTimeout(r, 6000));

    const req = new Request(
      "http://localhost/api/v1/questions?amount=2&difficulty=easy&type=boolean",
    );
    const res = await app.request(req);
    expect(res.status).toBe(200);

    const events = await readAllSSE(res, 20000);

    const resultEvent = events.find((e) => e.event === "result");
    expect(resultEvent).not.toBeNull();
    const questions = (resultEvent!.data as any).data;
    expect(questions).toBeArray();
    expect(questions.length).toBe(2);
    expect(questions[0].difficulty).toBe("easy");
    expect(questions[0].type).toBe("boolean");
  }, 30000);

  test("GET /questions with invalid amount returns 400", async () => {
    const req = new Request("http://localhost/api/v1/questions?amount=60");
    const res = await app.request(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json).toHaveProperty("error");
    expect(json.error).toContain("Invalid amount parameter");
  });

  test("GET /questions returning No Results maps to error via SSE", async () => {
    await new Promise((r) => setTimeout(r, 6000));
    const req = new Request(
      "http://localhost/api/v1/questions?amount=50&category=30&difficulty=hard&type=boolean",
    );
    const res = await app.request(req);
    expect(res.status).toBe(200);

    const events = await readAllSSE(res, 20000);

    const errorEvent = events.find((e) => e.event === "error");
    expect(errorEvent).not.toBeNull();
    expect((errorEvent!.data as any).message).toBeDefined();
    expect((errorEvent!.data as any).message).toContain("No Results");
  }, 30000);
});
