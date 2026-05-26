import { type FetchQuestionsOptions, fetchCategories, fetchQuestions } from "./opentdb";

export interface QueueEntry {
  id: string;
  type: "questions" | "categories";
  options?: FetchQuestionsOptions;
  status: "waiting" | "processing" | "done" | "error";
  enqueuedAt: number;
  resolve: (
    value: { type: "result"; data: unknown } | { type: "error"; message: string },
  ) => void;
}

class SseQueueManager {
  private queue: QueueEntry[] = [];
  private isProcessing = false;
  private lastRequestTime = 0;
  private positionUpdateListeners: Map<
    string,
    (position: number, totalInQueue: number, estimatedWaitSeconds: number) => void
  > = new Map();

  onPositionUpdate(
    id: string,
    listener: (
      position: number,
      totalInQueue: number,
      estimatedWaitSeconds: number,
    ) => void,
  ): void {
    this.positionUpdateListeners.set(id, listener);
  }

  removeListener(id: string): void {
    this.positionUpdateListeners.delete(id);
  }

  addEntry(entry: QueueEntry): void {
    this.queue.push(entry);
    this.broadcastPositions();
    this.processNext();
  }

  private broadcastPositions(): void {
    for (let i = 0; i < this.queue.length; i++) {
      const entry = this.queue[i]!;
      const listener = this.positionUpdateListeners.get(entry.id);
      if (listener && entry.status === "waiting") {
        const position = i + 1;
        const estimatedWaitSeconds = (position - 1) * 5;
        listener(position, this.queue.length, estimatedWaitSeconds);
      }
    }
  }

  private async processNext(): Promise<void> {
    if (this.isProcessing) return;
    if (this.queue.length === 0) return;

    const entry = this.queue[0]!;
    if (entry.status !== "waiting") return;

    this.isProcessing = true;
    entry.status = "processing";

    // Broadcast that we're now processing this entry
    const listener = this.positionUpdateListeners.get(entry.id);
    if (listener) listener(1, this.queue.length, 0);

    // Rate limit: ensure at least 5 seconds since last request
    const now = Date.now();
    const timeSinceLast = now - this.lastRequestTime;
    if (timeSinceLast < 5000) {
      await new Promise((resolve) => setTimeout(resolve, 5000 - timeSinceLast));
    }

    try {
      this.lastRequestTime = Date.now();

      let result: unknown;
      if (entry.type === "categories") {
        result = await fetchCategories();
      } else if (entry.options) {
        result = await fetchQuestions(entry.options);
      } else {
        throw new Error("Invalid queue entry: no options provided");
      }

      entry.status = "done";
      entry.resolve({ type: "result", data: result });
    } catch (error) {
      entry.status = "error";
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      entry.resolve({ type: "error", message });
    }

    // Remove the processed entry from queue
    this.queue.shift();
    this.isProcessing = false;

    // Update remaining clients of new positions
    this.broadcastPositions();

    // Process next in queue
    this.processNext();
  }

  // Cancel a waiting entry (client disconnected)
  cancelEntry(id: string): void {
    const index = this.queue.findIndex((e) => e.id === id);
    if (index === -1) return;

    const entry = this.queue[index]!;
    if (entry.status === "waiting") {
      this.queue.splice(index, 1);
      this.positionUpdateListeners.delete(id);
      entry.resolve({ type: "error", message: "Request cancelled" });
      this.broadcastPositions();
    }
  }

  getQueueLength(): number {
    return this.queue.length;
  }
}

// Singleton instance
export const queueManager = new SseQueueManager();
