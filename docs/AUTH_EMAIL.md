# Auth por e-mail (Supabase) — Contribly

Branch: `feature/email-password-auth`

## Objetivo

Permitir contas **sem GitHub** (design, docs, community, etc.) com:

1. Cadastro e-mail + senha  
2. **E-mail de verificação** (Supabase Auth)  
3. Login e-mail + senha  
4. Sessão unificada no app via bridge → **Auth.js / Prisma Session** (mesmo `requireUser()` do resto do produto)

GitHub OAuth continua igual na home.

## Arquitetura

```
[Signup/Login UI]
       │
       ▼
[Supabase Auth]  ← senha + e-mail de confirmação
       │
       ▼ (confirmado)
[bridgeSupabaseUserToAuthJs]
       │  upsert User + Account(provider=supabase)
       │  cria Session Auth.js + cookie
       ▼
[App Contribly]  ← middleware / requireUser inalterados
```

## Variáveis de ambiente

```bash
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
# Opcional por enquanto (admin / jobs futuros)
# SUPABASE_SERVICE_ROLE_KEY="eyJ..."
```

No **Supabase Dashboard**:

1. **Authentication → Providers → Email** → Enabled  
2. **Confirm email** → ON (obrigatório para o fluxo de verificação)  
3. **URL Configuration**  
   - Site URL: `https://contribly.vercel.app` (ou `http://localhost:3000`)  
   - Redirect URLs:  
     - `http://localhost:3000/auth/callback`  
     - `https://contribly.vercel.app/auth/callback`  

## Rotas

| Rota | Função |
|------|--------|
| `/auth/signup` | Criar conta + disparar e-mail |
| `/auth/verify` | “Cheque sua caixa de entrada” + reenviar |
| `/auth/login` | Entrar com e-mail/senha |
| `/auth/callback` | Troca `code` do link do e-mail → sessão |

## Modelo do e-mail de verificação

O texto oficial é editável em **Supabase → Authentication → Email Templates → Confirm signup**.

### Assunto (sugerido)

```
Confirm your Contribly account
```

### Corpo (HTML sugerido)

Cole no template do Supabase (variáveis `{{ .ConfirmationURL }}`, `{{ .SiteURL }}`, `{{ .Email }}`):

```html
<h2>Welcome to Contribly</h2>
<p>Hi,</p>
<p>
  Confirm your email (<strong>{{ .Email }}</strong>) to finish creating your
  Contribly account — for contributors who help with code, design, docs, and more.
</p>
<p>
  <a href="{{ .ConfirmationURL }}">Confirm email and continue</a>
</p>
<p style="color:#57606a;font-size:12px">
  If you did not sign up, you can ignore this message.
  Link from {{ .SiteURL }}.
</p>
```

### Versão PT (opcional)

```html
<h2>Bem-vindo ao Contribly</h2>
<p>Olá,</p>
<p>
  Confirme seu e-mail (<strong>{{ .Email }}</strong>) para ativar sua conta
  no Contribly.
</p>
<p>
  <a href="{{ .ConfirmationURL }}">Confirmar e-mail e continuar</a>
</p>
<p style="color:#57606a;font-size:12px">
  Se você não criou esta conta, ignore esta mensagem.
</p>
```

**Importante:** o link deve apontar para o fluxo do Supabase (use `{{ .ConfirmationURL }}`). O redirect configurado (`/auth/callback`) é para onde o usuário cai **depois** da confirmação.

## Schema

- `User.supabaseUserId` — id do Auth Supabase  
- `User.role` — `developer | designer | docs | community | other`  
- `Account` com `provider = "supabase"`  

Senha **não** fica no Prisma — só no Supabase Auth.

## Status desta branch

- [x] Scaffold cliente Supabase + bridge de sessão  
- [x] Signup / login / verify / callback  
- [x] Modelo de e-mail de verificação  
- [ ] Configurar projeto Supabase + envs na Vercel  
- [ ] Rodar migration `20260802070000_email_auth_role`  
- [ ] Polir onboarding para roles sem linguagens GitHub  
- [ ] Testes E2E do fluxo completo  

## SMTP

No free do Supabase, o e-mail de auth usa o SMTP deles (limites baixos). Depois pode ligar Resend/SMTP custom em **Project Settings → Auth → SMTP**.
