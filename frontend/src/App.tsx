import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useLogout, useMe } from './services/auth.js';
import { Auth } from './pages/Auth.js';
import { Challenges } from './pages/Challenges.js';
import { ChallengeDetail } from './pages/ChallengeDetail.js';
import { BookDetail } from './pages/BookDetail.js';
import { Button } from './components/ui.js';

export function App() {
  const { data: user, isLoading } = useMe();
  const logout = useLogout();

  if (isLoading) return <div className="container"><p className="muted">Loading…</p></div>;

  return (
    <BrowserRouter>
      <header className="app-header">
        <h1>Reading → Action</h1>
        {user && (
          <div className="row" style={{ gap: 12 }}>
            <span className="muted">{user.email}</span>
            <Button variant="secondary" onClick={() => logout.mutate()}>
              Sign out
            </Button>
          </div>
        )}
      </header>
      {!user ? (
        <Auth />
      ) : (
        <Routes>
          <Route path="/" element={<Challenges />} />
          <Route path="/challenges/:id" element={<ChallengeDetail />} />
          <Route path="/books/:id" element={<BookDetail />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}
