---
description: "Task list for Reading-to-Action System implementation"
---

# Tasks: Reading-to-Action System

**Input**: Design documents from `/specs/001-reading-action-system/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/api.md

**Tests**: Test tasks ARE included. The project constitution (Principle II, Test-First Quality)
mandates that core logic is covered by tests written before or alongside implementation.

**Organization**: Tasks are grouped by user story (US1-US3) to enable independent
implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- File paths follow the web-app structure from plan.md (`backend/`, `frontend/`, `packages/shared/`)

## Path Conventions

- Backend: `backend/src/`, `backend/prisma/`, `backend/tests/`
- Frontend: `frontend/src/`, `frontend/tests/`
- Shared contract: `packages/shared/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and tooling

- [X] T001 Create monorepo workspace structure (`backend/`, `frontend/`, `packages/shared/`) with root `package.json` workspaces per plan.md
- [X] T002 [P] Initialize backend TypeScript project (Fastify, Prisma, Zod, Vitest) in `backend/package.json` and `backend/tsconfig.json`
- [X] T003 [P] Initialize frontend React + Vite + TypeScript project (React Router, TanStack Query, Playwright) in `frontend/package.json` and `frontend/tsconfig.json`
- [X] T004 [P] Initialize shared package (TypeScript + Zod) in `packages/shared/package.json` and `packages/shared/tsconfig.json`
- [X] T005 [P] Configure ESLint + Prettier at repo root in `.eslintrc.cjs` and `.prettierrc`
- [X] T006 [P] Configure test runners (Vitest config in `backend/vitest.config.ts`, Playwright config in `frontend/playwright.config.ts`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T007 Define Prisma schema in `backend/prisma/schema.prisma` per data-model.md. NOTE: MVP implements User, Challenge, Book; Note/Action/ActionCompletion deferred to US2/US3 per scope.
- [X] T008 Create initial schema sync (SQLite dev via `prisma db push`) and `backend/.env.example` (`DATABASE_URL`, `SESSION_SECRET`)
- [X] T009 [P] Define shared Zod schemas and TypeScript types in `packages/shared/src/schemas.ts` and `packages/shared/src/types.ts`. NOTE: MVP covers auth/challenge/book; note/action schemas deferred.
- [ ] T010 [P] Implement period-key utility (daily/weekly/monthly/one_time) as a pure function in `backend/src/lib/period.ts` per data-model.md — DEFERRED (US3 actions only; out of MVP scope)
- [ ] T011 [P] [Test] Unit tests for period-key utility (all cadences, ISO week boundaries) in `backend/tests/unit/period.test.ts` — DEFERRED (US3 only)
- [X] T012 Implement Prisma client in `backend/src/models/db.ts`
- [X] T013 Implement Fastify bootstrap, consistent JSON error shape, and error handler in `backend/src/server.ts` and `backend/src/lib/errors.ts`
- [X] T014 [Test] Contract tests for auth (register, login, logout, me) in `backend/tests/contract/auth.test.ts`
- [X] T015 Implement auth service and routes (register, login, logout, me) with session cookie in `backend/src/services/auth.ts` and `backend/src/api/auth.ts`
- [X] T016 Implement per-user scoping guard (reject access to non-owned resources) in `backend/src/lib/auth.ts`
- [X] T017 [P] Frontend app shell: router, layout, design tokens, and base components (Button, Field, EmptyState) in `frontend/src/main.tsx`, `frontend/src/App.tsx`, `frontend/src/components/ui.tsx`
- [X] T018 [P] Frontend API client + TanStack Query provider + auth pages (login/register) in `frontend/src/services/api.ts` and `frontend/src/pages/Auth.tsx`

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 - Connect a challenge to a book with intent (Priority: P1) 🎯 MVP

**Goal**: A user creates a challenge, adds a book they believe will help, and records why
they chose to read it, so reading becomes intention-driven.

**Independent Test**: Create a challenge, add a book under it with a reason, reload, and
confirm the challenge shows its linked book and reason persist.

### Tests for User Story 1 ⚠️ (write first, ensure they fail)

- [X] T019 [P] [US1] Contract test for challenge endpoints (create/list/get/update/delete + ownership) in `backend/tests/contract/challenges.test.ts`
- [X] T020 [P] [US1] Contract test for book endpoints (create/list/update/delete, reason optional) in `backend/tests/contract/books.test.ts`
- [X] T021 [P] [US1] Integration test for create-challenge-then-add-book-with-reason flow in `backend/tests/integration/challenge-book.test.ts`
- [X] T022 [P] [US1] Playwright E2E for US1 Independent Test in `frontend/tests/e2e/us1-challenge-book.spec.ts` (written; run with `npm run test:e2e` after `npx playwright install`)

### Implementation for User Story 1

- [X] T023 [P] [US1] Implement Challenge service (CRUD, ownership scoping, delete-with-confirm cascade) in `backend/src/services/challenge.ts`
- [X] T024 [P] [US1] Implement Book service (CRUD under challenge, reading reason/status) in `backend/src/services/book.ts`
- [X] T025 [US1] Implement challenge routes in `backend/src/api/challenges.ts` (depends on T023)
- [X] T026 [US1] Implement book routes in `backend/src/api/books.ts` (depends on T024)
- [X] T027 [US1] Wire validation (shared Zod schemas) and ownership guard into challenge/book routes
- [X] T028 [P] [US1] Frontend Challenge list + create page in `frontend/src/pages/Challenges.tsx`
- [X] T029 [P] [US1] Frontend Challenge detail page with add-book form and reason in `frontend/src/pages/ChallengeDetail.tsx`
- [X] T030 [US1] Frontend TanStack Query hooks for challenges/books in `frontend/src/services/challenges.ts` and `frontend/src/services/books.ts`
- [X] T031 [US1] Empty states + delete confirmation UI for challenges/books (FR-012, FR-014)

**Checkpoint**: User Story 1 is fully functional and independently testable (MVP)

---

## Phase 4: User Story 2 - Capture notes and convert them into actions (Priority: P2)

**Goal**: The user records notes from a book and converts selected notes into actions
categorized by cadence (Daily/Weekly/Monthly/One-time).

**Independent Test**: For an existing book, add notes, convert a note into an action with
a cadence, and confirm the action links back to its source note and book.

### Tests for User Story 2 ⚠️ (write first, ensure they fail)

- [X] T032 [P] [US2] Contract test for note endpoints (create/list/delete + ownership) in `backend/tests/contract/notes.test.ts`
- [X] T033 [P] [US2] Contract test for action creation from note + cadence-required validation in `backend/tests/contract/actions-create.test.ts`
- [X] T034 [P] [US2] Integration test for note→action conversion and traceability (action→note→book→challenge) in `backend/tests/integration/note-action.test.ts`
- [X] T035 [P] [US2] Playwright E2E for US2 Independent Test in `frontend/tests/e2e/us2-notes-actions.spec.ts` (written; run with `npm run test:e2e` after `npx playwright install`)

### Implementation for User Story 2

- [X] T036 [P] [US2] Implement Note service (create/list under book; delete detaches actions) in `backend/src/services/note.ts`
- [X] T037 [P] [US2] Implement Action creation service (from note, cadence required, traceability) in `backend/src/services/action.ts`
- [X] T038 [US2] Implement note routes in `backend/src/api/notes.ts` (depends on T036)
- [X] T039 [US2] Implement action create/list routes in `backend/src/api/actions.ts` (depends on T037). NOTE: action update/complete/reopen deferred to US3 per scope.
- [X] T040 [US2] Enforce cadence-required validation via shared Zod schema in action routes (FR-006)
- [X] T041 [P] [US2] Frontend notes panel on Book detail page in `frontend/src/pages/BookDetail.tsx`
- [X] T042 [P] [US2] Frontend convert-note-to-action UI with cadence selector in `frontend/src/components/NoteActions.tsx`
- [X] T043 [US2] Frontend TanStack Query hooks for notes/actions in `frontend/src/services/notes.ts` and `frontend/src/services/actions.ts`

**Checkpoint**: User Stories 1 AND 2 both work independently

---

## Phase 5: User Story 3 - Track completion and review progress (Priority: P3)

**Goal**: The user marks actions complete (respecting recurrence) and reviews
created-vs-completed progress per challenge and book.

**Independent Test**: With existing actions, mark some complete, open the review view,
and confirm accurate created-vs-completed counts; reopen and confirm counts update.

### Tests for User Story 3 ⚠️ (write first, ensure they fail)

- [ ] T044 [P] [US3] Unit tests for progress computation (per-period completion, one-time vs recurring) in `backend/tests/unit/progress.test.ts`
- [ ] T045 [P] [US3] Contract test for complete/reopen endpoints (idempotent per period) in `backend/tests/contract/actions-complete.test.ts`
- [ ] T046 [P] [US3] Contract test for challenge progress endpoint in `backend/tests/contract/progress.test.ts`
- [ ] T047 [P] [US3] Integration test for recurring-action completion across periods (history retained) in `backend/tests/integration/recurrence.test.ts`
- [ ] T048 [P] [US3] Playwright E2E for US3 Independent Test in `frontend/tests/e2e/us3-progress.spec.ts`

### Implementation for User Story 3

- [ ] T049 [P] [US3] Implement completion service (create/delete ActionCompletion by period, unique per period) in `backend/src/services/completion.ts`
- [ ] T050 [P] [US3] Implement progress computation service (per challenge + byBook) in `backend/src/services/progress.ts`
- [ ] T051 [US3] Implement complete/reopen routes in `backend/src/api/actions.ts` (depends on T049)
- [ ] T052 [US3] Implement challenge progress route in `backend/src/api/progress.ts` (depends on T050)
- [ ] T053 [P] [US3] Frontend actions list with complete/reopen controls in `frontend/src/pages/Actions.tsx`
- [ ] T054 [P] [US3] Frontend progress review view per challenge in `frontend/src/pages/Review.tsx`
- [ ] T055 [US3] Frontend TanStack Query hooks for completion/progress in `frontend/src/services/progress.ts`

**Checkpoint**: All user stories independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements affecting multiple user stories

- [ ] T056 [P] Accessibility pass (keyboard nav, semantic HTML, contrast) across all pages with component a11y tests in `frontend/tests/component/`
- [ ] T057 [P] Responsive layout verification for mobile/desktop across all views
- [ ] T058 [P] Seed script for demo data (challenge → book → notes → actions) in `backend/prisma/seed.ts`
- [ ] T059 [P] Update `specs/001-reading-action-system/quickstart.md` if commands changed and add root README
- [ ] T060 End-to-end smoke run of quickstart.md and full test suite; ensure all gates pass (Constitution Principle II)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational completion
  - US1 (P1) → US2 (P2) → US3 (P3) in priority order; US2 and US3 build on entities from
    earlier stories but each is independently testable with seeded data
- **Polish (Phase 6)**: Depends on the desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: Depends only on Foundational. Delivers the MVP.
- **US2 (P2)**: Needs a Book to exist (US1 entities) but is independently testable.
- **US3 (P3)**: Needs Actions to exist (US2 entities) but is independently testable.

### Within Each User Story

- Tests written and failing BEFORE implementation (Constitution Principle II)
- Models/schemas before services; services before routes; routes before frontend wiring

### Parallel Opportunities

- All Setup tasks marked [P] (T002-T006) can run in parallel
- Foundational [P] tasks (T009, T010, T011, T017, T018) can run in parallel
- Within each story, all test tasks marked [P] can run in parallel, and service tasks for
  different files marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Write all US1 tests first (parallel):
Task: "Contract test for challenge endpoints in backend/tests/contract/challenges.test.ts"
Task: "Contract test for book endpoints in backend/tests/contract/books.test.ts"
Task: "Integration test for challenge-book flow in backend/tests/integration/challenge-book.test.ts"
Task: "Playwright E2E for US1 in frontend/tests/e2e/us1-challenge-book.spec.ts"

# Then implement services in parallel:
Task: "Implement Challenge service in backend/src/services/challenge.ts"
Task: "Implement Book service in backend/src/services/book.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test US1 independently
5. Deploy/demo if ready — this is the MVP

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. Add US1 → test independently → demo (MVP)
3. Add US2 → test independently → demo
4. Add US3 → test independently → demo

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps each task to its user story for traceability
- Verify tests fail before implementing (test-first)
- Commit after each task or logical group (auto-commit is disabled; commit manually or via `/speckit-git-commit`)
