# Auth por e-mail / senha — Contribly

## Estado atual

Login e registro com **e-mail + senha** funcionam **sem Resend**.

- Senha em `User.passwordHash` (bcrypt)
- Sessão Auth.js (cookie + tabela `Session`)
- GitHub OAuth **não** usa `allowDangerousEmailAccountLinking` — evita account takeover por e-mail
- Rate limit in-memory em signup/signin

### Sem `RESEND_API_KEY` (padrão atual)

Signup cria a conta e **abre sessão na hora** (sem e-mail de confirmação).

### Com `RESEND_API_KEY` (opcional)

Signup envia magic link → `/auth/verify` → só então abre sessão.  
Detalhes de configuração: [EMAIL_SETUP.md](./EMAIL_SETUP.md).

## Segurança (mesmo sem e-mail)

O risco crítico do audit era: criar conta com o e-mail da vítima + GitHub auto-linkar.  
Isso está **bloqueado** (flag removida + redirect `?error=link-required`).

Confirmação por e-mail é uma camada extra opcional, não obrigatória no MVP sem plano de e-mail.

## UI

`/auth` — Login | Join + GitHub  
`/auth/verify` — só usado se Resend estiver configurado

## Schema

- `User.passwordHash`
- `User.emailVerified` — preenchido no signup sem Resend, ou após o magic link
- `User.role`
