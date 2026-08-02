-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('beginner', 'intermediate', 'advanced');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "interestTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "experienceLevel" "ExperienceLevel" NOT NULL DEFAULT 'beginner';

-- AlterTable
ALTER TABLE "Project" ADD COLUMN "starsCount" INTEGER,
ADD COLUMN "issuesSyncedAt" TIMESTAMP(3);
