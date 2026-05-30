<!--
Sync Impact Report
- Version change: none → 1.0.0
- Ratification: initial adoption (2026-05-30)
- Modified principles: n/a (initial creation)
- Added sections:
  - Core Principles (I. Spec-Driven Development, II. Test-First Quality,
    III. Simplicity & YAGNI, IV. Consistent User Experience, V. Data Integrity & Privacy)
  - Technology & Architecture Constraints
  - Development Workflow
  - Governance
- Removed sections: none
- Templates requiring updates:
  - .specify/templates/plan-template.md ✅ verified (generic Constitution Check gate; no drift)
  - .specify/templates/spec-template.md ✅ verified (no constitution-specific edits needed)
  - .specify/templates/tasks-template.md ✅ verified (testing/quality tasks align)
- Follow-up TODOs: none
-->

# reading-todo Constitution

## Core Principles

### I. Spec-Driven Development (NON-NEGOTIABLE)
Every feature begins with a written specification and an approved plan before any
implementation work starts. Production code MUST trace back to a spec; changes that
lack an associated spec or plan MUST NOT be merged. This keeps intent explicit and
keeps the reading-list and todo capabilities coherent as the product grows.

### II. Test-First Quality
Core logic — reading-list state, todo CRUD, and persistence — MUST be covered by
automated tests written before or alongside the implementation. The full test suite
MUST pass before any change is merged. Bug fixes MUST include a regression test that
fails without the fix.

### III. Simplicity & YAGNI
Start with the simplest design that satisfies the current spec. Additional
abstractions, dependencies, or services MUST be justified against a present
requirement, not a speculative future one. When two solutions are equivalent, choose
the one that is easier to read, test, and remove.

### IV. Consistent User Experience
The reading-list and todo views MUST share consistent interaction patterns, layout,
and terminology so the combined app feels like one product. The UI MUST be responsive
and meet baseline accessibility: keyboard navigability, semantic HTML, and sufficient
color contrast.

### V. Data Integrity & Privacy
User reading data and todos MUST persist reliably with no silent data loss; write
failures MUST surface to the user. User data MUST NOT be shared with third parties
without explicit consent, and only data required for a feature may be collected.

## Technology & Architecture Constraints

- The stack is TypeScript end-to-end: a React (or equivalent component framework)
  front-end and a documented API boundary between the client and storage.
- State management and persistence choices MUST be recorded in the feature plan.
- Prefer well-supported, actively maintained libraries over bespoke implementations
  for solved problems.

## Development Workflow

- All changes land via reviewed pull requests. The reviewer MUST verify constitution
  compliance and that the plan's Constitution Check passes.
- Linting and the automated test suite are required quality gates and MUST pass before
  merge.
- Specs, plans, and tasks live alongside the code under the Spec Kit structure and are
  kept in sync with the implementation.

## Governance

This constitution supersedes ad-hoc practices. Amendments MUST be proposed via a pull
request that documents the rationale and applies a version bump under semantic
versioning:

- MAJOR: backward-incompatible governance or principle removals/redefinitions.
- MINOR: a new principle or section, or materially expanded guidance.
- PATCH: clarifications, wording, or non-semantic refinements.

Compliance is reviewed at plan time and at pull-request review time. Unjustified
complexity or deviations MUST be corrected or explicitly justified before merge.

**Version**: 1.0.0 | **Ratified**: 2026-05-30 | **Last Amended**: 2026-05-30
