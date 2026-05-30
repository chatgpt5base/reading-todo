import type { FastifyInstance } from 'fastify';
import { createNoteSchema } from '@reading-todo/shared';
import { requireUser } from '../lib/auth.js';
import { createNote, deleteNote, listNotes } from '../services/note.js';

export async function noteRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/books/:bookId/notes', async (req, reply) => {
    const user = await requireUser(req);
    const { bookId } = req.params as { bookId: string };
    return reply.send(await listNotes(user.id, bookId));
  });

  app.post('/api/books/:bookId/notes', async (req, reply) => {
    const user = await requireUser(req);
    const { bookId } = req.params as { bookId: string };
    const input = createNoteSchema.parse(req.body);
    return reply.status(201).send({ note: await createNote(user.id, bookId, input) });
  });

  app.delete('/api/notes/:id', async (req, reply) => {
    const user = await requireUser(req);
    const { id } = req.params as { id: string };
    await deleteNote(user.id, id);
    return reply.status(204).send();
  });
}
