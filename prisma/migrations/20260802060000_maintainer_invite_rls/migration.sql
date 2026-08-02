-- Defense in depth: deny PostgREST access (Prisma role bypasses RLS).
ALTER TABLE "MaintainerInvite" ENABLE ROW LEVEL SECURITY;
