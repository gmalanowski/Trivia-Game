import { Hono } from "hono";
import withPrisma from "./lib/prisma";
import users from "./routes/users";
import type { Env } from "./types";

const app = new Hono<Env>();

app.use("*", withPrisma);

app.route("/api/v1/users", users);

app.get("/health", (c) => {
	return c.json({ status: "ok" }, 200);
});

export default app;
