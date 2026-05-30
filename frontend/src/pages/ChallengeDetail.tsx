import { useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useChallenge } from '../services/challenges.js';
import { useCreateBook, useDeleteBook } from '../services/books.js';
import { ApiRequestError } from '../services/api.js';
import { Button, EmptyState, Field } from '../components/ui.js';

const STATUS_LABEL: Record<string, string> = {
  to_read: 'To read',
  reading: 'Reading',
  done: 'Done',
};

export function ChallengeDetail() {
  const { id = '' } = useParams();
  const { data, isLoading, isError } = useChallenge(id);
  const create = useCreateBook(id);
  const removeBook = useDeleteBook(id);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function onAddBook(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await create.mutateAsync({
        title,
        author,
        readingReason: reason || undefined,
      });
      setTitle('');
      setAuthor('');
      setReason('');
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Could not add book');
    }
  }

  if (isLoading) return <div className="container"><p className="muted">Loading…</p></div>;
  if (isError || !data)
    return (
      <div className="container">
        <p className="error">Challenge not found.</p>
        <Link to="/">Back to challenges</Link>
      </div>
    );

  return (
    <div className="container">
      <p>
        <Link to="/">← All challenges</Link>
      </p>
      <h2>{data.challenge.title}</h2>
      {data.challenge.description && <p className="muted">{data.challenge.description}</p>}

      <h3>Add a book for this challenge</h3>
      <form onSubmit={onAddBook} className="card" aria-label="add book">
        <Field
          id="book-title"
          label="Book title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <Field
          id="book-author"
          label="Author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
        />
        <Field
          id="book-reason"
          label="Why did you decide to read this?"
          textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        {error && <p className="error" role="alert">{error}</p>}
        <Button type="submit" disabled={create.isPending || !title.trim() || !author.trim()}>
          Add book
        </Button>
      </form>

      <h3>Books</h3>
      {data.books.length === 0 ? (
        <EmptyState title="No books yet">
          <p>Add a book above and record why it will help with this challenge.</p>
        </EmptyState>
      ) : (
        data.books.map((b) => (
          <div className="card" key={b.id}>
            <div className="row">
              <div>
                <Link to={`/books/${b.id}`}>
                  <strong>{b.title}</strong>
                </Link>{' '}
                <span className="muted">by {b.author}</span>
              </div>
              <Button variant="danger" onClick={() => removeBook.mutate(b.id)}>
                Remove
              </Button>
            </div>
            <p className="muted">Status: {STATUS_LABEL[b.readingStatus] ?? b.readingStatus}</p>
            {b.readingReason && <p>Why: {b.readingReason}</p>}
          </div>
        ))
      )}
    </div>
  );
}
