# Implementation Plan: Reading-to-Action System

**Branch**: `001-reading-action-system` | **Date**: 2026-05-30 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-reading-action-system/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Build a web application that turns reading into behavior change by linking personal
Challenges to Books, capturing reading Notes, converting notes into cadence-categorized
Actions (Daily/Weekly/Monthly/One-time), and reviewing created-vs-completed progress.
Technical approach: a TypeScript monorepo with a React (Vite) single-page front-end and
a Node.js REST API backed by a relational database (PostgreSQL via Prisma), all sharing
TypeScript types. The data model directly encodes the core chain
Challenge -> Book -> Note -> Action -> Results, with per-user scoping and referential
integrity to satisfy the constitution's Data Integrity principle.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 20 LTS (backend + tooling); same for the React front-end

**Primary Dependencies**: React 18 + Vite (front-end), React Router, TanStack Query (server-state); Fastify (HTTP API), Prisma ORM (data access + migrations), Zod (shared request/response + domain validation)

**Storage**: PostgreSQL (target/production); SQLite for local development via the same Prisma schema

**Testing**: Vitest (unit/integration), React Testing Library (component), Playwright (end-to-end user-story flows)

**Target Platform**: Modern evergreen web browsers (desktop + mobile responsive); API runs as a Node service

**Project Type**: web (frontend + backend)

**Performance Goals**: Perceived-instant interactions (<200ms for in-app actions on warm data); initial app load under 2s on a typical broadband connection

**Constraints**: No silent data loss (write failures surfaced to user); WCAG 2.1 AA baseline (keyboard nav, semantic HTML, contrast); per-user data isolation; offline not required for MVP

**Scale/Scope**: Single-user accounts; MVP scale of low-thousands of users with modest per-user data (tens of challenges, hundreds of books/notes/actions). Three prioritized user stories (US1-US3); ~5 core entities.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Gates derived from `.specify/memory/constitution.md` v1.0.0:

- **I. Spec-Driven Development (NON-NEGOTIABLE)**: PASS — an approved spec
  (`spec.md`) with prioritized user stories exists; this plan traces directly to it.
- **II. Test-First Quality**: PASS (planned) — core logic (note→action conversion,
  cadence/recurrence rules, progress counts, per-user scoping) will have tests written
  before implementation; `/speckit-tasks` will order test tasks ahead of implementation
  tasks. The full suite must pass before merge.
- **III. Simplicity & YAGNI**: PASS — single relational DB, one API service, one SPA;
  no microservices, message queues, or speculative abstractions. Recurrence handled with
  a simple period-keyed completion record rather than a generic scheduler.
- **IV. Consistent User Experience**: PASS (planned) — shared component library and
  design tokens across all views; responsive layout; a11y baseline enforced in component
  tests. Challenge/Book/Note/Action views reuse the same interaction patterns.
- **V. Data Integrity & Privacy**: PASS (planned) — foreign-key constraints encode the
  Challenge→Book→Note→Action chain; deletes of parents with dependents require explicit
  confirmation (FR-012); all queries scoped to the authenticated user (FR-013); no
  third-party data sharing.

**Post-Design re-check (after Phase 1)**: PASS — data model and API contracts preserve
referential integrity and per-user scoping; no new complexity introduced. See
[data-model.md](data-model.md) and [contracts/](contracts/). No entries required in
Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/001-reading-action-system/
├── plan.md              # This file (/speckit-plan command output)
├── spec.md              # Feature specification
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   └── api.md           # REST endpoint contracts
└── checklists/
    └── requirements.md  # Spec quality checklist (already created)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/          # Prisma schema + generated client wrappers, domain types
│   ├── services/        # Business logic: challenges, books, notes, actions, progress
│   ├── api/             # Fastify routes/controllers per resource
│   ├── lib/             # Shared helpers (auth, validation, error handling)
│   └── server.ts        # App bootstrap
├── prisma/
│   └── schema.prisma    # Data model + migrations
└── tests/
    ├── contract/        # API contract tests
    ├── integration/     # Service + DB integration tests
    └── unit/            # Pure logic (recurrence, progress math)

frontend/
├── src/
│   ├── components/      # Shared UI components + design tokens
│   ├── pages/           # Challenge list, Challenge detail, Book detail, Actions, Review
│   ├── services/        # API client + TanStack Query hooks
│   └── main.tsx         # App entry
└── tests/
    ├── component/       # React Testing Library component tests
    └── e2e/             # Playwright user-story flows

packages/
└── shared/             # Shared TypeScript types + Zod schemas used by both sides
```

**Structure Decision**: Web application (Option 2) — a `frontend/` SPA plus a
`backend/` API, with a `packages/shared/` workspace for the Zod schemas and TypeScript
types that define the API contract once and reuse it end-to-end (supports the
constitution's TypeScript-end-to-end and documented-API-boundary constraints).

## Complexity Tracking

> No constitution violations require justification. This feature uses a single API
> service, a single relational database, and one SPA with no added architectural
> complexity, consistent with Principle III (Simplicity & YAGNI).

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (none)    | —          | —                                   |
