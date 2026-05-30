import type { ApiError } from '@reading-todo/shared';

export class ApiRequestError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

/** Thin fetch wrapper: sends cookies, parses JSON, and surfaces the API error shape. */
export async function api<T>(
  path: string,
  options: RequestInit & { json?: unknown } = {},
): Promise<T> {
  const { json, headers, ...rest } = options;
  const res = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
    ...rest,
  });

  if (res.status === 204) return undefined as T;

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : undefined;

  if (!res.ok) {
    const err = (data as ApiError | undefined)?.error;
    throw new ApiRequestError(res.status, err?.code ?? 'error', err?.message ?? res.statusText);
  }
  return data as T;
}
