import { useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useBook } from '../services/books.js';
import { useCreateNote, useNotes } from '../services/notes.js';
import { ApiRequestError } from '../services/api.js';
import { Button, EmptyState, Field } from '../components/ui.js';
import { NoteActions } from '../components/NoteActions.js';

export function BookDetail() {
  const { id = '' } = useParams();
  const { data: book, isLoading, isError } = useBook(id);
  const { data: notes } = useNotes(id);
  const create = useCreateNote(id);
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function onAddNote(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await create.mutateAsync({ content });
      setContent('');
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Could not add note');
    }
  }

  if (isLoading) return <div className="container"><p className="muted">Loading…</p></div>;
  if (isError || !book)
    return (
      <div className="container">
        <p className="error">Book not found.</p>
        <Link to="/">Back to challenges</Link>
      </div>
    );

  return (
    <div className="container">
      <p>
        <Link to={`/challenges/${book.challengeId}`}>← Back to challenge</Link>
      </p>
      <h2>{book.title}</h2>
      <p className="muted">by {book.author}</p>
      {book.readingReason && <p>Why: {book.readingReason}</p>}

      <h3>Add a reading note</h3>
      <form onSubmit={onAddNote} className="card" aria-label="add note">
        <Field
          id="note-content"
          label="What did you learn or want to remember?"
          textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        {error && <p className="error" role="alert">{error}</p>}
        <Button type="submit" disabled={create.isPending || !content.trim()}>
          Add note
        </Button>
      </form>

      <h3>Notes &amp; actions</h3>
      {notes && notes.length === 0 && (
        <EmptyState title="No notes yet">
          <p>Capture a note above, then convert it into an action to apply what you read.</p>
        </EmptyState>
      )}

      {notes?.map((n) => (
        <div className="card" key={n.id}>
          <p style={{ marginTop: 0 }}>{n.content}</p>
          <NoteActions noteId={n.id} />
        </div>
      ))}
    </div>
  );
}
