# Auth por e-mail / senha — Contribly

Branch: `feature/email-password-auth`

## Estado atual

Login e registro com **e-mail + senha** funcionam **sem envio de e-mail** e **sem Supabase Auth**.

- Senha guardada como `User.passwordHash` (bcrypt)
- Sessão Auth.js (cookie + tabela `Session`), igual ao fluxo GitHub
- Verificação por e-mail / templates SMTP: **adiado** (ver `docs/email-templates/` para o futuro)

## UI

Uma página só: **`/auth`**

- Abas **Login** / **Juntar-se**
- **Continuar com GitHub**
- Ou e-mail + senha (campos sempre visíveis)

Header e home: botão **Juntar-se** → `/auth`

Rotas:
- `/auth/login` → `/auth`
- `/auth/signup` → `/auth?mode=signup`

## Schema

- `User.passwordHash` — login e-mail
- `User.role` — tipo de contribuição no signup
- `User.supabaseUserId` — reservado para quando ligarmos verificação por e-mail

## Migração

```bash
npx prisma migrate deploy
# ou em dev:
npx prisma migrate dev
```

## Futuro (e-mail de confirmação)

Quando houver domínio + SMTP (ou Supabase custom SMTP):

1. Ligar provider Email no Supabase (ou Auth.js email)
2. Usar template em `docs/email-templates/confirm-signup.html`
3. Só então exigir `emailVerified` antes de sessão plena
