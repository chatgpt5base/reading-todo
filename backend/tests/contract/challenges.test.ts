import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { makeApp, registerAndGetCookie } from '../helpers.js';

describe('challenge endpoints', () => {
  let app: FastifyInstance;
  beforeAll(async () => {
    app = await makeApp();
  });
  afterAll(async () => {
    await app.close();
  });

  it('requires authentication', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/challenges' });
    expect(res.statusCode).toBe(401);
  });

  it('creates, lists, gets, updates, and deletes a challenge', async () => {
    const cookie = await registerAndGetCookie(app, 'ch@example.com');

    const create = await app.inject({
      method: 'POST',
      url: '/api/challenges',
      headers: { cookie },
      payload: { title: 'Stop procrastinating', description: 'Be more consistent' },
    });
    expect(create.statusCode).toBe(201);
    const id = create.json().challenge.id;

    const list = await app.inject({ method: 'GET', url: '/api/challenges', headers: { cookie } });
    expect(list.statusCode).toBe(200);
    expect(list.json()).toHaveLength(1);

    const get = await app.inject({
      method: 'GET',
      url: `/api/challenges/${id}`,
      headers: { cookie },
    });
    expect(get.statusCode).toBe(200);
    expect(get.json().challenge.title).toBe('Stop procrastinating');
    expect(get.json().books).toEqual([]);

    const patch = await app.inject({
      method: 'PATCH',
      url: `/api/challenges/${id}`,
      headers: { cookie },
      payload: { status: 'archived' },
    });
    expect(patch.statusCode).toBe(200);
    expect(patch.json().challenge.status).toBe('archived');

    const del = await app.inject({
      method: 'DELETE',
      url: `/api/challenges/${id}`,
      headers: { cookie },
    });
    expect(del.statusCode).toBe(204);
  });

  it('rejects an empty title with 400', async () => {
    const cookie = await registerAndGetCookie(app, 'ch2@example.com');
    const res = await app.inject({
      method: 'POST',
      url: '/api/challenges',
      headers: { cookie },
      payload: { title: '   ' },
    });
    expect(res.statusCode).toBe(400);
  });

  it('does not expose other users challenges', async () => {
    const cookieA = await registerAndGetCookie(app, 'owner@example.com');
    const created = await app.inject({
      method: 'POST',
      url: '/api/challenges',
      headers: { cookie: cookieA },
      payload: { title: 'Private goal' },
    });
    const id = created.json().challenge.id;

    const cookieB = await registerAndGetCookie(app, 'intruder@example.com');
    const res = await app.inject({
      method: 'GET',
      url: `/api/challenges/${id}`,
      headers: { cookie: cookieB },
    });
    expect(res.statusCode).toBe(404);
  });
});
