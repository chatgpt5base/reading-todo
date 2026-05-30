import { useState, type FormEvent } from 'react';
import type { Cadence } from '@reading-todo/shared';
import { useActions, useCreateAction } from '../services/actions.js';
import { ApiRequestError } from '../services/api.js';
import { Button } from './ui.js';

const CADENCES: { value: Cadence; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'one_time', label: 'One-time' },
];

/** Lists actions derived from a note and lets the user convert the note into a new action. */
export function NoteActions({ noteId }: { noteId: string }) {
  const { data: actions } = useActions(noteId);
  const create = useCreateAction(noteId);
  const [description, setDescription] = useState('');
  const [cadence, setCadence] = useState<Cadence>('one_time');
  const [error, setError] = useState<string | null>(null);

  async function onConvert(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await create.mutateAsync({ description, cadence });
      setDescription('');
      setCadence('one_time');
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Could not create action');
    }
  }

  return (
    <div style={{ marginTop: 8 }}>
      {actions?.map((a) => (
        <p key={a.id} style={{ margin: '4px 0' }}>
          ✅ <strong>{a.description}</strong>{' '}
          <span className="muted">
            ({CADENCES.find((c) => c.value === a.cadence)?.label ?? a.cadence})
          </span>
        </p>
      ))}

      <form onSubmit={onConvert} className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
        <input
          aria-label="Action description"
          placeholder="Turn this note into an action…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ flex: '1 1 220px', padding: '8px 10px', borderRadius: 10, border: '1px solid var(--color-border)' }}
          required
        />
        <select
          aria-label="Cadence"
          value={cadence}
          onChange={(e) => setCadence(e.target.value as Cadence)}
          style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid var(--color-border)' }}
        >
          {CADENCES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <Button type="submit" variant="secondary" disabled={create.isPending || !description.trim()}>
          Create action
        </Button>
      </form>
      {error && <p className="error" role="alert">{error}</p>}
    </div>
  );
}
