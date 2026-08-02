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

## Banco

- [ ] Rodar migrations em prod: `npx prisma migrate deploy` (com `DIRECT_URL`)
- [ ] (Opcional) `npm run db:seed` só se quiser dados demo

## Pós-deploy

- [ ] Login com GitHub funciona em `https://contribly.vercel.app`
- [ ] Sync de perfil preenche linguagens
- [ ] Publicar/importar projeto (stars + issues sync)
- [ ] Swipe / Pra você / Inbox / Painel
- [ ] Cron diário (Vercel Cron + `CRON_SECRET`)

## Observações

- Não commitar `.env`
- Build na Vercel pula ESLint/typecheck (CI cobre isso) para ficar mais rápido
- Em caso de token GitHub expirado: sync tenta refresh; se falhar, usa API pública e/ou peça re-login
