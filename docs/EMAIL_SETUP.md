# Configurar e-mail (Resend) — Contribly

O app envia e-mail ao mantenedor quando alguém demonstra **interesse**, usando a API do [Resend](https://resend.com).

Variáveis:

| Variável | Obrigatória | Exemplo |
|----------|-------------|---------|
| `RESEND_API_KEY` | sim | `re_xxxxxxxx` |
| `EMAIL_FROM` | não | `Contribly <onboarding@resend.dev>` (teste) ou `Contribly <noreply@seudominio.com>` |

---

## 1. Conta e API key

1. Crie conta em https://resend.com/signup  
2. Abra **API Keys** → **Create API Key**  
3. Nome: `contribly-prod` · permissão: **Sending access**  
4. Copie a key (`re_...`) — ela só aparece uma vez  

## 2. Remetente (`EMAIL_FROM`)

### Enquanto testa (sem domínio próprio)

Use o remetente de teste do Resend:

```bash
EMAIL_FROM="Contribly <onboarding@resend.dev>"
```

**Limitação:** no plano free, sem domínio verificado, o Resend só entrega e-mail para o **mesmo endereço** da sua conta Resend. Serve para validar o fluxo.

### Em produção (recomendado)

1. No Resend: **Domains** → **Add Domain** (ex.: `contribly.dev` ou um subdomínio)  
2. Adicione os DNS (SPF / DKIM) onde o domínio está hospedado  
3. Espere status **Verified**  
4. Use:

```bash
EMAIL_FROM="Contribly <noreply@seudominio.com>"
```

## 3. Local (`.env`)

No projeto:

```bash
RESEND_API_KEY="re_sua_chave"
EMAIL_FROM="Contribly <onboarding@resend.dev>"
```

Reinicie o `npm run dev`.

## 4. Vercel (produção)

1. Projeto na Vercel → **Settings** → **Environment Variables**  
2. Adicione:
   - `RESEND_API_KEY` = `re_...` (Production + Preview, se quiser)  
   - `EMAIL_FROM` = o mesmo valor do `.env`  
3. **Redeploy** o projeto (Deployments → ⋯ → Redeploy)  

Sem redeploy, o deploy antigo não vê as variáveis novas.

## 5. Como testar

1. Tenha um usuário mantenedor com **e-mail** no perfil (ou e-mail público no GitHub).  
2. Com **outra** conta, dê swipe de interesse no projeto.  
3. Na página do projeto, o painel **Avisar o mantenedor** deve mostrar:  
   `E-mail enviado para …`  
4. Confira a caixa de entrada (e spam). No Resend: **Emails** / logs.

Se aparecer *“E-mail ainda não configurado no servidor”* → falta `RESEND_API_KEY` ou o deploy não foi reiniciado.

Se aparecer *“Sem e-mail público do mantenedor”* → o dono não tem e-mail no Contribly e o GitHub não expõe e-mail público; use issue GitHub ou link de convite.

## 6. Checklist rápido

- [ ] Conta Resend criada  
- [ ] API key gerada  
- [ ] `RESEND_API_KEY` no `.env` e na Vercel  
- [ ] `EMAIL_FROM` definido  
- [ ] Redeploy na Vercel  
- [ ] Teste com interesse + e-mail conhecido  

## Segurança

- Nunca commite a API key.  
- `.env` já está no `.gitignore`.  
- Se vazar a key: revogue no Resend e crie outra.
