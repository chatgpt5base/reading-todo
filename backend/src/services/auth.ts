import type { Credentials, PublicUser } from '@reading-todo/shared';
import { prisma } from '../models/db.js';
import { hashPassword, verifyPassword } from '../lib/auth.js';
import { conflict, unauthorized } from '../lib/errors.js';

export async function registerUser(input: Credentials): Promise<PublicUser> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw conflict('An account with this email already exists');
  const user = await prisma.user.create({
    data: { email: input.email, passwordHash: hashPassword(input.password) },
  });
  return { id: user.id, email: user.email };
}

export async function authenticate(input: Credentials): Promise<PublicUser> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !verifyPassword(input.password, user.passwordHash)) {
    throw unauthorized('Invalid email or password');
  }
  return { id: user.id, email: user.email };
}
