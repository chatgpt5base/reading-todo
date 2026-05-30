import { z } from 'zod';

// Auth (minimal: email + password)
export const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Challenge
export const challengeStatusSchema = z.enum(['active', 'archived']);

export const createChallengeSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().trim().max(2000).optional(),
});

export const updateChallengeSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(2000).optional(),
    status: challengeStatusSchema.optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'No fields to update' });

// Book
export const readingStatusSchema = z.enum(['to_read', 'reading', 'done']);

export const createBookSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(300),
  author: z.string().trim().min(1, 'Author is required').max(200),
  readingReason: z.string().trim().max(2000).optional(),
  readingStatus: readingStatusSchema.optional(),
});

export const updateBookSchema = z
  .object({
    title: z.string().trim().min(1).max(300).optional(),
    author: z.string().trim().min(1).max(200).optional(),
    readingReason: z.string().trim().max(2000).optional(),
    readingStatus: readingStatusSchema.optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'No fields to update' });
