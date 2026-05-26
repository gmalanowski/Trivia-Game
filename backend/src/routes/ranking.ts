import { Hono } from "hono";
import type { Env } from "../types";

const ranking = new Hono<Env>();

ranking.get("/", async (c) => {
  const prisma = c.var.prisma;

  const highestExpUsers = await prisma.user.findMany({
    select: {
      username: true,
      exp: true,
      title: true,
      avatarUrl: true // zapytac czy frontend to chce
    },
    orderBy: {
      exp: "desc"
    },
    take: 10
  });

  return c.json(highestExpUsers, 200);
});