import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { makeApp, registerAndGetCookie } from '../helpers.js';

async function setupNote(app: FastifyInstance, cookie: string): Promise<string> {
  const ch = await app
    .inject({
      method: 'POST',
      url: '/api/challenges',
      headers: { cookie },
      payload: { title: 'Build habits' },
    })
    .then((r) => r.json().challenge);
  const book = await app
    .inject({
      method: 'POST',
      url: `/api/challenges/${ch.id}/books`,
      headers: { cookie },
      payload: { title: 'Atomic Habits', author: 'James Clear' },
    })
    .then((r) => r.json().book);
  const note = await app
    .inject({
      method: 'POST',
      url: `/api/books/${book.id}/notes`,
      headers: { cookie },
      payload: { content: 'Stack a new habit onto an existing routine' },
    })
    .then((r) => r.json().note);
  return note.id;
}

describe('action creation from a note', () => {
  let app: FastifyInstance;
  beforeAll(async () => {
    app = await makeApp();
  });
  afterAll(async () => {
    await app.close();
  });

  it('creates an action from a note with a cadence', async () => {
    const cookie = await registerAndGetCookie(app, 'act@example.com');
    const noteId = await setupNote(app, cookie);

    const res = await app.inject({
      method: 'POST',
      url: `/api/notes/${noteId}/actions`,
      headers: { cookie },
      payload: { description: 'Do 10 pushups after morning coffee', cadence: 'daily' },
    });
    expect(res.statusCode).toBe(201);
    const action = res.json().action;
    expect(action.noteId).toBe(noteId);
    expect(action.cadence).toBe('daily');
  });

  it('requires a cadence (FR-006) and rejects missing/invalid values with 400', async () => {
    const cookie = await registerAndGetCookie(app, 'act2@example.com');
    const noteId = await setupNote(app, cookie);

    const missing = await app.inject({
      method: 'POST',
      url: `/api/notes/${noteId}/actions`,
      headers: { cookie },
      payload: { description: 'No cadence here' },
    });
    expect(missing.statusCode).toBe(400);

    const invalid = await app.inject({
      method: 'POST',
      url: `/api/notes/${noteId}/actions`,
      headers: { cookie },
      payload: { description: 'Bad cadence', cadence: 'hourly' },
    });
    expect(invalid.statusCode).toBe(400);
  });

  it('lists actions for a note', async () => {
    const cookie = await registerAndGetCookie(app, 'act3@example.com');
    const noteId = await setupNote(app, cookie);
    await app.inject({
      method: 'POST',
      url: `/api/notes/${noteId}/actions`,
      headers: { cookie },
      payload: { description: 'Weekly review', cadence: 'weekly' },
    });
    const list = await app.inject({
      method: 'GET',
      url: `/api/notes/${noteId}/actions`,
      headers: { cookie },
    });
    expect(list.statusCode).toBe(200);
    expect(list.json()).toHaveLength(1);
  });
});
