import { Hono } from "hono";
import { unlink } from "node:fs/promises";
import { UserProfileResponse } from "../lib/users_lib";
import { Env } from "../types";

const upload_avatar = new Hono<Env>();

upload_avatar.post("/avatar", async (c) => {
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
        bio: updatedUser.bio || "",
        avatarUrl: updatedUser.avatarUrl || "",
        title: updatedUser.title || ""
      } 
    }, 200);

  } catch (error) {
    console.error("Failed to save image:", error);
    return c.json({ error: "Failed to upload image" }, 500);
  }
});

export default upload_avatar;