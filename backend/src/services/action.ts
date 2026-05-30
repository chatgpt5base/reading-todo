import type { Action, CreateActionInput } from '@reading-todo/shared';
import { prisma } from '../models/db.js';
import { ownedNote } from './note.js';

type ActionRow = {
  id: string;
  noteId: string | null;
  description: string;
  cadence: string;
  sourceNoteDeleted: boolean;
  createdAt: Date;
};

function toDto(row: ActionRow): Action {
  return {
    id: row.id,
    noteId: row.noteId,
    description: row.description,
    cadence: row.cadence as Action['cadence'],
    sourceNoteDeleted: row.sourceNoteDeleted,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listActionsForNote(userId: string, noteId: string): Promise<Action[]> {
  await ownedNote(userId, noteId);
  const rows = await prisma.action.findMany({
    where: { noteId },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(toDto);
}

/** Create an action from a note. Cadence is required (enforced by the schema, FR-006). */
export async function createAction(
  userId: string,
  noteId: string,
  input: CreateActionInput,
): Promise<Action> {
  await ownedNote(userId, noteId);
  const row = await prisma.action.create({
    data: { noteId, description: input.description, cadence: input.cadence },
  });
  return toDto(row);
}
