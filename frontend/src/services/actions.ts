import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Action, CreateActionInput } from '@reading-todo/shared';
import { api } from './api.js';

export function useActions(noteId: string) {
  return useQuery<Action[]>({
    queryKey: ['actions', noteId],
    queryFn: () => api<Action[]>(`/api/notes/${noteId}/actions`),
  });
}

export function useCreateAction(noteId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateActionInput) =>
      api<{ action: Action }>(`/api/notes/${noteId}/actions`, { method: 'POST', json: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['actions', noteId] }),
  });
}
