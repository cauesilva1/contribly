-- AlterEnum
CREATE TYPE "ContributorRole" AS ENUM ('developer', 'designer', 'docs', 'community', 'other');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "supabaseUserId" TEXT,
ADD COLUMN "role" "ContributorRole" NOT NULL DEFAULT 'developer';

-- CreateIndex
CREATE UNIQUE INDEX "User_supabaseUserId_key" ON "User"("supabaseUserId");
