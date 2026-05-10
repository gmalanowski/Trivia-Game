import { beforeEach, describe, expect, it, mock } from "bun:test";
import { Hono } from "hono";
import auth from "./auth";

const mockPrisma = {
  user: {
    findUnique: mock(),
    findFirst: mock(),
    create: mock(),
  },
};

const createTestApp = () => {
  const app = new Hono<any>();
  
  app.use("*", async (c, next) => {
    c.set("prisma", mockPrisma);
    c.set("jwtSecret", "test-super-secret-key");
    await next();
  });

  app.route("/auth", auth);
  
  return app;
};

describe("Auth Routes", () => {
  let app: Hono<any>;

  beforeEach(() => {
    app = createTestApp();
    
    mockPrisma.user.findUnique.mockReset();
    mockPrisma.user.findFirst.mockReset();
    mockPrisma.user.create.mockReset();
    
    Bun.password.verify = mock();
    Bun.password.hash = mock();
  });

  describe("POST /register", () => {
    const validRegisterPayload = {
      username: "testuser",
      email: "test@example.com",
      password: "securepassword123!",
    };

    it("should return 400 if Zod validation fails", async () => {
      const res = await app.request("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...validRegisterPayload, password: "short" }),
      });

      expect(res.status).toBe(400);
    });

    it("should return 409 if email is already in use", async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({ id: "user-1", email: validRegisterPayload.email });

      const res = await app.request("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validRegisterPayload),
      });

      expect(res.status).toBe(409);
      expect(await res.json()).toEqual({ error: "Email is already in use" });
    });

    it("should return 409 if username is already in use", async () => {
      mockPrisma.user.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: "user-2", username: validRegisterPayload.username });

      const res = await app.request("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validRegisterPayload),
      });

      expect(res.status).toBe(409);
      expect(await res.json()).toEqual({ error: "Username is already in use" });
    });

    it("should successfully register a new user and return a JWT", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      (Bun.password.hash as any).mockResolvedValue("hashed_password_123");
      
      const createdUser = {
        id: "new-user-id",
        email: validRegisterPayload.email,
        username: validRegisterPayload.username,
        passwordHash: "hashed_password_123"
      };
      mockPrisma.user.create.mockResolvedValue(createdUser);

      const res = await app.request("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validRegisterPayload),
      });

      expect(res.status).toBe(201);
      
      const body = await res.json();
      expect(body.message).toBe("User registered successfully");
      expect(body.token).toBeTypeOf("string");
      expect(body.user).toEqual({
        id: createdUser.id,
        email: createdUser.email,
        username: createdUser.username
      });
      
      expect(Bun.password.hash).toHaveBeenCalledWith(validRegisterPayload.password);
    });
  });

  describe("POST /login", () => {
    const validLoginPayload = {
      identifier: "testuser",
      password: "securepassword123!",
    };

    it("should return 400 if Zod validation fails", async () => {
      const res = await app.request("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: "testuser" }),
      });

      expect(res.status).toBe(400);
    });

    it("should return 401 if user is not found", async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      const res = await app.request("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validLoginPayload),
      });

      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ error: "User not found" });
    });

    it("should return 401 if trying to login to an OAuth account using a password", async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: "oauth-user",
        email: "oauth@example.com",
        username: "oauthuser",
        passwordHash: null
      });

      const res = await app.request("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validLoginPayload),
      });

      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ error: "Invalid credentials" });
    });

    it("should return 401 if the password does not match", async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: "user-1",
        passwordHash: "correct_hash"
      });
      (Bun.password.verify as any).mockResolvedValue(false);

      const res = await app.request("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validLoginPayload),
      });

      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ error: "Invalid credentials" });
    });

    it("should successfully log in and return a JWT", async () => {
      const dbUser = {
        id: "user-1",
        email: "test@example.com",
        username: "testuser",
        passwordHash: "correct_hash"
      };
      
      mockPrisma.user.findFirst.mockResolvedValue(dbUser);
      (Bun.password.verify as any).mockResolvedValue(true);

      const res = await app.request("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validLoginPayload),
      });

      expect(res.status).toBe(200);
      
      const body = await res.json();
      expect(body.message).toBe("Login successful");
      expect(body.token).toBeTypeOf("string");
      expect(body.user).toEqual({
        id: dbUser.id,
        email: dbUser.email,
        username: dbUser.username
      });
      
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: validLoginPayload.identifier },
            { username: validLoginPayload.identifier }
          ]
        }
      });
    });
  });
});