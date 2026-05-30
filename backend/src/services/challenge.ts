import type {
  Challenge,
  CreateChallengeInput,
  UpdateChallengeInput,
} from '@reading-todo/shared';
import { prisma } from '../models/db.js';
import { conflict, notFound } from '../lib/errors.js';

type ChallengeRow = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  createdAt: Date;
};

function toDto(row: ChallengeRow): Challenge {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status as Challenge['status'],
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listChallenges(userId: string): Promise<Challenge[]> {
  const rows = await prisma.challenge.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(toDto);
}

/** Fetch a challenge owned by the user, or throw 404 (also covers not-owner). */
async function ownedChallenge(userId: string, id: string): Promise<ChallengeRow> {
  const row = await prisma.challenge.findFirst({ where: { id, userId } });
  if (!row) throw notFound('Challenge not found');
  return row;
}

export async function getChallenge(userId: string, id: string): Promise<Challenge> {
  return toDto(await ownedChallenge(userId, id));
}

export async function createChallenge(
  userId: string,
  input: CreateChallengeInput,
): Promise<Challenge> {
  const row = await prisma.challenge.create({
    data: { userId, title: input.title, description: input.description ?? null },
  });
  return toDto(row);
}

export async function updateChallenge(
  userId: string,
  id: string,
  input: UpdateChallengeInput,
): Promise<Challenge> {
  await ownedChallenge(userId, id);
  const row = await prisma.challenge.update({ where: { id }, data: input });
  return toDto(row);
}

/**
 * Delete a challenge. If it has dependent books and confirm is not set, throw 409
 * so the client can ask the user to confirm cascading deletion (FR-012).
 */
export async function deleteChallenge(
  userId: string,
  id: string,
  confirm: boolean,
): Promise<void> {
  await ownedChallenge(userId, id);
  const bookCount = await prisma.book.count({ where: { challengeId: id } });
  if (bookCount > 0 && !confirm) {
    throw conflict(`This challenge has ${bookCount} book(s) that will also be deleted`);
  }
  await prisma.challenge.delete({ where: { id } });
}
