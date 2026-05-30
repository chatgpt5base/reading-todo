import { useState, type FormEvent } from 'react';
import { useLogin, useRegister } from '../services/auth.js';
import { ApiRequestError } from '../services/api.js';
import { Button, Field } from '../components/ui.js';

export function Auth() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const login = useLogin();
  const register = useRegister();
  const pending = login.isPending || register.isPending;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const mutation = mode === 'login' ? login : register;
    try {
      await mutation.mutateAsync({ email, password });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Something went wrong');
    }
  }

  return (
    <div className="container" style={{ maxWidth: 420 }}>
      <h2>{mode === 'login' ? 'Sign in' : 'Create an account'}</h2>
      <form onSubmit={onSubmit} className="card" aria-label="authentication form">
        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Field
          id="password"
          label="Password (min 8 characters)"
          type="password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="error" role="alert">{error}</p>}
        <Button type="submit" disabled={pending}>
          {pending ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Register'}
        </Button>
      </form>
      <p className="muted">
        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
        <button
          className="btn btn-secondary"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login');
            setError(null);
          }}
        >
          {mode === 'login' ? 'Register' : 'Sign in'}
        </button>
      </p>
    </div>
  );
}
