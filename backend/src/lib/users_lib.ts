import z from "zod";
import { PrismaClient, Title } from "../generated/prisma/client";

export interface UserProfileResponse {
  message: string; 
  user: {
    id: string;
    username: string;
    bio: string | null;
    avatarUrl: string | null;
    exp: number | null;
    title: string | null;
  };
}

export const userParamsSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores allowed"),
});

export const updateUserSchema = z.object({
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores allowed")
    .optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(12, "New password must be at least 12 characters"),
});


export async function updateTitle(userId: string, prisma: PrismaClient) {
  const existingUser = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });

  if (!existingUser) {
    throw Error("Title couldn't be updated. User not found.");
  }

  let rank = Math.floor(existingUser.exp / 1000);
  const titleArray = Object.values(Title);
  console.log(titleArray);

  if (rank >= titleArray.length) {
    rank = titleArray.length - 1;
  } 

  const newTitle = titleArray[rank];

  if (existingUser.title == newTitle) {
    return;
  }

  prisma.user.update({
    where: {
      id: userId
    },
    data: {
      title: newTitle
    }
  });

}