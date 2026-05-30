# Quickstart: Reading-to-Action System

How to set up and run the project locally for development. This reflects the planned
structure; files are created during implementation (`/speckit-implement`).

## Prerequisites

- Node.js 20 LTS and a package manager (npm or pnpm)
- No external database needed for local dev (SQLite is used via Prisma)

## Repository layout

```text
backend/    # Fastify API + Prisma (SQLite locally, PostgreSQL in production)
frontend/   # React + Vite single-page app
packages/
  shared/   # Shared TypeScript types + Zod schemas (the API contract)
```

## First-time setup

```bash
# from the repository root
npm install                       # installs all workspaces

# backend: create the local SQLite database and run migrations
cd backend
cp .env.example .env              # DATABASE_URL defaults to file:./dev.db
npx prisma migrate dev            # creates tables from prisma/schema.prisma
npx prisma db seed                # optional: seed demo challenge/book/notes
```

## Running the app

```bash
# terminal 1 - API
cd backend
npm run dev                       # starts Fastify on http://localhost:3000

# terminal 2 - web
cd frontend
npm run dev                       # starts Vite on http://localhost:5173
```

The front-end proxies `/api/*` to the backend during development.

## Running tests (test-first; see Constitution Principle II)

```bash
# unit + integration (backend)
cd backend && npm test

# component tests (frontend)
cd frontend && npm test

# end-to-end user-story flows
cd frontend && npm run test:e2e   # Playwright; starts app + drives US1-US3 flows
```

## Verifying the core flow (maps to spec user stories)

1. **US1**: Register/log in, create a Challenge, add a Book with a reading reason; reload
   and confirm they persist and are linked.
2. **US2**: Open the Book, add a Note, convert it into an Action and assign a cadence
   (daily/weekly/monthly/one_time); confirm the action links back to the note.
3. **US3**: Mark the action complete, open the Challenge progress view, and confirm the
   created-vs-completed counts are correct; reopen the action and confirm counts update.

## Environment / configuration

- `backend/.env`: `DATABASE_URL` (SQLite locally, PostgreSQL URL in production),
  `SESSION_SECRET`.
- Production uses PostgreSQL via the same Prisma schema (`npx prisma migrate deploy`).
