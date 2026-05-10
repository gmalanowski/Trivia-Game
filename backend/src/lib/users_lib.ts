import z from "zod";

export interface UserProfileResponse {
  message: string; 
  user: {
    id: string;
    username: string;
    bio: string | null;
    avatarUrl: string | null;
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