import z from "zod";

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

export const TITLE_THRESHOLDS = [
  { minExp: 20000, title: 'PINNACLE' },
  { minExp: 19000, title: 'LEGEND' },
  { minExp: 18000, title: 'CHAMPION' },
  { minExp: 17000, title: 'GRANDMASTER' },
  { minExp: 16000, title: 'MASTER' },
  { minExp: 15000, title: 'ELITE' },
  { minExp: 14000, title: 'VETERAN' },
  { minExp: 13000, title: 'EXPERT' },
  { minExp: 12000, title: 'PROFESSIONAL' },
  { minExp: 11000, title: 'SPECIALIST' },
  { minExp: 10000, title: 'ADVANCED' },
  { minExp: 9000, title: 'EXPERIENCED' },
  { minExp: 8000, title: 'PROFICIENT' },
  { minExp: 7000, title: 'COMPETENT' },
  { minExp: 6000, title: 'INTERMEDIATE' },
  { minExp: 5000, title: 'APPRENTICE' },
  { minExp: 4000, title: 'AMATEUR' },
  { minExp: 3000, title: 'ROOKIE' },
  { minExp: 2000, title: 'NOVICE' },
  { minExp: 1000, title: 'TRAINEE' },
  { minExp: 0, title: 'BEGINNER' }
] as const; 

export function calculateTitle(exp: number): string {
  const level = TITLE_THRESHOLDS.find(t => exp >= t.minExp);
  
  return level ? level.title : 'BEGINNER'; 
}