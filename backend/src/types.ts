import type { PrismaClient } from "./generated/prisma/client";

export type Env = {
  Variables: {
    prisma: PrismaClient;
    jwtSecret: string;
    jwtPayload: any;
  };
};
