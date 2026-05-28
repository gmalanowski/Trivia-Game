import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { Difficulty } from "../generated/prisma/enums";
import type { FetchQuestionsOptions } from "../lib/opentdb";
import { fetchQuestions, OpenTDBError } from "../lib/opentdb";
import { finishQuizSchema, shuffleArray } from "../lib/questions_lib";
import { Env } from "../types";

const questions = new Hono<Env>();

// Get questions (for Users that are not logged in)
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

// Start a QuizSession and fetch questions (for Users that are logged in)
questions.post("/start", async (c) => {
  const prisma = c.var.prisma;
  const userId = c.var.jwtPayload.sub;

  if (!userId) {
    return c.json({ error: "userId is required to start a session." }, 400);
  }

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

  let prismaDifficulty: Difficulty | undefined = undefined;

  if (
    difficultyParam === "easy" ||
    difficultyParam === "medium" ||
    difficultyParam === "hard"
  ) {
    options.difficulty = difficultyParam;
    prismaDifficulty = difficultyParam.toUpperCase() as Difficulty;
  }

  if (typeParam === "multiple" || typeParam === "boolean") {
    options.type = typeParam;
  }

  try {
    const data = await fetchQuestions(options);

    const readableCategory = data[0]?.category || null;

    const session = await prisma.quizSession.create({
      data: {
        userId: userId,
        totalQuestions: amount,
        category: readableCategory, 
        difficulty: prismaDifficulty,
      },
    });

    const resultsData = data.map((q) => ({
      sessionId: session.id,
      questionText: q.question,
      correctAnswer: q.correct_answer,
      isCorrect: false,
      userAnswer: null,
    }));

    await prisma.quizResult.createMany({
      data: resultsData,
    });

    const savedResults = await prisma.quizResult.findMany({
      where: { sessionId: session.id },
      select: { id: true, questionText: true }
    });

    const formattedQuestions = data.map((q) => {
      const combinedAnswers = [q.correct_answer, ...q.incorrect_answers];
      const dbResult = savedResults.find(r => r.questionText === q.question);

      const { correct_answer, incorrect_answers, ...rest } = q;

      return {
        ...rest,
        resultId: dbResult?.id,
        correctAnswer: q.correct_answer,
        answers: shuffleArray(combinedAnswers)
      };
    });

    return c.json({
        sessionId: session.id,
        sessionStatus: session.status,
        questions: formattedQuestions 
    }, 200);

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
      console.log(error.message, error.code);
      return c.json({ error: error.message, code: error.code }, httpStatus);
    }

    console.error("OpenTDB API Error:", error);
    return c.json(
      { error: "An unexpected error occurred while fetching questions." },
      500,
    );
  }
});

// Finish a QuizSession and award EXP
questions.post("/:sessionId/finish", zValidator("json", finishQuizSchema), async (c) => {
  const prisma = c.var.prisma;
  const userId = c.var.jwtPayload.sub;
  const sessionId = c.req.param("sessionId");
  const { answers } = c.req.valid("json");

  try {
    const session = await prisma.quizSession.findUnique({
      where: { id: sessionId },
      include: { results: true },
    });

    if (!session) {
      return c.json({ error: "Quiz session not found." }, 404);
    }

    if (session.userId !== userId) {
      return c.json({ error: "Unauthorized access to this session." }, 403);
    }

    if (session.status !== "IN_PROGRESS") {
      return c.json({ error: `Cannot finish. Session is already ${session.status.toLowerCase()}.` }, 400);
    }

    let finalScore = 0;
    const updateOperations = [];

    for (const submittedAnswer of answers) {
      const dbRecord = session.results.find(r => r.id === submittedAnswer.resultId);
  
      if (!dbRecord) {
        continue;
      }

      const isCorrect = submittedAnswer.userAnswer === dbRecord.correctAnswer;

      if (isCorrect) {
        finalScore++;
      }

      updateOperations.push(
        prisma.quizResult.update({
          where: { id: dbRecord.id },
          data: {
            userAnswer: submittedAnswer.userAnswer || null,
            isCorrect: isCorrect
          }
        })
      );
    }

    const expGained = finalScore;

    await prisma.$transaction([
      ...updateOperations,
        
      prisma.quizSession.update({
        where: { id: sessionId },
        data: {
          status: "COMPLETED",
          score: finalScore,
          endedAt: new Date(),
        },
      }),
        
      prisma.user.update({
        where: { id: userId },
        data: {
          exp: { increment: expGained },
        },
      }),
    ]);

    return c.json({
      message: "Quiz completed successfully!",
      score: finalScore,
      totalQuestions: session.totalQuestions,
      expGained: expGained,
    }, 200);
  } catch (error) {
    console.error("Failed to finish quiz session:", error);
    return c.json({ error: "Failed to grade and save results." }, 500);
  }
});

export default questions;
