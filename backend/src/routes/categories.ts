import { Hono } from "hono";
import { queueManager } from "../lib/sseQueue";

const categories = new Hono();

categories.get("/", async (c) => {
  const connectionId = crypto.randomUUID();
  const encoder = new TextEncoder();

  // Use a TransformStream for writing SSE events
  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
  const writer = writable.getWriter();

  const sendEvent = (event: string, data: unknown) => {
    writer.write(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
  };

  // Register position update listener
  queueManager.onPositionUpdate(
    connectionId,
    (position, totalInQueue, estimatedWaitSeconds) => {
      sendEvent("queue", { position, totalInQueue, estimatedWaitSeconds });
    },
  );

  // Add entry to queue
  queueManager.addEntry({
    id: connectionId,
    type: "categories",
    status: "waiting",
    enqueuedAt: Date.now(),
    resolve: (value) => {
      if (value.type === "result") {
        sendEvent("result", { data: value.data });
      } else {
        sendEvent("error", { message: value.message });
      }
      writer.close();
    },
  });

  // Set SSE headers
  c.header("Content-Type", "text/event-stream");
  c.header("Cache-Control", "no-cache");
  c.header("Connection", "keep-alive");

  return c.body(readable);
});

export default categories;
