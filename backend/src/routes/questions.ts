import { Hono } from "hono";
import { type FetchQuestionsOptions } from "../lib/opentdb";
import { queueManager } from "../lib/sseQueue";

const questions = new Hono();

questions.get("/", async (c) => {
  const amountParam = c.req.query("amount");
  const categoryParam = c.req.query("category");
  const difficultyParam = c.req.query("difficulty");
  const typeParam = c.req.query("type");

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

  const connectionId = crypto.randomUUID();
  const encoder = new TextEncoder();

  // Shared state for the pull-based ReadableStream
  const eventQueue: (Uint8Array | null)[] = [];
  let pullResolver: (() => void) | null = null;

  function signal() {
    if (pullResolver) {
      const r = pullResolver;
      pullResolver = null;
      r();
    }
  }

  // Register position update listener
  queueManager.onPositionUpdate(
    connectionId,
    (position, totalInQueue, estimatedWaitSeconds) => {
      eventQueue.push(
        encoder.encode(
          `event: queue\ndata: ${JSON.stringify({ position, totalInQueue, estimatedWaitSeconds })}\n\n`,
        ),
      );
      signal();
    },
  );

  // Add entry to queue
  queueManager.addEntry({
    id: connectionId,
    type: "questions",
    options,
    status: "waiting",
    enqueuedAt: Date.now(),
    resolve: (value) => {
      if (value.type === "result") {
        eventQueue.push(
          encoder.encode(
            `event: result\ndata: ${JSON.stringify({ data: value.data })}\n\n`,
          ),
        );
      } else {
        const code = value.message.includes("No Results") ? 1 : 5;
        eventQueue.push(
          encoder.encode(
            `event: error\ndata: ${JSON.stringify({ message: value.message, code })}\n\n`,
          ),
        );
      }
      eventQueue.push(null); // sentinel
      signal();
    },
  });

  const stream = new ReadableStream({
    pull(controller) {
      return new Promise<void>((resolve) => {
        if (eventQueue.length > 0) {
          const item = eventQueue.shift()!;
          if (item === null) {
            controller.close();
          } else {
            controller.enqueue(item);
          }
          resolve();
          return;
        }
        pullResolver = resolve;
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
});

export default questions;
