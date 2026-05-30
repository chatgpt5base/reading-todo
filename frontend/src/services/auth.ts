import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Credentials, PublicUser } from '@reading-todo/shared';
import { api, ApiRequestError } from './api.js';

export function useMe() {
  return useQuery<PublicUser | null>({
    queryKey: ['me'],
    queryFn: async () => {
      try {
        const res = await api<{ user: PublicUser }>('/api/auth/me');
        return res.user;
      } catch (err) {
        if (err instanceof ApiRequestError && err.status === 401) return null;
        throw err;
      }
    },
  });
}

export function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Credentials) =>
      api<{ user: PublicUser }>('/api/auth/register', { method: 'POST', json: input }),
    onSuccess: (res) => qc.setQueryData(['me'], res.user),
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Credentials) =>
      api<{ user: PublicUser }>('/api/auth/login', { method: 'POST', json: input }),
    onSuccess: (res) => qc.setQueryData(['me'], res.user),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api<void>('/api/auth/logout', { method: 'POST' }),
    onSuccess: () => qc.setQueryData(['me'], null),
  });
}
