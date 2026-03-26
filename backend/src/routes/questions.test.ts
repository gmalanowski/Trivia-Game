import { describe, expect, test } from "bun:test";
import app from "../index";

describe("Questions API Endpoint", () => {
  test("GET /questions returns default 10 questions", async () => {
    const req = new Request("http://localhost/api/v1/questions");
    const res = await app.request(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toBeArray();
    expect(json.length).toBe(10);
    expect(json[0].question).toBeDefined();
  }, 10000);

  test("GET /questions with query parameters", async () => {
    // Wait 6 seconds to avoid OpenTDB rate-limit after previous test
    await new Promise((r) => setTimeout(r, 6000));

    const req = new Request(
      "http://localhost/api/v1/questions?amount=2&difficulty=easy&type=boolean",
    );
    const res = await app.request(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toBeArray();
    expect(json.length).toBe(2);
    expect(json[0].difficulty).toBe("easy");
    expect(json[0].type).toBe("boolean");
  }, 15000);

  test("GET /questions with invalid amount returns 400", async () => {
    const req = new Request("http://localhost/api/v1/questions?amount=60"); // Max amount is 50
    const res = await app.request(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json).toHaveProperty("error");
    expect(json.error).toContain("Invalid amount parameter");
  });

  test("GET /questions returning No Results maps to 404", async () => {
    await new Promise((r) => setTimeout(r, 6000));
    const req = new Request(
      "http://localhost/api/v1/questions?amount=50&category=30&difficulty=hard&type=boolean",
    );
    const res = await app.request(req);
    expect(res.status).toBe(404);

    const json = await res.json();
    expect(json).toHaveProperty("error");
    expect(json).toHaveProperty("code", 1);
  }, 15000);
});
