import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import { AuthError, AuthResponse, loginSchema, registerSchema } from "../lib/auth_lib";
import type { Env } from "../types";

const auth = new Hono<Env>();

auth.post("/register", zValidator("json", registerSchema), async (c) => {
  const prisma = c.var.prisma;
  const { email, username, password } = c.req.valid("json");

  if (!email || !username || !password) {
    return c.json<AuthError>({ error: "Email, username, and password are required" }, 400);
  }

  // Check if user already exists
  const existingEmail = await prisma.user.findUnique({ 
    where: {
      email: email
    }
  });

  if (existingEmail) {
    return c.json<AuthError>({ error: "Email is already in use" }, 409);
  }

  const existingUsername = await prisma.user.findUnique({
    where: {
      username: username
    }
  });

  if (existingUsername) {
    return c.json<AuthError>({ error: "Username is already in use" }, 409);
  }

  // Create new user
  const passwordHash = await Bun.password.hash(password);

  const user = await prisma.user.create({
    data: {
      email: email,
      username: username,
      passwordHash: passwordHash
    }
  });

  // Generate JWT token
  const payload = {
    sub: user.id,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
  };

  const token = await sign(payload, c.var.jwtSecret);

  return c.json<AuthResponse>({
    message: "User registered successfully",
    token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username
    }
  }, 201);
});


auth.post("/login", zValidator("json", loginSchema), async (c) => {
  const prisma = c.var.prisma;
  const { identifier, password } = c.req.valid("json");

  if (!identifier || !password) {
    return c.json({error: "Email/username and password are required"}, 400);
  }

  // Check if user exists
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: identifier },
        { username: identifier }
      ]
    }
  });

  if (!user) {
    return c.json<AuthError>({ error: "User not found"}, 401);
  }

  // Reject traditional login for OAuth users without password
  if (!user.passwordHash) {
    return c.json<AuthError>({ error: "Invalid credentials"}, 401);
  }

  const passwordMatching = await Bun.password.verify(password, user.passwordHash);
  if (!passwordMatching) {
    return c.json<AuthError>({ error: "Invalid credentials"}, 401);
  }

  // Successful login
  const payload = {
    sub: user.id,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
  };

  const token = await sign(payload, c.var.jwtSecret);

  return c.json<AuthResponse>({
    message: "Login successful",
    token: token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username
    }
  }, 200)
});

export default auth;