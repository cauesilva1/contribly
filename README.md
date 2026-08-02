# Contribly

Plataforma open source para conectar **contribuidores** a projetos que precisam de ajuda — com filtros, swipe de interesse, aceite do mantenedor e convites.

## Stack

- Next.js 15 (App Router) — UI + Server Actions
- Auth.js (GitHub OAuth)
- Prisma + PostgreSQL ([Supabase](https://supabase.com))
- Deploy na Vercel

## Funcionalidades

### Fase 1 (MVP)
- Login com GitHub e perfil (linguagens, bio, aberto a convites)
- Onboarding pós-login
- Publicar projeto manualmente ou importar por URL do GitHub
- Descobrir com busca/filtros
- Swipe (interesse / passar)
- Inbox: interesses, convites e notificações in-app

### Fase 3
- Matchmaking mais rico (histórico de swipe, issues/labels, experiência, tags, stars, frescor do sync)
- Sync em lote de issues + rota cron (`/api/cron/sync-issues`)
- Painel do mantenedor com analytics (taxa de aceite, stars) e candidatos sugeridos
- Metadados extras do GitHub (stars, última sync) em cards e detalhe

## Setup local

1. Clone e instale:

```bash
git clone https://github.com/cauesilva1/openmatch.git
cd openmatch
npm install
```

> App: [contribly.vercel.app](https://contribly.vercel.app) · marca: **Contribly** (o diretório/repo GitHub ainda pode se chamar `openmatch` até você renomear).

2. Copie o ambiente:

```bash
cp .env.example .env
```

Preencha:

- `DATABASE_URL` — connection string **pooler** do seu projeto Supabase
- `AUTH_SECRET` — `openssl rand -base64 32`
- `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` — [GitHub OAuth App](https://github.com/settings/developers)  
  Callback: `http://localhost:3000/api/auth/callback/github`

3. Migre o banco:

```bash
npx prisma migrate dev --name init
```

4. Rode:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Dev server |
| `npm run build` | Build de produção |
| `npm run start` | Servidor de produção |
| `npm run db:migrate` | Prisma migrate |
| `npm run db:seed` | Dados demo (projetos + issues) |

## Deploy

Veja o checklist completo em [docs/PRODUCTION_CHECKLIST.md](./docs/PRODUCTION_CHECKLIST.md).

Deploy fica por último (UI + Vercel).

## Estrutura

```
src/app/           # páginas + server actions + auth route
src/components/    # UI
src/lib/           # prisma, session, utils
prisma/            # schema
_legacy/           # apps antigos (Express + Next separado) — referência
```

## Contribuindo

Veja [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT
