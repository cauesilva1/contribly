-- Fecha a API pública do Supabase (PostgREST) nas tabelas do app.
-- Prisma continua acessando via role da connection string (bypassa RLS).
-- Sem policies para anon/authenticated = sem acesso pela anon key.

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VerificationToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Project" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MatchInterest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invite" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProjectIssue" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MatchMessage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProjectParticipation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
