import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../models/db.js';
import { unauthorized } from './errors.js';

const SESSION_COOKIE = 'sid';

/** Hash a password using scrypt with a per-user random salt. Format: salt:hash (hex). */
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const derived = scryptSync(password, salt, 64);
  return `${salt.toString('hex')}:${derived.toString('hex')}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [saltHex, hashHex] = stored.split(':');
  if (!saltHex || !hashHex) return false;
  const salt = Buffer.from(saltHex, 'hex');
  const expected = Buffer.from(hashHex, 'hex');
  const derived = scryptSync(password, salt, expected.length);
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}

/** Set the signed session cookie identifying the user. */
export function setSession(reply: FastifyReply, userId: string): void {
  reply.setCookie(SESSION_COOKIE, userId, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    signed: true,
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearSession(reply: FastifyReply): void {
  reply.clearCookie(SESSION_COOKIE, { path: '/' });
}

/** Resolve the current user id from the signed cookie, or null. */
export function getUserId(req: FastifyRequest): string | null {
  const raw = req.cookies[SESSION_COOKIE];
  if (!raw) return null;
  const unsigned = req.unsignCookie(raw);
  return unsigned.valid ? unsigned.value : null;
}

/** Require an authenticated, existing user; throws 401 otherwise. */
export async function requireUser(req: FastifyRequest): Promise<{ id: string; email: string }> {
  const userId = getUserId(req);
  if (!userId) throw unauthorized();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw unauthorized();
  return { id: user.id, email: user.email };
}
