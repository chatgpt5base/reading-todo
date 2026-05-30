import type { FastifyInstance } from 'fastify';
import { createChallengeSchema, updateChallengeSchema } from '@reading-todo/shared';
import { requireUser } from '../lib/auth.js';
import {
  createChallenge,
  deleteChallenge,
  getChallenge,
  listChallenges,
  updateChallenge,
} from '../services/challenge.js';
import { listBooks } from '../services/book.js';

export async function challengeRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/challenges', async (req, reply) => {
    const user = await requireUser(req);
    return reply.send(await listChallenges(user.id));
  });

  app.post('/api/challenges', async (req, reply) => {
    const user = await requireUser(req);
    const input = createChallengeSchema.parse(req.body);
    return reply.status(201).send({ challenge: await createChallenge(user.id, input) });
  });

  app.get('/api/challenges/:id', async (req, reply) => {
    const user = await requireUser(req);
    const { id } = req.params as { id: string };
    const challenge = await getChallenge(user.id, id);
    const books = await listBooks(user.id, id);
    return reply.send({ challenge, books });
  });

  app.patch('/api/challenges/:id', async (req, reply) => {
    const user = await requireUser(req);
    const { id } = req.params as { id: string };
    const input = updateChallengeSchema.parse(req.body);
    return reply.send({ challenge: await updateChallenge(user.id, id, input) });
  });

  app.delete('/api/challenges/:id', async (req, reply) => {
    const user = await requireUser(req);
    const { id } = req.params as { id: string };
    const { confirm } = req.query as { confirm?: string };
    await deleteChallenge(user.id, id, confirm === 'true');
    return reply.status(204).send();
  });
}
