import { useState, useEffect } from 'react';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const BACKEND_URL = `${import.meta.env.VITE_BACKEND_URL}/leaderboard` || 'http://localhost:3000/api/v1/leaderboard';

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(BACKEND_URL);

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          setLeaderboard(data);
        } else {
          throw new Error("Received data is not an array.");
        }
      } catch (err) {
        console.error("Details of the error:", err);
        setError(err.message === 'Failed to fetch'
          ? "Cannot connect to the server. Check if the backend is running and if port 3000 is correct."
          : err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadLeaderboard();
  }, []);

  const theme = {
    background: '#121212',
    cardBg: '#1e1e1e',
    textMain: '#ffffff',
    textSec: '#b3b3b3',
    accent: '#7c4dff',
    border: '#333333',
    gold: '#FFD700',
    silver: '#C0C0C0',
    bronze: '#CD7F32',
  };

  if (isLoading) return <div style={centerStyle(theme)}>Loading leaderboard...</div>;

  if (error) return (
    <div style={centerStyle(theme)}>
      <div style={{ color: '#ff5252', fontSize: '24px', marginBottom: '15px' }}>⚠️ Connection error</div>
      <div style={{ fontSize: '14px', opacity: 0.8, maxWidth: '400px', margin: '0 auto', lineHeight: '1.6' }}>{error}</div>
      <button
        onClick={() => window.location.reload()}
        style={{ marginTop: '30px', padding: '12px 24px', backgroundColor: theme.accent, color: '#fff', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        Try again
      </button>
    </div>
  );

  const top3 = leaderboard.slice(0, 3);
  const restOfPlayers = leaderboard.slice(3);

  return (
    <div style={{
      minHeight: 'calc(100vh - 70px)',
      backgroundColor: theme.background,
      color: theme.textMain,
      padding: '40px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '50px' }}>

        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '36px', marginBottom: '10px', fontWeight: 'bold' }}>Leaderboard</h1>
          <p style={{ color: theme.textSec }}>Best players in the game!</p>
        </div>

        {/* PODIUM */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          gap: '15px',
          height: '240px',
          marginBottom: '20px'
        }}>
          {top3[1] && <PodiumStep player={top3[1]} place={2} height="120px" color={theme.silver} theme={theme} />}
          {top3[0] && <PodiumStep player={top3[0]} place={1} height="170px" color={theme.gold} theme={theme} />}
          {top3[2] && <PodiumStep player={top3[2]} place={3} height="80px" color={theme.bronze} theme={theme} />}
        </div>

        {/* TABELA */}
        <div style={{
          width: '100%',
          backgroundColor: theme.cardBg,
          borderRadius: '16px',
          border: `1px solid ${theme.border}`,
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
        }}>
          {leaderboard.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: theme.textSec }}>No data available in the leaderboard.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', borderBottom: `2px solid ${theme.border}` }}>
                  <th style={{ padding: '20px', color: theme.textSec }}>Standing</th>
                  <th style={{ padding: '20px', color: theme.textSec }}>Player</th>
                  <th style={{ padding: '20px', color: theme.textSec }}>Title</th>
                  <th style={{ padding: '20px', color: theme.textSec }}>Experience</th>
                </tr>
              </thead>
              <tbody>
                {restOfPlayers.map((player, index) => (
                  <tr key={player.username || index} style={{ borderBottom: `1px solid ${theme.border}` }}>
                    <td style={{ padding: '20px', fontWeight: 'bold', color: theme.textSec }}>{index + 4}</td>
                    <td style={{ padding: '20px', color: theme.accent, fontWeight: 'bold' }}>{player.username}</td>
                    <td style={{ padding: '20px', color: '#8fd3ff' }}>{player.title}</td>
                    <td style={{ padding: '20px', fontWeight: 'bold' }}>{player.exp} XP</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function PodiumStep({ player, place, height, color, theme }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '110px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '12px' }}>
        <img
          src={player.avatarUrl || `https://ui-avatars.com/api/?name=${player.username}&background=random`}
          alt={player.username}
          style={{ width: '50px', height: '50px', borderRadius: '50%', marginBottom: '8px', border: `3px solid ${color}`, objectFit: 'cover' }}
        />
        <span style={{ fontSize: '14px', fontWeight: 'bold', textAlign: 'center', display: 'block', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {player.username}
        </span>
        <span style={{ fontSize: '11px', color: theme.accent, textTransform: 'uppercase', fontWeight: 'bold' }}>{player.title}</span>
      </div>
      <div style={{
        width: '100%',
        height: height,
        backgroundColor: theme.accent,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: '10px',
        borderTopLeftRadius: '12px',
        borderTopRightRadius: '12px',
        boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.2)'
      }}>
        <div style={{
          width: '30px',
          height: '30px',
          backgroundColor: color,
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontWeight: 'bold',
          color: '#121212',
          marginBottom: '5px'
        }}>{place}</div>
        <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{player.exp} XP</span>
      </div>
    </div>
  );
}

const centerStyle = (theme) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  padding: '20px',
  backgroundColor: theme.background,
  color: theme.textMain,
  minHeight: '100vh',
  fontFamily: 'sans-serif'
});