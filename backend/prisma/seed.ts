import { PrismaPg } from "@prisma/adapter-pg";
import { type Prisma, PrismaClient } from "../src/generated/prisma/client.js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is missing");
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

const userData: Prisma.UserCreateInput[] = [
  {
    email: "alice@prisma.io",
    username: "alice",
    passwordHash: "$2a$12$4P261CVY4ym4Qn6U47h7t.sORrhhqlH53KMiVG5joAGEIkZQgXuIC",
    sessions: {
      create: [
        {
          totalQuestions: 2,
          score: 1,
          status: "COMPLETED",
          category: "Science",
          difficulty: "EASY",
          results: {
            create: [
              {
                questionText: "What is H2O?",
                correctAnswer: "Water",
                userAnswer: "Water",
                isCorrect: true,
              },
              {
                questionText: "What is the powerhouse of the cell?",
                correctAnswer: "Mitochondria",
                userAnswer: "Nucleus",
                isCorrect: false,
              },
            ],
          },
        },
      ],
    },
  },
  {
    email: "bob@prisma.io",
    username: "bob",
  },
];

export async function main() {
  for (const u of userData) {
    await prisma.user.create({ data: u });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
