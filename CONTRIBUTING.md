# Contributing to Contribly

Thanks for helping improve Contribly.

## Local development

1. Fork and clone the repo
2. `npm install`
3. Copy `.env.example` to `.env` and fill Supabase + GitHub OAuth values
4. `npx prisma migrate dev`
5. `npm run dev`

## Guidelines

- Prefer small, focused PRs
- Keep the contributor-first MVP loop working: discover → swipe → accept → GitHub
- Do not commit secrets (`.env`, tokens, keys)
- Match existing TypeScript / App Router patterns

## Project direction

Primary user is the **contributor** looking for projects. Maintainers publish/import repos, accept interests, and send invites.

See the README for the current MVP scope and later phases.
