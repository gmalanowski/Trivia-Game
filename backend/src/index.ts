import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { cors } from "hono/cors";
import { jwt } from "hono/jwt";
import { logger } from "hono/logger";
import withPrisma from "./lib/prisma";
import auth from "./routes/auth";
import categories from "./routes/categories";
import leaderboard from "./routes/leaderboard";
import questions from "./routes/questions";
import users from "./routes/users";
import type { Env } from "./types";

const jwtSecret = Bun.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error("FATAL: JWT_SECRET is not set in .env");
}

const app = new Hono<Env>();

app.use('*', async (c, next) => {
  c.set('jwtSecret', jwtSecret)
  await next()
});
app.use(logger());
app.use("/api/*", cors());
app.use("*", withPrisma);


// Serve static images (for user avatars)
app.use("/static/*", serveStatic({
  root: "./static",
  rewriteRequestPath: (path) => path.replace(/^\/static/, ""),
  onNotFound: (path, c) => {
    console.log(`${path} is not found, you access ${c.req.path}`)
  }
}));


// Public endpoints
app.get("/health", (c) => {
  return c.json({ status: "ok" }, 200);
});


// Protected routes
app.use("/api/v1/users/*", async (c, next) => {
  const jwtMiddleware = jwt({ secret: jwtSecret, alg: "HS256" });
  return jwtMiddleware(c, next);
});

app.use("/api/v1/questions/start", async (c, next) => {
  const jwtMiddleware = jwt({ secret: jwtSecret, alg: "HS256" });
  return jwtMiddleware(c, next);
});

app.use("/api/v1/questions/:sessionId/finish", async (c, next) => {
  const jwtMiddleware = jwt({ secret: jwtSecret, alg: "HS256" });
  return jwtMiddleware(c, next);
});


// Mounted endpoints
app.route("/api/v1/auth", auth);
app.route("/api/v1/users", users);
app.route("/api/v1/questions", questions);
app.route("/api/v1/categories", categories);
app.route("/api/v1/leaderboard", leaderboard);

export default app;