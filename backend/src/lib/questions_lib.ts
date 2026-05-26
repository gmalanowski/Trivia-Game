import { z } from "zod";

// Fisher-Yates shuffle algorithm for answer randomizing
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return shuffled;
}

const answerSchema = z.object({
  resultId: z.uuid("Invalid result ID format"),
  userAnswer: z.string().nullable().optional(), 
});

export const finishQuizSchema = z.object({
  answers: z.array(answerSchema).min(1, "At least one answer must be submitted"),
});