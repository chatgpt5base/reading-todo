import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { makeApp, registerAndGetCookie } from '../helpers.js';

async function setupBook(app: FastifyInstance, cookie: string): Promise<string> {
  const ch = await app
    .inject({
      method: 'POST',
      url: '/api/challenges',
      headers: { cookie },
      payload: { title: 'Be more focused' },
    })
    .then((r) => r.json().challenge);
  const book = await app
    .inject({
      method: 'POST',
      url: `/api/challenges/${ch.id}/books`,
      headers: { cookie },
      payload: { title: 'Deep Work', author: 'Cal Newport' },
    })
    .then((r) => r.json().book);
  return book.id;
}

describe('note endpoints', () => {
  let app: FastifyInstance;
  beforeAll(async () => {
    app = await makeApp();
  });
  afterAll(async () => {
    await app.close();
  });

  it('creates and lists notes under a book', async () => {
    const cookie = await registerAndGetCookie(app, 'note@example.com');
    const bookId = await setupBook(app, cookie);

    const create = await app.inject({
      method: 'POST',
      url: `/api/books/${bookId}/notes`,
      headers: { cookie },
      payload: { content: 'Schedule deep work blocks in the morning' },
    });
    expect(create.statusCode).toBe(201);
    expect(create.json().note.bookId).toBe(bookId);

    const list = await app.inject({
      method: 'GET',
      url: `/api/books/${bookId}/notes`,
      headers: { cookie },
    });
    expect(list.json()).toHaveLength(1);
  });

  it('rejects an empty note with 400', async () => {
    const cookie = await registerAndGetCookie(app, 'note2@example.com');
    const bookId = await setupBook(app, cookie);
    const res = await app.inject({
      method: 'POST',
      url: `/api/books/${bookId}/notes`,
      headers: { cookie },
      payload: { content: '   ' },
    });
    expect(res.statusCode).toBe(400);
  });

  it('does not allow adding notes to another user\'s book', async () => {
    const ownerCookie = await registerAndGetCookie(app, 'owner-n@example.com');
    const bookId = await setupBook(app, ownerCookie);
    const otherCookie = await registerAndGetCookie(app, 'other-n@example.com');
    const res = await app.inject({
      method: 'POST',
      url: `/api/books/${bookId}/notes`,
      headers: { cookie: otherCookie },
      payload: { content: 'sneaky' },
    });
    expect(res.statusCode).toBe(404);
  });
});
