export interface FetchQuestionsOptions {
  amount: number;
  category?: number;
  difficulty?: "easy" | "medium" | "hard";
  type?: "multiple" | "boolean";
}

export interface OpenTDBQuestion {
  type: "multiple" | "boolean";
  difficulty: "easy" | "medium" | "hard";
  category: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

export interface OpenTDBResponse {
  response_code: number;
  results: OpenTDBQuestion[];
}

export interface OpenTDBCategory {
  id: number;
  name: string;
}

interface OpenTDBCategoriesResponse {
  trivia_categories: OpenTDBCategory[];
}

export class OpenTDBError extends Error {
  constructor(
    public code: number,
    message: string,
  ) {
    super(message);
    this.name = "OpenTDBError";
  }
}

/**
 * Fetches questions from the Open Trivia Database API.
 *
 * @param options - Configure the amount, category, difficulty, and type of questions.
 * @returns A promise that resolves to an array of OpenTDBQuestion.
 * @throws {OpenTDBError} When the API responds with a non-zero response code.
 * @throws {Error} On network or JSON parse errors.
 */
export async function fetchQuestions(
  options: FetchQuestionsOptions,
): Promise<OpenTDBQuestion[]> {
  const url = new URL("https://opentdb.com/api.php");

  url.searchParams.append("amount", options.amount.toString());

  if (options.category) {
    url.searchParams.append("category", options.category.toString());
  }

  if (options.difficulty) {
    url.searchParams.append("difficulty", options.difficulty);
  }

  if (options.type) {
    url.searchParams.append("type", options.type);
  }

  const response = await fetch(url.toString());

  if (response.status === 429) {
    throw new OpenTDBError(
      5,
      "Rate Limit: Too many requests have occurred. Each IP can only access the API once every 5 seconds.",
    );
  }

  if (!response.ok) {
    throw new Error(
      `Failed to fetch from OpenTDB API: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as OpenTDBResponse;

  switch (data.response_code) {
    case 0: // Success
      return data.results;
    case 1:
      throw new OpenTDBError(
        1,
        "No Results: Could not return results. The API doesn't have enough questions for your query. (ex. Asking for 50 Questions in a Category that only has 20.)",
      );
    case 2:
      throw new OpenTDBError(2, "Invalid Parameter: Contains an invalid parameter.");
    case 3:
      throw new OpenTDBError(3, "Token Not Found: Session Token does not exist.");
    case 4:
      throw new OpenTDBError(
        4,
        "Token Empty: Session Token has returned all possible questions for the specified query.",
      );
    case 5:
      throw new OpenTDBError(
        5,
        "Rate Limit: Too many requests have occurred. Each IP can only access the API once every 5 seconds.",
      );
    default:
      throw new OpenTDBError(
        data.response_code,
        `Unknown OpenTDB response code: ${data.response_code}`,
      );
  }
}

/**
 * Fetches all available categories from Open Trivia Database.
 */
export async function fetchCategories(): Promise<OpenTDBCategory[]> {
  const response = await fetch("https://opentdb.com/api_category.php");

  if (!response.ok) {
    throw new Error(
      `Failed to fetch categories from OpenTDB API: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as OpenTDBCategoriesResponse;
  return Array.isArray(data.trivia_categories) ? data.trivia_categories : [];
}
