// src/services/api.js

const BACKEND_URL = "http://localhost:3000/api/v1";

// Note: Questions and Categories now use SSE via services/sseService.js
// to handle the OpenTDB rate limit (1 request per 5 seconds) with a queue.
// Direct REST endpoints for these are replaced by Server-Sent Events.
// Use createQuestionSSE() and createCategoriesSSE() from ./sseService.js instead.

// This file still exports helper functions for any non-SSE endpoints.

/**
 * Fetches quiz questions using SSE (Server-Sent Events) to handle rate limiting.
 * Prefer using createQuestionSSE() from ./sseService.js instead.
 * @deprecated Use createQuestionSSE() from sseService.js
 */
export const fetchQuizQuestions = async (
  amount = 10,
  difficulty = "medium",
  category = "",
) => {
  try {
    const categoryParam = category ? `&category=${category}` : "";
    const url = `${BACKEND_URL}/questions?amount=${amount}&difficulty=${difficulty}${categoryParam}`;
    const response = await fetch(url);

    if (!response.ok) {
      let backendMessage = `Server error: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData?.error) {
          backendMessage = errorData.error;
        }
      } catch {
        // Ignore JSON parse errors and keep default message.
      }
      throw new Error(backendMessage);
    }

    const questionsArray = await response.json();
    return questionsArray;
  } catch (error) {
    console.error("Error while fetching questions from backend:", error);
    throw error;
  }
};

/**
 * Fetches categories using SSE (Server-Sent Events) to handle rate limiting.
 * Prefer using createCategoriesSSE() from ./sseService.js instead.
 * @deprecated Use createCategoriesSSE() from sseService.js
 */
export const fetchCategories = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/categories`);
    if (!response.ok) throw new Error("Failed to fetch categories");
    return await response.json();
  } catch (error) {
    console.error("Category fetch error:", error);
    throw error;
  }
};
