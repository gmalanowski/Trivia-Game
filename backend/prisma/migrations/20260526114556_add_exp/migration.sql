/*
  Warnings:

  - The `title` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Title" AS ENUM ('BEGINNER', 'TRAINEE', 'NOVICE', 'ROOKIE', 'AMATEUR', 'APPRENTICE', 'INTERMEDIATE', 'COMPETENT', 'PROFICIENT', 'EXPERIENCED', 'ADVANCED', 'SPECIALIST', 'PROFESSIONAL', 'EXPERT', 'VETERAN', 'ELITE', 'MASTER', 'GRANDMASTER', 'CHAMPION', 'LEGEND', 'PINNACLE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "exp" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "title",
ADD COLUMN     "title" "Title" NOT NULL DEFAULT 'BEGINNER';
