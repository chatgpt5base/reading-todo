import type { CreateNoteInput, Note } from '@reading-todo/shared';
import { prisma } from '../models/db.js';
import { notFound } from '../lib/errors.js';

type NoteRow = { id: string; bookId: string; content: string; createdAt: Date };

function toDto(row: NoteRow): Note {
  return {
    id: row.id,
    bookId: row.bookId,
    content: row.content,
    createdAt: row.createdAt.toISOString(),
  };
}

/** Ensure the book exists and is owned by the user (via challenge -> user). */
async function assertOwnedBook(userId: string, bookId: string): Promise<void> {
  const book = await prisma.book.findFirst({
    where: { id: bookId, challenge: { userId } },
  });
  if (!book) throw notFound('Book not found');
}

/** Fetch a note whose book/challenge is owned by the user, or throw 404. */
export async function ownedNote(userId: string, id: string): Promise<NoteRow> {
  const note = await prisma.note.findFirst({
    where: { id, book: { challenge: { userId } } },
  });
  if (!note) throw notFound('Note not found');
  return note;
}

export async function listNotes(userId: string, bookId: string): Promise<Note[]> {
  await assertOwnedBook(userId, bookId);
  const rows = await prisma.note.findMany({
    where: { bookId },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(toDto);
}

export async function createNote(
  userId: string,
  bookId: string,
  input: CreateNoteInput,
): Promise<Note> {
  await assertOwnedBook(userId, bookId);
  const row = await prisma.note.create({ data: { bookId, content: input.content } });
  return toDto(row);
}

/**
 * Delete a note. Actions derived from it are NOT deleted; they are detached
 * (noteId set null by the DB) and flagged so traceability records the source was
 * removed (spec edge case).
 */
export async function deleteNote(userId: string, id: string): Promise<void> {
  await ownedNote(userId, id);
  await prisma.action.updateMany({ where: { noteId: id }, data: { sourceNoteDeleted: true } });
  await prisma.note.delete({ where: { id } });
}
