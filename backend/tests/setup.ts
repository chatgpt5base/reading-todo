import { afterAll, beforeEach } from 'vitest';
import { prisma } from '../src/models/db.js';

beforeEach(async () => {
  // Order matters due to FK constraints: children first.
  await prisma.book.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
