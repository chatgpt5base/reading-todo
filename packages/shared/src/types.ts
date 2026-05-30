import type { z } from 'zod';
import type {
  credentialsSchema,
  createChallengeSchema,
  updateChallengeSchema,
  createBookSchema,
  updateBookSchema,
  challengeStatusSchema,
  readingStatusSchema,
  createNoteSchema,
  createActionSchema,
  cadenceSchema,
} from './schemas.js';

export type Credentials = z.infer<typeof credentialsSchema>;
export type CreateChallengeInput = z.infer<typeof createChallengeSchema>;
export type UpdateChallengeInput = z.infer<typeof updateChallengeSchema>;
export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;
export type ChallengeStatus = z.infer<typeof challengeStatusSchema>;
export type ReadingStatus = z.infer<typeof readingStatusSchema>;
export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type CreateActionInput = z.infer<typeof createActionSchema>;
export type Cadence = z.infer<typeof cadenceSchema>;

export interface PublicUser {
  id: string;
  email: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string | null;
  status: ChallengeStatus;
  createdAt: string;
}

export interface Book {
  id: string;
  challengeId: string;
  title: string;
  author: string;
  readingReason: string | null;
  readingStatus: ReadingStatus;
  createdAt: string;
}

export interface Note {
  id: string;
  bookId: string;
  content: string;
  createdAt: string;
}

export interface Action {
  id: string;
  noteId: string | null;
  description: string;
  cadence: Cadence;
  sourceNoteDeleted: boolean;
  createdAt: string;
}

export interface ApiError {
  error: { code: string; message: string };
}
