# Checklist de produção (antes do deploy)

Use esta lista quando for publicar na Vercel.

## GitHub OAuth App

- [ ] Criar/atualizar OAuth App de produção
- [ ] Homepage URL = domínio da Vercel (ex.: `https://contribly.vercel.app`)
- [ ] Callback URL = `https://contribly.vercel.app/api/auth/callback/github`
- [ ] Copiar Client ID / Secret para a Vercel

## Variáveis na Vercel

- [ ] `DATABASE_URL` — pooler Supabase (porta 6543, `?pgbouncer=true`)
- [ ] `DIRECT_URL` — sessão/migrations (porta 5432)
- [ ] `AUTH_SECRET` — `openssl rand -base64 32`
- [ ] `AUTH_GITHUB_ID`
- [ ] `AUTH_GITHUB_SECRET`
- [ ] `AUTH_URL` — URL pública do app
- [ ] `GITHUB_TOKEN` — (recomendado) para sync de issues/perfil sem rate limit
- [ ] `CRON_SECRET` — protege `/api/cron/sync-issues`

## Banco

- [ ] Rodar migrations (`npx prisma migrate deploy`) no ambiente de prod
- [ ] (Opcional) `npm run db:seed` só se quiser dados demo

## Pós-deploy

- [ ] Login com GitHub funciona
- [ ] Sync de perfil preenche linguagens
- [ ] Publicar/importar projeto
- [ ] Swipe / Pra você / Inbox / Painel
- [ ] Cron de issues (manual com `Authorization: Bearer $CRON_SECRET`)

## Observações

- Não commitar `.env`
- Em caso de token GitHub expirado: sync tenta refresh; se falhar, usa API pública e/ou peça re-login
