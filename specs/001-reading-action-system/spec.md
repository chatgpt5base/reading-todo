# Feature Specification: Reading-to-Action System

**Feature Branch**: `001-reading-action-system`

**Created**: 2026-05-30

**Status**: Draft

**Input**: User description: "Create a web application that helps users transform reading into action. Connect personal challenges with books, notes, and actionable tasks. Core flow: Challenge -> Book -> Notes -> Actions -> Results. This is not a reading tracker; it is a behavior-change system powered by reading."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Connect a challenge to a book with intent (Priority: P1)

A user faces a personal challenge they want to solve. They create the challenge, add a
book they believe will help, and record why they chose to read it. This makes reading
intentional from the start by anchoring every book to a real-life problem.

**Why this priority**: This is the entry point of the entire system. Without an explicit
challenge and a reason for reading, the downstream notes and actions have no purpose.
Delivered alone, it already gives users a focused, intention-driven reading list.

**Independent Test**: Create a challenge, add a book under it, and enter a reason for
reading. Confirm the challenge shows its linked book and the recorded reason persists
across sessions.

**Acceptance Scenarios**:

1. **Given** no existing challenges, **When** the user creates a challenge with a title and description, **Then** the challenge appears in their list of active challenges.
2. **Given** an existing challenge, **When** the user adds a book (title and author) and records why they decided to read it, **Then** the book and its reason appear under that challenge.
3. **Given** a challenge with a linked book, **When** the user returns later, **Then** the challenge, book, and reading reason are still present and associated.

---

### User Story 2 - Capture notes and convert them into actions (Priority: P2)

While or after reading, the user records notes from the book. They select meaningful
notes and convert them into actionable tasks, each categorized by cadence: Daily,
Weekly, Monthly, or One-time. This bridges insight into concrete behavior.

**Why this priority**: This is the core value of the product, the "behavior-change"
mechanism. It depends on a book existing (US1) but transforms passive reading into a
plan of action.

**Independent Test**: For an existing book, add one or more notes, convert a note into
an action, assign it a cadence category, and confirm the action is linked to its source
note and book.

**Acceptance Scenarios**:

1. **Given** a book linked to a challenge, **When** the user adds a note, **Then** the note is saved and listed under that book.
2. **Given** an existing note, **When** the user converts it into an action and assigns a category (Daily, Weekly, Monthly, or One-time), **Then** the action appears in the user's action list and references its source note.
3. **Given** a note, **When** the user creates an action directly without selecting a category, **Then** the system requires a category before the action can be saved.
4. **Given** an action created from a note, **When** the user views the action, **Then** they can trace it back to the originating note, book, and challenge.

---

### User Story 3 - Track completion and review progress (Priority: P3)

The user marks actions complete as they perform them and reviews progress per challenge
and book. They can see how many actions they created versus completed, closing the loop
between reading and measurable results.

**Why this priority**: This delivers the "Results" stage and the product's success
signal. It depends on actions existing (US2) but is what proves the reading produced
behavior change.

**Independent Test**: With existing actions, mark some complete, then open the review
view and confirm it shows accurate created-versus-completed counts for a challenge.

**Acceptance Scenarios**:

1. **Given** an open action, **When** the user marks it complete, **Then** its status updates to completed and it is reflected in progress counts.
2. **Given** a completed action, **When** the user reopens it, **Then** its status returns to open and progress counts update accordingly.
3. **Given** a challenge with several actions in mixed states, **When** the user opens the progress review, **Then** they see the number of actions created and the number completed for that challenge and its books.
4. **Given** recurring actions categorized as Daily/Weekly/Monthly, **When** the user reviews progress, **Then** completion is reflected for the relevant period without deleting the recurring action.

---

### Edge Cases

