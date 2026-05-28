import { useState, useEffect } from 'react';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
  const API_ORIGIN = API_BASE.replace(/\/api\/v1$/, '');

  const token = localStorage.getItem('token');
  const storedUsername = localStorage.getItem('username');

  const theme = {
    background: '#121212',
    cardBg: '#1e1e1e',
    textMain: '#ffffff',
    textSec: '#b3b3b3',
    accent: '#7c4dff',
    border: '#333333',
    success: '#4CAF50',
  };

  useEffect(() => {
    if (!token || !storedUsername) {
      setIsLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_BASE}/users/${storedUsername}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Failed to fetch profile');

        const data = await response.json();
        setUser(data.user);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [token, storedUsername]);

  if (isLoading) return <div style={centerStyle(theme)}>Loading...</div>;

  // WIDOK: NIEZALOGOWANY
  if (!token || !storedUsername) {
    return (
      <div style={centerStyle(theme)}>
        <div style={{ backgroundColor: theme.cardBg, padding: '40px', borderRadius: '16px', border: `1px solid ${theme.border}` }}>
          <h2>Log in to see profile page</h2>
          <p style={{ color: theme.textSec }}>Your stats and game history are waiting!</p>
          <button
            onClick={() => window.location.href = '/login'} // Tymczasowe przekierowanie
            style={{ backgroundColor: theme.accent, color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', marginTop: '10px' }}
          >
            Log in
          </button>
        </div>
      </div>
    );
  }

  if (error) return <div style={centerStyle(theme)}>Error: {error}</div>;

  // WIDOK: ZALOGOWANY
  return (
    <div style={{ minHeight: '100vh', backgroundColor: theme.background, color: theme.textMain, padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '30px' }}>

        {/* HEADER */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '25px', backgroundColor: theme.cardBg, padding: '30px', borderRadius: '16px', border: `1px solid ${theme.border}` }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(124, 77, 255, 0.2)', border: `2px solid ${theme.accent}`, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '28px', color: theme.accent }}>
            {user.avatarUrl ? <img src={`${API_ORIGIN}/static/${user.avatarUrl}`} alt="Avatar" style={{ width: '100%', borderRadius: '50%' }} /> : user.username[0].toUpperCase()}
          </div>
          <div>
            <h1 style={{ margin: 0 }}>{user.username}</h1>
            <p style={{ color: theme.accent, fontWeight: 'bold', margin: '5px 0' }}>{user.title || 'Novice'}</p>
            <p style={{ color: theme.textSec, fontSize: '14px' }}>{user.bio || 'No bio yet.'}</p>
          </div>
        </div>

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <StatCard title="Total EXP" value={user.exp} theme={theme} color={theme.accent} />
          {/* Historia gier wymagałaby osobnego endpointu, którego jeszcze nie ma w Twoim kodzie */}
          <StatCard title="Rank Status" value="Active" theme={theme} />
        </div>

      </div>
    </div>
  );
}

function StatCard({ title, value, theme, color }) {
  return (
    <div style={{ backgroundColor: theme.cardBg, padding: '20px', borderRadius: '12px', border: `1px solid ${theme.border}`, textAlign: 'center' }}>
      <div style={{ color: theme.textSec, fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px' }}>{title}</div>
      <div style={{ fontSize: '32px', fontWeight: 'bold', color: color || theme.textMain }}>{value}</div>
    </div>
  );
}

const centerStyle = (theme) => ({
  display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: theme.background, color: theme.textMain
});