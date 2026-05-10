import { beforeEach, describe, expect, it, mock, spyOn } from "bun:test";
import { Hono } from "hono";
import * as fsPromises from "node:fs/promises";
import users from "./users";

const mockPrisma = {
  user: {
    findUnique: mock(),
    update: mock(),
    delete: mock(),
  },
};

const createTestApp = (userId = "user-123") => {
  const app = new Hono<any>();
  
  app.use("*", async (c, next) => {
    c.set("prisma", mockPrisma);
    c.set("jwtPayload", { sub: userId });
    await next();
  });

  app.route("/users", users);
  
  return app;
};

describe("Users Routes", () => {
  let app: Hono<any>;

  beforeEach(() => {
    app = createTestApp();
    
    mockPrisma.user.findUnique.mockReset();
    mockPrisma.user.update.mockReset();
    mockPrisma.user.delete.mockReset();
    
    Bun.password.verify = mock();
    Bun.password.hash = mock();
  });

  describe("GET /:username", () => {
    it("should return 404 if user is not found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const res = await app.request("/users/johndoe");
      expect(res.status).toBe(404);
      expect(await res.json()).toEqual({ error: "User not found" });
    });

    it("should return 400 for invalid username format (Zod validation)", async () => {
      // Username less than 3 chars
      const res = await app.request("/users/ab"); 
      expect(res.status).toBe(400);
    });

    it("should return user profile successfully", async () => {
      const mockUser = {
        id: "user-123",
        username: "johndoe",
        bio: "Hello world",
        avatarUrl: "avatar.png",
        title: "Developer",
        passwordHash: "hidden"
      };
      
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const res = await app.request("/users/johndoe");
      expect(res.status).toBe(200);
      
      const body = await res.json();
      expect(body.message).toBe("Profile retrieved successfully");
      expect(body.user).toEqual({
        id: mockUser.id,
        username: mockUser.username,
        bio: mockUser.bio,
        avatarUrl: mockUser.avatarUrl,
        title: mockUser.title
      });
      expect(body.user.passwordHash).toBeUndefined();
    });
  });

  describe("PATCH /me", () => {
    it("should update and return the user profile", async () => {
      const updateData = { bio: "New bio", username: "new_johndoe" };
      
      mockPrisma.user.findUnique.mockResolvedValue(null); 
      mockPrisma.user.update.mockResolvedValue({ id: "user-123", ...updateData });

      const res = await app.request("/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.message).toBe("Profile updated successfully");
      expect(body.user.bio).toBe("New bio");
    });

    it("should return 409 if new username is already taken", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: "another-user-id", username: "taken_name" });

      const res = await app.request("/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "taken_name" }),
      });

      expect(res.status).toBe(409);
      expect(await res.json()).toEqual({ error: "Username is already taken" });
    });

    it("should return 500 if DB update fails", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.update.mockRejectedValue(new Error("DB Error"));

      const res = await app.request("/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio: "Failing bio" }),
      });

      expect(res.status).toBe(500);
      expect(await res.json()).toEqual({ error: "Failed to update profile" });
    });
  });

  describe("PATCH /me/password", () => {
    const payload = {
      currentPassword: "oldpassword",
      newPassword: "newpassword123!"
    };

    it("should return 404 if user not found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const res = await app.request("/users/me/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(404);
    });

    it("should return 400 if user has no passwordHash (OAuth)", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ passwordHash: null });

      const res = await app.request("/users/me/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ error: "Cannot change password for OAuth account" });
    });

    it("should return 401 if current password does not match", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ passwordHash: "hashed_old" });
      (Bun.password.verify as any).mockResolvedValue(false);

      const res = await app.request("/users/me/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ error: "Incorrect current password" });
    });

    it("should successfully update password", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ passwordHash: "hashed_old" });
      (Bun.password.verify as any).mockResolvedValue(true);
      (Bun.password.hash as any).mockResolvedValue("hashed_new");
      mockPrisma.user.update.mockResolvedValue({});

      const res = await app.request("/users/me/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(200);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-123" },
        data: { passwordHash: "hashed_new" }
      });
    });
  });

  describe("DELETE /me", () => {
    let unlinkSpy: any;

    beforeEach(() => {
      unlinkSpy = spyOn(fsPromises, "unlink").mockResolvedValue(undefined);
    });

    it("should return 404 if user not found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const res = await app.request("/users/me", { method: "DELETE" });
      expect(res.status).toBe(404);
    });

    it("should delete user and not call unlink if no avatarUrl exists", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ avatarUrl: null });
      mockPrisma.user.delete.mockResolvedValue({});

      const res = await app.request("/users/me", { method: "DELETE" });

      expect(res.status).toBe(200);
      expect(mockPrisma.user.delete).toHaveBeenCalledWith({ where: { id: "user-123" } });
      expect(unlinkSpy).not.toHaveBeenCalled();
    });

    it("should delete user and call unlink if avatarUrl exists", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ avatarUrl: "test-avatar.jpg" });
      mockPrisma.user.delete.mockResolvedValue({});

      const res = await app.request("/users/me", { method: "DELETE" });

      expect(res.status).toBe(200);
      expect(unlinkSpy).toHaveBeenCalledWith("static/test-avatar.jpg");
    });

    it("should return 500 if deletion throws an error", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ avatarUrl: null });
      mockPrisma.user.delete.mockRejectedValue(new Error("DB Failure"));

      const res = await app.request("/users/me", { method: "DELETE" });

      expect(res.status).toBe(500);
    });
  });
});