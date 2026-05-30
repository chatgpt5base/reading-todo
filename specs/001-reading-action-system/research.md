# Phase 0 Research: Reading-to-Action System

This document resolves the technology and approach decisions implied by the spec and the
project constitution (TypeScript end-to-end, React front-end, documented API boundary,
test-first, simplicity, data integrity). The spec contained no `[NEEDS CLARIFICATION]`
markers; the items below are design decisions made for the plan.

## Decision 1: Application architecture

- **Decision**: A single-page React front-end plus a separate Node.js REST API, organized
  as a TypeScript monorepo with a shared package for types/validation.
- **Rationale**: The constitution mandates a documented API boundary and TypeScript
  end-to-end. A clear frontend/backend split with one shared contract package satisfies
  this while keeping the system simple (one client, one service, one database).
- **Alternatives considered**:
  - Full-stack framework (Next.js) with server actions — rejected for MVP to keep the
    API boundary explicit and testable in isolation; can be revisited later.
  - Client-only app with the database in the browser — rejected because per-user
    accounts and reliable persistence (FR-011, FR-013) are easier to guarantee server-side.

## Decision 2: Persistence and data access

- **Decision**: PostgreSQL in production, SQLite for local dev, accessed through Prisma
  ORM with a single schema and migrations.
- **Rationale**: The domain is inherently relational (Challenge→Book→Note→Action with
  referential integrity, FR-008/FR-012). Prisma gives type-safe queries and migrations,
  reinforcing TypeScript-end-to-end. SQLite locally lowers setup friction; the same
  Prisma schema targets Postgres for production.
- **Alternatives considered**:
  - Document store (MongoDB) — rejected; the strong parent/child integrity and
    cascade-confirmation behavior map more naturally to foreign keys.
  - Raw SQL — rejected; more boilerplate and weaker type guarantees than Prisma.

## Decision 3: HTTP API framework

- **Decision**: Fastify with Zod-based schema validation.
- **Rationale**: First-class TypeScript support, fast, schema-driven validation that can
  reuse the shared Zod schemas to enforce the same contract on client and server.
- **Alternatives considered**:
  - Express — viable and widely known, but weaker built-in TS/schema story; kept as a
    fallback if team familiarity matters.
  - tRPC — rejected for MVP because the constitution calls for an explicit, documented
    REST-style API boundary rather than RPC coupling.

## Decision 4: Front-end state and data fetching

- **Decision**: React 18 + Vite, React Router for navigation, TanStack Query for
  server-state caching/mutations, shared Zod schemas for form validation.
- **Rationale**: TanStack Query handles caching, optimistic updates, and refetch cleanly,
  keeping components simple (Principle III). Vite gives fast dev/build.
- **Alternatives considered**:
  - Redux Toolkit — rejected as heavier than needed for primarily server-driven state.
  - Plain fetch + local state — rejected; would re-implement caching/invalidation.

## Decision 5: Recurrence model for Daily/Weekly/Monthly actions

- **Decision**: Store each Action with a `cadence` and represent completions as discrete
  `ActionCompletion` records keyed by period (e.g., date for Daily, ISO week for Weekly,
  month for Monthly). One-time actions store a single completion.
- **Rationale**: Satisfies FR-010 (repeatable per period while retaining history) without
  a generic scheduler. Progress counts (FR-009) derive from completion records for the
  relevant period. Keeps recurrence logic to a small, unit-testable function (Principle III).
- **Alternatives considered**:
  - A single boolean `completed` flag — rejected; loses per-period history for recurring
    actions and cannot show "completed this week" correctly.
  - Cron/scheduler generating action instances — rejected as overkill for MVP.

## Decision 6: Authentication and per-user scoping

- **Decision**: Account-based access with server-side sessions (HTTP-only cookie). Every
  data query is scoped by the authenticated user's id.
- **Rationale**: The constitution lists session-based auth as an acceptable default;
  single-user/private data (Assumptions, FR-013) needs reliable scoping. Sessions avoid
  token-handling complexity in the SPA for MVP.
- **Alternatives considered**:
  - OAuth2/social login — deferred; adds external dependencies not needed for MVP.
  - No auth (single local user) — rejected; the spec describes per-user private data.

## Decision 7: Testing strategy (test-first)

- **Decision**: Vitest for unit (recurrence, progress math) and service/integration tests
  against a test database; React Testing Library for component/a11y checks; Playwright for
  end-to-end coverage of each user story's Independent Test.
- **Rationale**: Directly supports Principle II (Test-First Quality). Each user story in
  the spec already defines an Independent Test that maps to a Playwright scenario.
- **Alternatives considered**:
  - Jest — rejected in favor of Vitest for native ESM/TS and Vite alignment.
  - Manual testing only — rejected; violates Principle II.

## Open items

- None. All Technical Context fields are resolved; no `NEEDS CLARIFICATION` remain.
