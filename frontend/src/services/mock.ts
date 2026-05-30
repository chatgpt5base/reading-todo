import type { Action, Book, Challenge, Note, PublicUser } from '@reading-todo/shared';
import { ApiRequestError } from './api.js';

/**
 * In-memory (localStorage-backed) mock of the backend API, used for standalone
 * frontend verification when the real backend is "pended". Enabled via VITE_MOCK.
 * This is dev-only and never runs in production builds without the flag.
 */

const KEY = 'rt_mock_db_v1';
const CADENCES = ['daily', 'weekly', 'monthly', 'one_time'];

// Auth is pended in mock mode: the app runs as a fixed guest user so the
// register/login screen is skipped entirely.
const GUEST_USER: PublicUser = { id: 'mock-guest', email: 'guest@local' };

interface MockDb {
  user: PublicUser | null;
  challenges: Challenge[];
  books: Book[];
  notes: Note[];
  actions: Action[];
}

function load(): MockDb {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as MockDb;
  } catch {
    // ignore corrupt storage
  }
  return { user: null, challenges: [], books: [], notes: [], actions: [] };
}

function save(db: MockDb): void {
  localStorage.setItem(KEY, JSON.stringify(db));
}

function id(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

function bad(message: string): never {
  throw new ApiRequestError(400, 'validation_error', message);
}

function requireText(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) bad(`${label} is required`);
  return (value as string).trim();
}

type Body = Record<string, unknown> | undefined;

export async function mockApi<T>(
  path: string,
  options: { method?: string; json?: unknown } = {},
): Promise<T> {
  const method = (options.method ?? 'GET').toUpperCase();
  const body = options.json as Body;
  const [rawPath, query = ''] = path.split('?');
  const db = load();
  const result = route(db, method, rawPath, query, body);
  save(db);
  // Simulate async latency lightly.
  await Promise.resolve();
  return result as T;
}

function route(db: MockDb, method: string, path: string, query: string, body: Body): unknown {
  // --- Auth (pended: always the guest user, no register/login required) ---
  if (path === '/api/auth/me' && method === 'GET') {
    db.user = db.user ?? GUEST_USER;
    return { user: db.user };
  }
  if (
    (path === '/api/auth/register' || path === '/api/auth/login') &&
    method === 'POST'
  ) {
    db.user = db.user ?? GUEST_USER;
    return { user: db.user };
  }
  if (path === '/api/auth/logout' && method === 'POST') {
    // Logout is a no-op while auth is pended; stay signed in as guest.
    return undefined;
  }

  // --- Challenges ---
  if (path === '/api/challenges' && method === 'GET') {
    return [...db.challenges].reverse();
  }
  if (path === '/api/challenges' && method === 'POST') {
    const challenge: Challenge = {
      id: id(),
      title: requireText(body?.title, 'Title'),
      description: (body?.description as string)?.trim() || null,
      status: 'active',
      createdAt: now(),
    };
    db.challenges.push(challenge);
    return { challenge };
  }

  let m = path.match(/^\/api\/challenges\/([^/]+)$/);
  if (m) {
    const cid = m[1];
    const challenge = db.challenges.find((c) => c.id === cid);
    if (!challenge) throw new ApiRequestError(404, 'not_found', 'Challenge not found');
    if (method === 'GET') {
      const books = db.books.filter((b) => b.challengeId === cid).reverse();
      return { challenge, books };
    }
    if (method === 'DELETE') {
      const hasBooks = db.books.some((b) => b.challengeId === cid);
      if (hasBooks && !query.includes('confirm=true')) {
        throw new ApiRequestError(409, 'conflict', 'This challenge has books that will also be deleted');
      }
      const bookIds = db.books.filter((b) => b.challengeId === cid).map((b) => b.id);
      const noteIds = db.notes.filter((n) => bookIds.includes(n.bookId)).map((n) => n.id);
      db.actions = db.actions.filter((a) => !a.noteId || !noteIds.includes(a.noteId));
      db.notes = db.notes.filter((n) => !bookIds.includes(n.bookId));
      db.books = db.books.filter((b) => b.challengeId !== cid);
      db.challenges = db.challenges.filter((c) => c.id !== cid);
      return undefined;
    }
  }

  // --- Books ---
  m = path.match(/^\/api\/challenges\/([^/]+)\/books$/);
  if (m && method === 'POST') {
    const cid = m[1];
    if (!db.challenges.some((c) => c.id === cid))
      throw new ApiRequestError(404, 'not_found', 'Challenge not found');
    const book: Book = {
      id: id(),
      challengeId: cid,
      title: requireText(body?.title, 'Title'),
      author: requireText(body?.author, 'Author'),
      readingReason: (body?.readingReason as string)?.trim() || null,
      readingStatus: (body?.readingStatus as Book['readingStatus']) ?? 'to_read',
      createdAt: now(),
    };
    db.books.push(book);
    return { book };
  }

  m = path.match(/^\/api\/books\/([^/]+)$/);
  if (m) {
    const bid = m[1];
    const book = db.books.find((b) => b.id === bid);
    if (!book) throw new ApiRequestError(404, 'not_found', 'Book not found');
    if (method === 'GET') return { book };
    if (method === 'DELETE') {
      const noteIds = db.notes.filter((n) => n.bookId === bid).map((n) => n.id);
      db.actions = db.actions.filter((a) => !a.noteId || !noteIds.includes(a.noteId));
      db.notes = db.notes.filter((n) => n.bookId !== bid);
      db.books = db.books.filter((b) => b.id !== bid);
      return undefined;
    }
  }

  // --- Notes ---
  m = path.match(/^\/api\/books\/([^/]+)\/notes$/);
  if (m) {
    const bid = m[1];
    if (!db.books.some((b) => b.id === bid))
      throw new ApiRequestError(404, 'not_found', 'Book not found');
    if (method === 'GET') return db.notes.filter((n) => n.bookId === bid).reverse();
    if (method === 'POST') {
      const note: Note = {
        id: id(),
        bookId: bid,
        content: requireText(body?.content, 'Note content'),
        createdAt: now(),
      };
      db.notes.push(note);
      return { note };
    }
  }

  m = path.match(/^\/api\/notes\/([^/]+)$/);
  if (m && method === 'DELETE') {
    const nid = m[1];
    db.actions = db.actions.map((a) =>
      a.noteId === nid ? { ...a, noteId: null, sourceNoteDeleted: true } : a,
    );
    db.notes = db.notes.filter((n) => n.id !== nid);
    return undefined;
  }

  // --- Actions ---
  m = path.match(/^\/api\/notes\/([^/]+)\/actions$/);
  if (m) {
    const nid = m[1];
    if (!db.notes.some((n) => n.id === nid))
      throw new ApiRequestError(404, 'not_found', 'Note not found');
    if (method === 'GET') return db.actions.filter((a) => a.noteId === nid).reverse();
    if (method === 'POST') {
      const cadence = body?.cadence as string;
      if (!CADENCES.includes(cadence)) bad('Cadence is required');
      const action: Action = {
        id: id(),
        noteId: nid,
        description: requireText(body?.description, 'Action description'),
        cadence: cadence as Action['cadence'],
        sourceNoteDeleted: false,
        createdAt: now(),
      };
      db.actions.push(action);
      return { action };
    }
  }

  throw new ApiRequestError(404, 'not_found', `No mock handler for ${method} ${path}`);
}

export const MOCK_ENABLED =
  import.meta.env.VITE_MOCK === '1' || import.meta.env.VITE_MOCK === 'true';
