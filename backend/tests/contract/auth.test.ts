import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { makeApp } from '../helpers.js';

describe('auth endpoints', () => {
  let app: FastifyInstance;
  beforeAll(async () => {
    app = await makeApp();
  });
  afterAll(async () => {
    await app.close();
  });

  it('registers a user and sets a session', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email: 'a@example.com', password: 'password123' },
    });
    expect(res.statusCode).toBe(201);
    expect(res.json().user.email).toBe('a@example.com');
    expect(res.cookies.find((c) => c.name === 'sid')).toBeDefined();
  });

  it('rejects short passwords with 400', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email: 'b@example.com', password: 'short' },
    });
    expect(res.statusCode).toBe(400);
  });

  it('rejects duplicate email with 409', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email: 'dup@example.com', password: 'password123' },
    });
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email: 'dup@example.com', password: 'password123' },
    });
    expect(res.statusCode).toBe(409);
  });

  it('returns 401 from /me without a session', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/auth/me' });
    expect(res.statusCode).toBe(401);
  });

  it('logs in and resolves /me', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email: 'c@example.com', password: 'password123' },
    });
    const login = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: 'c@example.com', password: 'password123' },
    });
    expect(login.statusCode).toBe(200);
    const sid = login.cookies.find((c) => c.name === 'sid');
    const me = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: { cookie: `sid=${sid?.value}` },
    });
    expect(me.statusCode).toBe(200);
    expect(me.json().user.email).toBe('c@example.com');
  });
});
