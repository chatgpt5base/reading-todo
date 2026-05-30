import type { FastifyInstance } from 'fastify';
import { createActionSchema } from '@reading-todo/shared';
import { requireUser } from '../lib/auth.js';
import { createAction, listActionsForNote } from '../services/action.js';

export async function actionRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/notes/:noteId/actions', async (req, reply) => {
    const user = await requireUser(req);
    const { noteId } = req.params as { noteId: string };
    return reply.send(await listActionsForNote(user.id, noteId));
  });

  app.post('/api/notes/:noteId/actions', async (req, reply) => {
    const user = await requireUser(req);
    const { noteId } = req.params as { noteId: string };
    const input = createActionSchema.parse(req.body);
    return reply.status(201).send({ action: await createAction(user.id, noteId, input) });
  });
}
