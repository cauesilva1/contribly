# Auth por e-mail (Supabase) — Contribly

Branch: `feature/email-password-auth`

## UI

Uma página só: **`/auth`**

- Abas **Entrar** / **Criar conta**
- **Continuar com GitHub**
- Ou e-mail + senha (com verificação)

Header e home usam um único botão **Entrar** → `/auth` (sem poluir).

Rotas antigas:
- `/auth/login` → `/auth`
- `/auth/signup` → `/auth?mode=signup`
- `/auth/verify` — tela “cheque seu e-mail”
- `/auth/callback` — após o link do e-mail

## Ativar no Supabase (checklist)

Projeto (pelo Postgres): `dyrfwycqpfpwjmhfznka`  
URL: `https://dyrfwycqpfpwjmhfznka.supabase.co`

1. Dashboard → **Authentication → Providers → Email**  
   - Enabled: **ON**  
   - Confirm email: **ON**
2. **Authentication → URL Configuration**  
   - Site URL: `http://localhost:3000` (dev) / `https://contribly.vercel.app` (prod)  
   - Redirect URLs (adicione as duas):  
     - `http://localhost:3000/auth/callback`  
     - `https://contribly.vercel.app/auth/callback`
3. **Authentication → Email Templates → Confirm signup**  
   - Subject: `Confirm your Contribly account`  
   - Body: cole o HTML de [`docs/email-templates/confirm-signup.html`](./email-templates/confirm-signup.html)  
     (visual alinhado ao site: fundo `#eef3f8`, accent `#0969da`, botão escuro, tipografia serif no título)
4. **Settings → API** → copie:  
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`  
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Local + Vercel: coloque as vars e reinicie / redeploy  
6. Migration: `npx prisma migrate deploy` (role + `supabaseUserId`)

Não dá para “ligar” Auth/e-mail só com a connection string do Postgres — precisa das keys **anon** no dashboard (ou Management API com access token pessoal).

## Variáveis

```bash
NEXT_PUBLIC_SUPABASE_URL="https://dyrfwycqpfpwjmhfznka.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
# SUPABASE_SERVICE_ROLE_KEY=""  # opcional
```

## Arquitetura

```
/auth  →  GitHub (Auth.js)  OU  e-mail/senha (Supabase Auth)
                │                         │
                └──────────┬──────────────┘
                           ▼
              sessão Auth.js (Prisma Session)
                           ▼
                    requireUser() / app
```

Senha fica só no Supabase Auth. Prisma guarda `User.supabaseUserId` + `User.role`.

## SMTP

Free do Supabase: e-mails de auth pelo SMTP deles (limites baixos). Depois: SMTP custom / Resend no painel Auth.