- What happens when a user deletes a challenge that has linked books, notes, and actions? The system MUST warn that dependent items will be removed and require confirmation.
- What happens when a user deletes a note that has actions derived from it? Existing actions MUST remain and retain a reference indicating the source note was removed.
- How does the system handle a book added without a recorded reason? A reason SHOULD be encouraged but the book MAY be saved with the reason left empty.
- What happens when a recurring (Daily/Weekly/Monthly) action is completed and the next period begins? The action MUST become available to complete again for the new period without losing prior completion history.
- How does the system handle a challenge with no books, or a book with no notes? These are valid empty states and MUST display guidance prompting the next step.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow a user to create, view, edit, and delete a challenge with at least a title and an optional description.
- **FR-002**: System MUST allow a user to add one or more books to a challenge, each with at least a title and author.
- **FR-003**: System MUST allow a user to record a reading reason ("why I decided to read this") for each book.
- **FR-004**: System MUST allow a user to create, view, edit, and delete reading notes associated with a specific book.
- **FR-005**: System MUST allow a user to convert a note into an actionable task that retains a reference to its source note.
- **FR-006**: System MUST require every action to be assigned exactly one cadence category: Daily, Weekly, Monthly, or One-time.
- **FR-007**: System MUST allow a user to mark an action as complete and to reopen a completed action.
- **FR-008**: System MUST preserve the traceable relationship Challenge -> Book -> Note -> Action so any action can be traced back to its challenge.
- **FR-009**: System MUST provide a progress review that shows, per challenge, the number of actions created and the number completed.
- **FR-010**: System MUST treat recurring actions (Daily, Weekly, Monthly) as repeatable per period while retaining completion history, and treat One-time actions as completed permanently once done.
- **FR-011**: System MUST persist all user data (challenges, books, reasons, notes, actions, completion status) across sessions with no silent data loss.
- **FR-012**: System MUST confirm with the user before deleting any item that has dependent items, and clearly state what will be removed.
- **FR-013**: System MUST scope all data to the individual user so each user only sees their own challenges, books, notes, and actions.
- **FR-014**: System MUST display meaningful empty states that guide the user to the next step in the Challenge -> Book -> Note -> Action flow.

### Key Entities *(include if feature involves data)*

- **Challenge**: A personal problem or goal the user wants to solve. Attributes: title, optional description, status (active/archived), creation date. Owns zero or more Books.
- **Book**: A book the user chose to read for a challenge. Attributes: title, author, reading reason, reading status (to-read/reading/done). Belongs to one Challenge; owns zero or more Notes.
- **Note**: An insight captured while reading. Attributes: content, creation date. Belongs to one Book; can be the source of zero or more Actions.
- **Action**: An actionable task derived from reading. Attributes: description, cadence category (Daily/Weekly/Monthly/One-time), completion status, completion history. References its source Note (and through it, the Book and Challenge).
- **Progress/Results**: A derived view, not stored data, summarizing created-versus-completed action counts for a challenge and its books over a relevant period.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 70% of users who add a book go on to create at least one action from a note within their first week (action creation rate).
- **SC-002**: At least 50% of created actions are marked complete within their first applicable period (action completion rate).
- **SC-003**: A user can go from creating a challenge to creating their first action in under 5 minutes during first use.
- **SC-004**: 90% of users can correctly trace an action back to its originating book and challenge on their first attempt during usability testing.
- **SC-005**: Users return to mark actions complete on at least 3 separate days within their first two weeks, indicating ongoing behavior-change engagement.

## Assumptions

- The application is single-user per account; each user manages their own private data and there is no sharing or social functionality (consistent with the stated non-goals).
- Standard account-based access (e.g., session-based sign-in) is used; the specific authentication mechanism is an implementation detail to be decided during planning.
- Each book is created in the context of a single challenge; if the same book applies to multiple challenges, the user adds it separately under each challenge for MVP simplicity.
- "Progress review" for MVP focuses on created-versus-completed action counts; richer analytics and trends are out of scope for this feature.
- The product explicitly excludes: an ebook reader, a Kindle replacement, a social network, and reading-speed tracking (stated non-goals).
- Reading notes are free-form text for MVP; rich formatting, highlights imported from devices, or attachments are out of scope.
