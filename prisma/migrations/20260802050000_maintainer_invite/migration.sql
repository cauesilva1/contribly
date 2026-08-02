-- CreateTable
CREATE TABLE "MaintainerInvite" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "interestId" TEXT,
    "emailSentTo" TEXT,
    "emailSentAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "claimedAt" TIMESTAMP(3),
    "claimedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MaintainerInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MaintainerInvite_token_key" ON "MaintainerInvite"("token");

-- CreateIndex
CREATE INDEX "MaintainerInvite_projectId_idx" ON "MaintainerInvite"("projectId");

-- CreateIndex
CREATE INDEX "MaintainerInvite_createdById_idx" ON "MaintainerInvite"("createdById");

-- AddForeignKey
ALTER TABLE "MaintainerInvite" ADD CONSTRAINT "MaintainerInvite_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintainerInvite" ADD CONSTRAINT "MaintainerInvite_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
