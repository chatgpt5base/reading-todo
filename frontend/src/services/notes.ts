import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateNoteInput, Note } from '@reading-todo/shared';
import { api } from './api.js';

export function useNotes(bookId: string) {
  return useQuery<Note[]>({
    queryKey: ['notes', bookId],
    queryFn: () => api<Note[]>(`/api/books/${bookId}/notes`),
  });
}

export function useCreateNote(bookId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateNoteInput) =>
      api<{ note: Note }>(`/api/books/${bookId}/notes`, { method: 'POST', json: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes', bookId] }),
  });
}
