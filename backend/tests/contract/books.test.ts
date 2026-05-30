import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { makeApp, registerAndGetCookie } from '../helpers.js';

async function createChallenge(app: FastifyInstance, cookie: string): Promise<string> {
  const res = await app.inject({
    method: 'POST',
    url: '/api/challenges',
    headers: { cookie },
    payload: { title: 'Learn faster' },
  });
  return res.json().challenge.id;
}

describe('book endpoints', () => {
  let app: FastifyInstance;
  beforeAll(async () => {
    app = await makeApp();
  });
  afterAll(async () => {
    await app.close();
  });

  it('adds a book with a reading reason and lists it under the challenge', async () => {
    const cookie = await registerAndGetCookie(app, 'book@example.com');
    const challengeId = await createChallenge(app, cookie);

    const create = await app.inject({
      method: 'POST',
      url: `/api/challenges/${challengeId}/books`,
      headers: { cookie },
      payload: {
        title: 'Atomic Habits',
        author: 'James Clear',
        readingReason: 'I want to build consistent routines',
      },
    });
    expect(create.statusCode).toBe(201);
    const book = create.json().book;
    expect(book.readingReason).toBe('I want to build consistent routines');
    expect(book.readingStatus).toBe('to_read');

    const list = await app.inject({
      method: 'GET',
      url: `/api/challenges/${challengeId}/books`,
      headers: { cookie },
    });
    expect(list.json()).toHaveLength(1);
  });

  it('allows a book without a reason (reason optional)', async () => {
    const cookie = await registerAndGetCookie(app, 'book2@example.com');
    const challengeId = await createChallenge(app, cookie);
    const res = await app.inject({
      method: 'POST',
      url: `/api/challenges/${challengeId}/books`,
      headers: { cookie },
      payload: { title: 'Deep Work', author: 'Cal Newport' },
    });
    expect(res.statusCode).toBe(201);
    expect(res.json().book.readingReason).toBeNull();
  });

  it('rejects a book missing an author with 400', async () => {
    const cookie = await registerAndGetCookie(app, 'book3@example.com');
    const challengeId = await createChallenge(app, cookie);
    const res = await app.inject({
      method: 'POST',
      url: `/api/challenges/${challengeId}/books`,
      headers: { cookie },
      payload: { title: 'No Author' },
    });
    expect(res.statusCode).toBe(400);
  });

  it('updates and deletes a book', async () => {
    const cookie = await registerAndGetCookie(app, 'book4@example.com');
    const challengeId = await createChallenge(app, cookie);
    const created = await app.inject({
      method: 'POST',
      url: `/api/challenges/${challengeId}/books`,
      headers: { cookie },
      payload: { title: 'Range', author: 'David Epstein' },
    });
    const id = created.json().book.id;

    const patch = await app.inject({
      method: 'PATCH',
      url: `/api/books/${id}`,
      headers: { cookie },
      payload: { readingStatus: 'reading' },
    });
    expect(patch.json().book.readingStatus).toBe('reading');

    const del = await app.inject({ method: 'DELETE', url: `/api/books/${id}`, headers: { cookie } });
    expect(del.statusCode).toBe(204);
  });
});
