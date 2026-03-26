import { Hono } from "hono";
import type { Env } from "../types";

// Przykladowy endpoint zeby zobaczyc czy dziala

const users = new Hono<Env>();

users.get("/", async (c) => {
  const prisma = c.var.prisma;
  const users = await prisma.user.findMany({
    include: { posts: true },
  });
  return c.json({ users });
});

export default users;
