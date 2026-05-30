import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useChallenges, useCreateChallenge, useDeleteChallenge } from '../services/challenges.js';
import { ApiRequestError } from '../services/api.js';
import { Button, EmptyState, Field } from '../components/ui.js';

export function Challenges() {
  const { data: challenges, isLoading } = useChallenges();
  const create = useCreateChallenge();
  const remove = useDeleteChallenge();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await create.mutateAsync({ title, description: description || undefined });
      setTitle('');
      setDescription('');
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Could not create challenge');
    }
  }

  async function onDelete(id: string) {
    try {
      await remove.mutateAsync({ id });
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 409) {
        if (window.confirm(`${err.message}. Delete anyway?`)) {
          await remove.mutateAsync({ id, confirm: true });
        }
        return;
      }
      throw err;
    }
  }

  return (
    <div className="container">
      <h2>Your challenges</h2>

      <form onSubmit={onCreate} className="card" aria-label="create challenge">
        <Field
          id="challenge-title"
          label="What challenge do you want to solve?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <Field
          id="challenge-description"
          label="Description (optional)"
          textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {error && <p className="error" role="alert">{error}</p>}
        <Button type="submit" disabled={create.isPending || !title.trim()}>
          Add challenge
        </Button>
      </form>

      {isLoading && <p className="muted">Loading…</p>}

      {!isLoading && challenges && challenges.length === 0 && (
        <EmptyState title="No challenges yet">
          <p>Create a challenge above to start connecting books and actions to a real goal.</p>
        </EmptyState>
      )}

      {challenges?.map((c) => (
        <div className="card" key={c.id}>
          <div className="row">
            <Link to={`/challenges/${c.id}`}>
              <strong>{c.title}</strong>
            </Link>
            <Button variant="danger" onClick={() => onDelete(c.id)}>
              Delete
            </Button>
          </div>
          {c.description && <p className="muted">{c.description}</p>}
        </div>
      ))}
    </div>
  );
}
