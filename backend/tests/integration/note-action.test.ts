import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { makeApp, registerAndGetCookie } from '../helpers.js';

/**
 * US2 (minimum) value proposition: a user creates a Challenge, adds a Book, writes a
 * Note, and converts the Note into an Action — preserving the traceable chain
 * Challenge -> Book -> Note -> Action.
 */
describe('US2: notes converted into actions with full traceability', () => {
  let app: FastifyInstance;
  beforeAll(async () => {
    app = await makeApp();
  });
  afterAll(async () => {
    await app.close();
  });

  it('builds the full chain and keeps the action traceable to its note and book', async () => {
    const cookie = await registerAndGetCookie(app, 'trace@example.com');

    const challenge = await app
      .inject({
        method: 'POST',
        url: '/api/challenges',
        headers: { cookie },
        payload: { title: 'Stop overcommitting' },
      })
      .then((r) => r.json().challenge);

    const book = await app
      .inject({
        method: 'POST',
        url: `/api/challenges/${challenge.id}/books`,
        headers: { cookie },
        payload: { title: 'Essentialism', author: 'Greg McKeown' },
      })
      .then((r) => r.json().book);

    const note = await app
      .inject({
        method: 'POST',
        url: `/api/books/${book.id}/notes`,
        headers: { cookie },
        payload: { content: 'Say no to non-essential requests' },
      })
      .then((r) => r.json().note);

    const action = await app
      .inject({
        method: 'POST',
        url: `/api/notes/${note.id}/actions`,
        headers: { cookie },
        payload: { description: 'Decline one non-essential meeting this week', cadence: 'weekly' },
      })
      .then((r) => r.json().action);

    // Verify each link of the chain is navigable from the persisted data.
    expect(action.noteId).toBe(note.id);

    const noteActions = await app
      .inject({ method: 'GET', url: `/api/notes/${note.id}/actions`, headers: { cookie } })
      .then((r) => r.json());
    expect(noteActions.map((a: { id: string }) => a.id)).toContain(action.id);

    const bookNotes = await app
      .inject({ method: 'GET', url: `/api/books/${book.id}/notes`, headers: { cookie } })
      .then((r) => r.json());
    expect(bookNotes[0].bookId).toBe(book.id);

    const challengeDetail = await app
      .inject({ method: 'GET', url: `/api/challenges/${challenge.id}`, headers: { cookie } })
      .then((r) => r.json());
    expect(challengeDetail.books.map((b: { id: string }) => b.id)).toContain(book.id);
  });
});
