import type { FastifyInstance } from 'fastify';
import { buildApp } from '../src/server.js';

export async function makeApp(): Promise<FastifyInstance> {
  const app = buildApp();
  await app.ready();
  return app;
}

/** Register a user and return a Cookie header string carrying the session. */
export async function registerAndGetCookie(
  app: FastifyInstance,
  email = 'user@example.com',
  password = 'password123',
): Promise<string> {
  const res = await app.inject({
    method: 'POST',
    url: '/api/auth/register',
    payload: { email, password },
  });
  const sid = res.cookies.find((c) => c.name === 'sid');
  if (!sid) throw new Error('No session cookie returned from register');
  return `sid=${sid.value}`;
}
