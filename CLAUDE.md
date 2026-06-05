# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # start server with hot reload (loads .env automatically)
pnpm format       # lint and format with Biome (auto-fix)

pnpm db:generate  # generate migration from schema changes
pnpm db:migrate   # run pending migrations
pnpm db:push      # push schema directly (no migration file)
pnpm db:studio    # open Drizzle Studio GUI
```

Start the database before running the server:

```bash
docker compose up -d
```

## Architecture

Single-file server (`src/server.ts`) using **Fastify 5** with:

- **Zod** for request/response validation via `fastify-type-provider-zod` — all routes use `app.withTypeProvider<ZodTypeProvider>().route(...)` inside `app.after()`
- **Swagger** at `/docs` auto-generated from Zod schemas via `jsonSchemaTransform`
- **Drizzle ORM** with `node-postgres` — `db` client in `src/db/client.ts`, schema in `src/db/schema.ts`, migrations in `src/db/migrations/`

Environment is validated at startup via Zod in `src/config/env.ts` — the server will crash immediately if `DATABASE_URL` (postgres URL) or `PORT` are missing.

## Commit Convention

Commits require a gitmoji + conventional commit scope (scope is mandatory):

```txt
:sparkles: feat(scope): message
:bug: fix(scope): message
:card_file_box: feat(db): message
```

commitlint enforces this via husky pre-commit. lint-staged runs `biome check --write` on staged TS/JS/JSON files.
