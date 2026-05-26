import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { unlink } from "node:fs/promises";
import { calculateTitle, changePasswordSchema, updateUserSchema, userParamsSchema, UserProfileResponse } from "../lib/users_lib";
import type { Env } from "../types";

const users = new Hono<Env>();

// Get user profile
users.get("/:username", zValidator("param", userParamsSchema), async (c) => {
  const username = c.req.valid("param").username;
  const prisma = c.var.prisma;

  const existingUser = await prisma.user.findUnique({
    where: {
      username: username
    }
  });

  if (!existingUser) {
    return c.json({ error: "User not found" }, 404);
  }

  return c.json<UserProfileResponse>({
    message: "Profile retrieved successfully",
    user: {
      id: existingUser.id,
      username: existingUser.username,
      bio: existingUser.bio,
      avatarUrl: existingUser.avatarUrl,
      exp: existingUser.exp,
      title: calculateTitle(existingUser.exp)
    }
  }, 200);
});

// Update profile
users.patch("/me", zValidator("json", updateUserSchema), async (c) => {
  const prisma = c.var.prisma;
  const userId = c.var.jwtPayload.sub;

  const newBio = c.req.valid("json").bio;
  const newUsername = c.req.valid("json").username;

  if (newUsername) {
    const existingUser = await prisma.user.findUnique({
      where: {
        username: newUsername
      }
    });

    if (existingUser && existingUser.id !== userId) {
      return c.json({ error: "Username is already taken" }, 409);
    }
  }

  try {
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          bio: newBio,
          username: newUsername
        },
        select: {
          id: true,
          username: true,
          bio: true,
          avatarUrl: true,
          exp: true,
          title: true
        }
      });

      return c.json<UserProfileResponse>({ 
        message: "Profile updated successfully", 
        user: updatedUser 
      }, 200);

    } catch (error) {
      console.error("Failed to update profile:", error);
      return c.json({ error: "Failed to update profile" }, 500);
    }
});

// Change password
users.patch("/me/password", zValidator("json", changePasswordSchema), async (c) => {
  const prisma = c.var.prisma;
  const { currentPassword, newPassword } = c.req.valid("json");
  const userId = c.var.jwtPayload.sub;

  const user = await prisma.user.findUnique({
    where: {
      id: userId
    },
    select: {
      passwordHash: true
    }
  });

  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  if (!user.passwordHash) {
    return c.json({ error: "Cannot change password for OAuth account" }, 400);
  }

  const matching = await Bun.password.verify(currentPassword, user.passwordHash);
  if (!matching) {
    return c.json({ error: "Incorrect current password" }, 401);
  }

  const newPasswordHash = await Bun.password.hash(newPassword);

  await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      passwordHash: newPasswordHash
    }
  });

  return c.json({ message: "Password updated successfully" }, 200);
});

users.delete("/me", async (c) => {
  const prisma = c.var.prisma;
  const userId = c.var.jwtPayload.sub;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        avatarUrl: true
      }
    });

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    await prisma.user.delete({
      where: {
        id: userId
      }
    });

    if (user.avatarUrl) {
      try {
        await unlink(`static/${user.avatarUrl}`);
      } catch (err) {
        console.warn(`Could not delete avatar file for deleted user: ${userId}`);
      }
    }

    return c.json({ message: "Account successfully deleted" }, 200);
  } catch (err) {
    console.error(`Failed to delete account: ${err}`);
    return c.json({ error: "Failed to delete account" }, 500);
  }
});

// Avatar upload
users.post("/avatar", async (c) => {
  const payload = c.var.jwtPayload;
  const userId = payload.sub;

  // Parse the multipart/form-data body
  const body = await c.req.parseBody();
  const file = body["image"];

  if (!file || !(file instanceof File)) {
    return c.json({ error: "An image file is required" }, 400);
  }

  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedMimeTypes.includes(file.type)) {
    return c.json({ 
      error: "Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed." 
    }, 415);
  }

  const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3 MB in bytes
  if (file.size > MAX_FILE_SIZE) {
    return c.json({ 
      error: "File size exceeds the 3MB limit. Please upload a smaller image." 
    }, 413); // 413 Payload Too Large
  }

  const prisma = c.var.prisma;
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatarUrl: true }
  });

  const extension = file.name.split('.').pop();
  const uniqueFilename = `avatar-${userId}.${extension}`;
  const diskPath = `static/${uniqueFilename}`; // `static` dir will be in `backend/`

  try {
    await Bun.write(diskPath, file);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: uniqueFilename },
    });

    if (currentUser?.avatarUrl && currentUser.avatarUrl !== uniqueFilename) {
      try {
        const oldAvatar = `static/${currentUser.avatarUrl}`
        await unlink(`${oldAvatar}`);
      } catch (err) {
        console.error("Failed to delete old avatar:", err); 
      }
    }

    return c.json<UserProfileResponse>({ 
      message: "Avatar uploaded successfully", 
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        bio: updatedUser.bio,
        avatarUrl: updatedUser.avatarUrl,
        exp: updatedUser.exp,
        title: calculateTitle(updatedUser.exp)
      } 
    }, 200);

  } catch (error) {
    console.error("Failed to save image:", error);
    return c.json({ error: "Failed to upload image" }, 500);
  }
});

export default users;
