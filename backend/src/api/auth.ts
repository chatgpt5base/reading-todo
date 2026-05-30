import type { FastifyInstance } from 'fastify';
import { credentialsSchema } from '@reading-todo/shared';
import { authenticate, registerUser } from '../services/auth.js';
import { clearSession, requireUser, setSession } from '../lib/auth.js';

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post('/api/auth/register', async (req, reply) => {
    const input = credentialsSchema.parse(req.body);
    const user = await registerUser(input);
    setSession(reply, user.id);
    return reply.status(201).send({ user });
  });

  app.post('/api/auth/login', async (req, reply) => {
    const input = credentialsSchema.parse(req.body);
    const user = await authenticate(input);
    setSession(reply, user.id);
    return reply.send({ user });
  });

  app.post('/api/auth/logout', async (_req, reply) => {
    clearSession(reply);
    return reply.status(204).send();
  });

  app.get('/api/auth/me', async (req, reply) => {
    const user = await requireUser(req);
    return reply.send({ user });
  });
}
