import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';

/** Application error with a stable code and HTTP status. */
export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const notFound = (msg = 'Resource not found') => new AppError(404, 'not_found', msg);
export const unauthorized = (msg = 'Authentication required') =>
  new AppError(401, 'unauthorized', msg);
export const forbidden = (msg = 'Not allowed') => new AppError(403, 'forbidden', msg);
export const conflict = (msg = 'Conflict') => new AppError(409, 'conflict', msg);
export const badRequest = (msg = 'Invalid request') => new AppError(400, 'bad_request', msg);

/** Registers a consistent JSON error shape: { error: { code, message } }. */
export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((err: unknown, _req: FastifyRequest, reply: FastifyReply) => {
    if (err instanceof AppError) {
      return reply.status(err.status).send({ error: { code: err.code, message: err.message } });
    }
    if (err instanceof ZodError) {
      const message = err.issues.map((i) => `${i.path.join('.') || 'body'}: ${i.message}`).join('; ');
      return reply.status(400).send({ error: { code: 'validation_error', message } });
    }
    _req.log.error(err);
    return reply
      .status(500)
      .send({ error: { code: 'internal_error', message: 'Something went wrong' } });
  });
}
