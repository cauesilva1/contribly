# Checklist de produção (Contribly)

Use esta lista quando for publicar / validar na Vercel.

## GitHub OAuth App

- [x] Criar/atualizar OAuth App de produção
- [x] Homepage URL = `https://contribly.vercel.app`
- [x] Callback URL = `https://contribly.vercel.app/api/auth/callback/github`
- [x] Copiar Client ID / Secret para a Vercel

## Variáveis na Vercel

- [x] `DATABASE_URL` — pooler Supabase (porta 6543, `?pgbouncer=true`)
- [x] `DIRECT_URL` — sessão/migrations (porta 5432)
- [x] `AUTH_SECRET` — `openssl rand -base64 32`
- [x] `AUTH_GITHUB_ID`
- [x] `AUTH_GITHUB_SECRET`
- [x] `AUTH_URL` — `https://contribly.vercel.app` (com https://)
- [x] `GITHUB_TOKEN` — (recomendado) sync de issues/perfil
- [x] `CRON_SECRET` — protege `/api/cron/sync-issues`
- [ ] `TOKEN_ENCRYPTION_KEY` — `openssl rand -base64 32` (32 bytes; cifra tokens GitHub em repouso)
- [ ] `RESEND_API_KEY` (+ `EMAIL_FROM`) — obrigatório em produção para signup por e-mail

## Rotação de segredos (se `.env` / chaves vazaram)

Faça **antes** de confiar no ambiente de novo:

1. [ ] Supabase → regenerar senha do Postgres + `service_role` key; atualizar `DATABASE_URL` / `DIRECT_URL` / `SUPABASE_SERVICE_ROLE_KEY`
2. [ ] GitHub OAuth App → regenerar Client Secret; **Revoke all user tokens**
3. [ ] Novo `AUTH_SECRET` (`openssl rand -base64 32`) — invalida sessões
4. [ ] Novo `TOKEN_ENCRYPTION_KEY` e redeploy (tokens antigos em plaintext são re-criptografados na leitura; após revoke, usuários reconectam o GitHub)
5. [ ] Atualizar Vercel + `.env` local + redeploy

## Banco

- [x] Rodar migrations em prod: `npx prisma migrate deploy` (com `DIRECT_URL`) — sem pendências (ago/2026)
- [ ] (Opcional) `npm run db:seed` só se quiser dados demo extras

## Pós-deploy

- [x] Login com GitHub funciona em `https://contribly.vercel.app` (validado pelo mantenedor)
- [x] Sync de perfil / fluxo swipe → aceite → inbox (validado pelo mantenedor)
- [x] Publicar/importar projeto (stars + issues sync)
- [x] Cron diário em `vercel.json`: `0 12 * * *` → `/api/cron/sync-issues`
- [x] Repo GitHub renomeado para [cauesilva1/contribly](https://github.com/cauesilva1/contribly)
- [x] Nome demo “OpenMatch Maintainer” → “Contribly Maintainer”
- [x] English-only UI live (`lang=en`, `/pt` → `/`) — smoke ago/2026
- [ ] Set `ADMIN_EMAIL` or `ADMIN_GITHUB` on Vercel for `/metrics`
- [ ] Signup e-mail → confirmação Resend → login

## Observações

- Não commitar `.env`
- **Auth:** toda Server Action / Route Handler autenticada deve chamar `requireUser()` / `auth()` / `requireApiUser()` — o middleware só checa presença de cookie (UX)
- Build na Vercel pula ESLint/typecheck (CI cobre isso) para ficar mais rápido
- Em caso de token GitHub expirado: sync tenta refresh; se falhar, usa API pública e/ou peça re-login
- Homepage do repo no GitHub ainda pode apontar para URL antiga da Vercel — atualize para `https://contribly.vercel.app`
