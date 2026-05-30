import Fastify, { type FastifyInstance } from 'fastify';
import cookie from '@fastify/cookie';
import { registerErrorHandler } from './lib/errors.js';
import { authRoutes } from './api/auth.js';
import { challengeRoutes } from './api/challenges.js';
import { bookRoutes } from './api/books.js';
import { noteRoutes } from './api/notes.js';
import { actionRoutes } from './api/actions.js';

export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: process.env.NODE_ENV !== 'test' });

  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET must be set and at least 32 characters long');
  }

  app.register(cookie, { secret });

  registerErrorHandler(app);

  app.get('/api/health', async () => ({ status: 'ok' }));

  app.register(authRoutes);
  app.register(challengeRoutes);
  app.register(bookRoutes);
  app.register(noteRoutes);
  app.register(actionRoutes);

  return app;
}
