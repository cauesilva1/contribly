-- AlterTable
ALTER TABLE "Project" ADD COLUMN "catalogUnclaimed" BOOLEAN NOT NULL DEFAULT false;

-- Mark seed/demo-owned projects as catalog (no real maintainer on Contribly yet)
UPDATE "Project" AS p
SET "catalogUnclaimed" = true
FROM "User" AS u
WHERE p."ownerId" = u.id
  AND u.email = 'maintainer@contribly.demo';
