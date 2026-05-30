import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Book, CreateBookInput } from '@reading-todo/shared';
import { api } from './api.js';

export function useBook(id: string) {
  return useQuery<Book>({
    queryKey: ['book', id],
    queryFn: () => api<{ book: Book }>(`/api/books/${id}`).then((r) => r.book),
  });
}

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
