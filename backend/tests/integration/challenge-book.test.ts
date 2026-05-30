import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { makeApp, registerAndGetCookie } from '../helpers.js';

/**
 * US1 Independent Test: create a challenge, add a book with a reason, and confirm the
 * challenge shows its linked book and reason — including after a fresh fetch (persistence).
 */
describe('US1: connect a challenge to a book with intent', () => {
  let app: FastifyInstance;
  beforeAll(async () => {
    app = await makeApp();
  });
  afterAll(async () => {
    await app.close();
  });

  it('links a book with a reading reason to a challenge and persists it', async () => {
    const cookie = await registerAndGetCookie(app, 'flow@example.com');

    const challenge = await app
      .inject({
        method: 'POST',
        url: '/api/challenges',
        headers: { cookie },
        payload: { title: 'Manage my time better' },
      })
      .then((r) => r.json().challenge);

    await app.inject({
      method: 'POST',
      url: `/api/challenges/${challenge.id}/books`,
      headers: { cookie },
      payload: {
        title: 'Getting Things Done',
        author: 'David Allen',
        readingReason: 'My task list keeps overwhelming me',
      },
    });

    // Re-fetch the challenge detail as a fresh request (simulates reload).
    const reloaded = await app.inject({
      method: 'GET',
      url: `/api/challenges/${challenge.id}`,
      headers: { cookie },
    });
    const body = reloaded.json();
    expect(body.challenge.id).toBe(challenge.id);
    expect(body.books).toHaveLength(1);
    expect(body.books[0].title).toBe('Getting Things Done');
    expect(body.books[0].readingReason).toBe('My task list keeps overwhelming me');
  });
});
