import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Book, Challenge, CreateChallengeInput } from '@reading-todo/shared';
import { api } from './api.js';

export function useChallenges() {
  return useQuery<Challenge[]>({
    queryKey: ['challenges'],
    queryFn: () => api<Challenge[]>('/api/challenges'),
  });
}

export function useChallenge(id: string) {
  return useQuery<{ challenge: Challenge; books: Book[] }>({
    queryKey: ['challenge', id],
    queryFn: () => api<{ challenge: Challenge; books: Book[] }>(`/api/challenges/${id}`),
  });
}

export function useCreateChallenge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateChallengeInput) =>
      api<{ challenge: Challenge }>('/api/challenges', { method: 'POST', json: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['challenges'] }),
  });
}

export function useDeleteChallenge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, confirm }: { id: string; confirm?: boolean }) =>
      api<void>(`/api/challenges/${id}${confirm ? '?confirm=true' : ''}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['challenges'] }),
  });
}
