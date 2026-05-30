import type { Book, CreateBookInput, UpdateBookInput } from '@reading-todo/shared';
import { prisma } from '../models/db.js';
import { notFound } from '../lib/errors.js';

type BookRow = {
  id: string;
  challengeId: string;
  title: string;
  author: string;
  readingReason: string | null;
  readingStatus: string;
  createdAt: Date;
};

function toDto(row: BookRow): Book {
  return {
    id: row.id,
    challengeId: row.challengeId,
    title: row.title,
    author: row.author,
    readingReason: row.readingReason,
    readingStatus: row.readingStatus as Book['readingStatus'],
    createdAt: row.createdAt.toISOString(),
  };
}

/** Ensure the challenge exists and is owned by the user. */
async function assertOwnedChallenge(userId: string, challengeId: string): Promise<void> {
  const challenge = await prisma.challenge.findFirst({ where: { id: challengeId, userId } });
  if (!challenge) throw notFound('Challenge not found');
}

/** Fetch a book whose challenge is owned by the user, or throw 404. */
async function ownedBook(userId: string, id: string): Promise<BookRow> {
  const book = await prisma.book.findFirst({
    where: { id, challenge: { userId } },
  });
  if (!book) throw notFound('Book not found');
  return book;
}

export async function listBooks(userId: string, challengeId: string): Promise<Book[]> {
  await assertOwnedChallenge(userId, challengeId);
  const rows = await prisma.book.findMany({
    where: { challengeId },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(toDto);
}

export async function getBook(userId: string, id: string): Promise<Book> {
  return toDto(await ownedBook(userId, id));
}

export async function createBook(
  userId: string,
  challengeId: string,
  input: CreateBookInput,
): Promise<Book> {
  await assertOwnedChallenge(userId, challengeId);
  const row = await prisma.book.create({
    data: {
      challengeId,
      title: input.title,
      author: input.author,
      readingReason: input.readingReason ?? null,
      readingStatus: input.readingStatus ?? 'to_read',
    },
  });
  return toDto(row);
}

export async function updateBook(
  userId: string,
  id: string,
  input: UpdateBookInput,
): Promise<Book> {
  await ownedBook(userId, id);
  const row = await prisma.book.update({ where: { id }, data: input });
  return toDto(row);
}

export async function deleteBook(userId: string, id: string): Promise<void> {
  await ownedBook(userId, id);
  await prisma.book.delete({ where: { id } });
}
