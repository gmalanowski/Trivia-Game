import { Hono } from "hono";
import { calculateTitle } from "../lib/users_lib";
import type { Env } from "../types";

const leaderboard = new Hono<Env>();

leaderboard.get("/", async (c) => {
  const prisma = c.var.prisma;

  const highestExpUsers = await prisma.user.findMany({
    select: {
      username: true,
      exp: true,
      avatarUrl: true
    },
    orderBy: {
      exp: "desc"
    },
    take: 10
  });

  const leaderboardWithTitles = highestExpUsers.map((user) => {
    return {
      ...user,
      title: calculateTitle(user.exp)
    };
  });

  return c.json(leaderboardWithTitles, 200);
});

export default leaderboard;