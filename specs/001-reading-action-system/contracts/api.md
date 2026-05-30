# API Contract: Reading-to-Action System

REST API exposed by the backend. All endpoints (except auth) require an authenticated
session (HTTP-only cookie) and operate only on the current user's data (FR-013). All
request/response bodies are JSON and validated with the shared Zod schemas. Errors use a
consistent shape: `{ "error": { "code": string, "message": string } }`.

Base path: `/api`

## Conventions

- IDs are UUID strings.
- Timestamps are ISO 8601 strings.
- `cadence` is one of `daily | weekly | monthly | one_time`.
- Standard status codes: `200` OK, `201` Created, `204` No Content, `400` validation,
  `401` unauthenticated, `403` not owner, `404` not found, `409` conflict.

## Auth

| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/api/auth/register` | `{ email, password }` | `201 { user: { id, email } }` |
| POST | `/api/auth/login` | `{ email, password }` | `200 { user: { id, email } }` + session cookie |
| POST | `/api/auth/logout` | — | `204` |
| GET | `/api/auth/me` | — | `200 { user: { id, email } }` or `401` |

## Challenges (FR-001)

| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/api/challenges` | — | `200 [{ id, title, description, status, createdAt }]` |
| POST | `/api/challenges` | `{ title, description? }` | `201 { challenge }` |
| GET | `/api/challenges/:id` | — | `200 { challenge, books: [...] }` |
| PATCH | `/api/challenges/:id` | `{ title?, description?, status? }` | `200 { challenge }` |
| DELETE | `/api/challenges/:id?confirm=true` | — | `204`; `409` if has dependents and `confirm` not set (FR-012) |

## Books (FR-002, FR-003)

| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/api/challenges/:challengeId/books` | — | `200 [{ book }]` |
| POST | `/api/challenges/:challengeId/books` | `{ title, author, readingReason?, readingStatus? }` | `201 { book }` |
| GET | `/api/books/:id` | — | `200 { book, notes: [...] }` |
| PATCH | `/api/books/:id` | `{ title?, author?, readingReason?, readingStatus? }` | `200 { book }` |
| DELETE | `/api/books/:id?confirm=true` | — | `204`; `409` if has dependents and `confirm` not set |

## Notes (FR-004)

| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/api/books/:bookId/notes` | — | `200 [{ note }]` |
| POST | `/api/books/:bookId/notes` | `{ content }` | `201 { note }` |
| PATCH | `/api/notes/:id` | `{ content }` | `200 { note }` |
| DELETE | `/api/notes/:id` | — | `204`; derived actions are detached, not deleted (edge case) |

## Actions (FR-005, FR-006, FR-007, FR-010)

| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/api/actions` | `?challengeId=&cadence=&completed=` (optional filters) | `200 [{ action, currentPeriodCompleted }]` |
| POST | `/api/notes/:noteId/actions` | `{ description, cadence }` | `201 { action }`; `400` if `cadence` missing/invalid (FR-006) |
| PATCH | `/api/actions/:id` | `{ description?, cadence? }` | `200 { action }` |
| POST | `/api/actions/:id/complete` | `{ periodKey? }` | `200 { action, completion }`; idempotent per period; `409` if already completed for period |
| POST | `/api/actions/:id/reopen` | `{ periodKey? }` | `200 { action }`; deletes the period's completion (FR-007) |
| DELETE | `/api/actions/:id` | — | `204` |

- If `periodKey` is omitted on complete/reopen, the server computes the current period
  from the action's cadence (see data-model.md).

## Progress / Review (FR-009)

| Method | Path | Query | Response |
|--------|------|-------|----------|
| GET | `/api/challenges/:id/progress` | `?period=current` | `200 { challengeId, actionsCreated, actionsCompleted, byBook: [{ bookId, actionsCreated, actionsCompleted }] }` |

- `actionsCompleted` counts actions completed for the current period of their cadence;
  one-time actions count as completed if any completion exists.

## Validation summary (shared Zod schemas)

- `title`: non-empty string, max length per data-model.md.
- `author`: non-empty string for books.
- `cadence`: enum, required on action creation (FR-006).
- `readingStatus`: enum `to_read | reading | done`.
- `status` (challenge): enum `active | archived`.
- Ownership: server rejects access to any resource whose owning user != session user
  with `403` (FR-013).
