import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useLogout, useMe } from './services/auth.js';
import { Auth } from './pages/Auth.js';
import { Challenges } from './pages/Challenges.js';
import { ChallengeDetail } from './pages/ChallengeDetail.js';
import { BookDetail } from './pages/BookDetail.js';
import { Button } from './components/ui.js';
import { MOCK_ENABLED } from './services/mock.js';

export function App() {
  const { data: user, isLoading } = useMe();
  const logout = useLogout();

  if (isLoading) return <div className="container"><p className="muted">Loading…</p></div>;

  return (
    <BrowserRouter>
      {MOCK_ENABLED && (
        <div
          role="status"
          style={{
            background: '#fff4d6',
            color: '#7a5b00',
            textAlign: 'center',
            padding: '6px',
            fontSize: '0.85rem',
            borderBottom: '1px solid #e8d48a',
          }}
        >
          Mock mode — backend and login are pended; you are auto-signed-in as guest, data is stored in your browser (localStorage).
        </div>
      )}
      <header className="app-header">
        <h1>Reading → Action</h1>
        {user && (
          <div className="row" style={{ gap: 12 }}>
            <span className="muted">{user.email}</span>
            {!MOCK_ENABLED && (
              <Button variant="secondary" onClick={() => logout.mutate()}>
                Sign out
              </Button>
            )}
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
