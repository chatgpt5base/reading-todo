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
  // When the backend is "pended" (VITE_MOCK), serve from the in-memory mock instead.
  if (import.meta.env.VITE_MOCK === '1' || import.meta.env.VITE_MOCK === 'true') {
    const { mockApi } = await import('./mock.js');
    return mockApi<T>(path, { method: options.method, json: options.json });
  }

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
