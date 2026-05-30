import type { FastifyInstance } from 'fastify';
import { createBookSchema, updateBookSchema } from '@reading-todo/shared';
import { requireUser } from '../lib/auth.js';
import {
  createBook,
  deleteBook,
  getBook,
  listBooks,
  updateBook,
} from '../services/book.js';

export async function bookRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/challenges/:challengeId/books', async (req, reply) => {
    const user = await requireUser(req);
    const { challengeId } = req.params as { challengeId: string };
    return reply.send(await listBooks(user.id, challengeId));
  });

  app.post('/api/challenges/:challengeId/books', async (req, reply) => {
    const user = await requireUser(req);
    const { challengeId } = req.params as { challengeId: string };
    const input = createBookSchema.parse(req.body);
    return reply.status(201).send({ book: await createBook(user.id, challengeId, input) });
  });

  app.get('/api/books/:id', async (req, reply) => {
    const user = await requireUser(req);
    const { id } = req.params as { id: string };
    return reply.send({ book: await getBook(user.id, id) });
  });

  app.patch('/api/books/:id', async (req, reply) => {
    const user = await requireUser(req);
    const { id } = req.params as { id: string };
    const input = updateBookSchema.parse(req.body);
    return reply.send({ book: await updateBook(user.id, id, input) });
  });

  app.delete('/api/books/:id', async (req, reply) => {
    const user = await requireUser(req);
    const { id } = req.params as { id: string };
    await deleteBook(user.id, id);
    return reply.status(204).send();
  });
}
