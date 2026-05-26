// src/services/sseService.js

const BACKEND_URL = "http://localhost:3000/api/v1";

/**
 * Creates an SSE connection to fetch questions from the queue-managed endpoint.
 * @param {Object} params - { amount, difficulty, category }
 * @returns {Object} { close, onQueueUpdate, onResult, onHeartbeat, onError }
 */
export function createQuestionSSE({
  amount = 10,
  difficulty = "medium",
  category = "",
} = {}) {
  const categoryParam = category ? `&category=${category}` : "";
  const url = `${BACKEND_URL}/questions?amount=${amount}&difficulty=${difficulty}${categoryParam}`;

  const eventSource = new EventSource(url);

  const callbacks = {
    queueUpdate: null,
    result: null,
    heartbeat: null,
    error: null,
  };

  eventSource.addEventListener("queue", (e) => {
    const data = JSON.parse(e.data);
    if (callbacks.queueUpdate) callbacks.queueUpdate(data);
  });

  eventSource.addEventListener("result", (e) => {
    const data = JSON.parse(e.data);
    if (callbacks.result) callbacks.result(data.data);
    eventSource.close();
  });

  eventSource.addEventListener("heartbeat", (e) => {
    if (callbacks.heartbeat) callbacks.heartbeat();
  });

  eventSource.addEventListener("error", (e) => {
    // EventSource will also fire 'error' on connection issues
    // Try to parse JSON if data is present
    if (e.data) {
      try {
        const data = JSON.parse(e.data);
        if (callbacks.error) callbacks.error(data.message);
      } catch {
        if (callbacks.error) callbacks.error("Connection error");
      }
    } else {
      if (callbacks.error) callbacks.error("Connection error");
    }
    eventSource.close();
  });

  return {
    close: () => eventSource.close(),
    onQueueUpdate: (cb) => {
      callbacks.queueUpdate = cb;
    },
    onResult: (cb) => {
      callbacks.result = cb;
    },
    onHeartbeat: (cb) => {
      callbacks.heartbeat = cb;
    },
    onError: (cb) => {
      callbacks.error = cb;
    },
  };
}

/**
 * Creates an SSE connection to fetch categories from the queue-managed endpoint.
 * @returns {Object} { close, onQueueUpdate, onResult, onHeartbeat, onError }
 */
export function createCategoriesSSE() {
  const url = `${BACKEND_URL}/categories`;

  const eventSource = new EventSource(url);

  const callbacks = {
    queueUpdate: null,
    result: null,
    heartbeat: null,
    error: null,
  };

  eventSource.addEventListener("queue", (e) => {
    const data = JSON.parse(e.data);
    if (callbacks.queueUpdate) callbacks.queueUpdate(data);
  });

  eventSource.addEventListener("result", (e) => {
    const data = JSON.parse(e.data);
    if (callbacks.result) callbacks.result(data.data);
    eventSource.close();
  });

  eventSource.addEventListener("heartbeat", (e) => {
    if (callbacks.heartbeat) callbacks.heartbeat();
  });

  eventSource.addEventListener("error", (e) => {
    if (e.data) {
      try {
        const data = JSON.parse(e.data);
        if (callbacks.error) callbacks.error(data.message);
      } catch {
        if (callbacks.error) callbacks.error("Connection error");
      }
    } else {
      if (callbacks.error) callbacks.error("Connection error");
    }
    eventSource.close();
  });

  return {
    close: () => eventSource.close(),
    onQueueUpdate: (cb) => {
      callbacks.queueUpdate = cb;
    },
    onResult: (cb) => {
      callbacks.result = cb;
    },
    onHeartbeat: (cb) => {
      callbacks.heartbeat = cb;
    },
    onError: (cb) => {
      callbacks.error = cb;
    },
  };
}
