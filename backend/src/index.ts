import { Hono } from "hono";
import { cors } from "hono/cors";
import withPrisma from "./lib/prisma";
import questions from "./routes/questions";
import users from "./routes/users";
import type { Env } from "./types";

const app = new Hono<Env>();

app.use("/api/*", cors());
app.use("*", withPrisma);

app.route("/api/v1/users", users);
app.route("/api/v1/questions", questions);

app.get("/health", (c) => {
  return c.json({ status: "ok" }, 200);
});

export default app;
