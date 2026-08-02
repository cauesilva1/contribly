# Auth por e-mail / senha — Contribly

## Estado atual

Login e registro com **e-mail + senha** exigem **confirmação de e-mail** (Resend) antes da sessão.

- Senha em `User.passwordHash` (bcrypt)
- `User.emailVerified` preenchido após o magic link `/auth/verify`
- Sessão Auth.js (cookie + tabela `Session`)
- GitHub OAuth **não** usa `allowDangerousEmailAccountLinking` — evita account takeover por e-mail

## Fluxo signup

1. `signUpWithEmail` cria user + hash (sem sessão)
2. Token em `VerificationToken` (SHA-256 do segredo; identificador `email-verify:…`)
3. E-mail Resend com link `/auth/verify?email=&token=`
4. Clique → `emailVerified` + sessão → onboarding

Em **dev** sem `RESEND_API_KEY`, o link é logado no console do servidor.

## UI

`/auth` — Login | Join + GitHub  
`/auth/verify` — consome o link de confirmação

Query banners:

- `?verify=sent` — “check your inbox”
- `?error=link-required` — e-mail já tem senha; entre com e-mail/senha (sem auto-link GitHub)

## Segurança relacionada

- Rate limit in-memory em signup/signin/verify (`src/lib/auth-rate-limit.ts`)
- Tokens OAuth GitHub criptografados em repouso (`TOKEN_ENCRYPTION_KEY`, `src/lib/token-crypto.ts`)

## Env

```bash
RESEND_API_KEY=...
EMAIL_FROM="Contribly <onboarding@resend.dev>"
TOKEN_ENCRYPTION_KEY="$(openssl rand -base64 32)"  # exatamente 32 bytes
```

## Schema

- `User.passwordHash`
- `User.emailVerified`
- `User.role`
- `User.supabaseUserId` — reservado / legado bridge
