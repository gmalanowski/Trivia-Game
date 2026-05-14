import z from "zod";

export interface AuthResponse {
  message: string,
  token: string,
  user: {
    id: string,
    email: string,
    username: string
  }
}

export interface AuthError {
  error: string
}

export const registerSchema = z.object({
  username: z.string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username cannot exceed 30 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores allowed"),
  email: z.email("Email must be valid"),
  password: z.string().min(12, "Password must be at least 12 characters"),
});

export const loginSchema = z.object({
  identifier: z.string().min(3),
  password: z.string().min(12, "Password must be at least 12 characters")
})