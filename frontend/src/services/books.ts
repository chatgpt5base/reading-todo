import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Book, CreateBookInput } from '@reading-todo/shared';
import { api } from './api.js';

export function useCreateBook(challengeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBookInput) =>
      api<{ book: Book }>(`/api/challenges/${challengeId}/books`, {
        method: 'POST',
        json: input,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['challenge', challengeId] }),
  });
}

export function useDeleteBook(challengeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api<void>(`/api/books/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['challenge', challengeId] }),
  });
}
