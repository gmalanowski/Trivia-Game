import { useState, useEffect } from 'react';

// PRZYKŁADOWE DANE (Mock Data) - na razie, żeby widok ładnie wyglądał.
// W Etapie 3 zamienimy to na fetch() z backendu od chłopaków.
const MOCK_DATA = [
  { id: 1, username: 'jankowalski', played: 120, correctPercent: 85 },
  { id: 2, username: 'anna_nowak', played: 95, correctPercent: 82 },
  { id: 3, username: 'piotrek_z', played: 150, correctPercent: 78 },
  { id: 4, username: 'mistrz_wiedzy', played: 60, correctPercent: 75 },
  { id: 5, username: 'kasia123', played: 55, correctPercent: 72 },
  { id: 6, username: 'zawodnik_x', played: 52, correctPercent: 70 },
  { id: 7, username: 'test_user', played: 50, correctPercent: 68 },
];

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Symulacja ładowania danych
  useEffect(() => {
    const timer = setTimeout(() => {
      setLeaderboard(MOCK_DATA);
      setIsLoading(false);
    }, 500); // pół sekundy udawanego ładowania
    return () => clearTimeout(timer);
  }, []);

  // Motyw kolorystyczny skopiowany z Twojego QuestionsPage
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

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', backgroundColor: theme.background, color: theme.textMain, minHeight: '100vh' }}>
        Ładowanie rankingu...
      </div>
    );
  }

  // Rozdzielamy Top 3 na podium i resztę do tabeli
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

        {/* NAGŁÓWEK */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '36px', marginBottom: '10px', fontWeight: 'bold' }}>Leaderboard</h1>
          <p style={{ color: theme.textSec, fontSize: '15px', maxWidth: '400px', margin: '0 auto', lineHeight: '1.5' }}>
            To be included in the ranking, answer at least 50 questions 😎
          </p>
        </div>

        {/* PODIUM (Top 3) */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          gap: '15px',
          height: '220px',
          marginBottom: '20px'
        }}>
          {/* 2. Miejsce (Lewa strona) */}
          {top3[1] && <PodiumStep player={top3[1]} place={2} height="120px" color={theme.silver} theme={theme} />}

          {/* 1. Miejsce (Środek - najwyższe) */}
          {top3[0] && <PodiumStep player={top3[0]} place={1} height="170px" color={theme.gold} theme={theme} />}

          {/* 3. Miejsce (Prawa strona) */}
          {top3[2] && <PodiumStep player={top3[2]} place={3} height="80px" color={theme.bronze} theme={theme} />}
        </div>

        {/* TABELA (Reszta graczy) */}
        <div style={{
          width: '100%',
          backgroundColor: theme.cardBg,
          borderRadius: '16px',
          border: `1px solid ${theme.border}`,
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', borderBottom: `2px solid ${theme.border}` }}>
                <th style={{ padding: '20px', color: theme.textSec, fontWeight: '500' }}>Standing</th>
                <th style={{ padding: '20px', color: theme.textSec, fontWeight: '500' }}>Player</th>
                <th style={{ padding: '20px', color: theme.textSec, fontWeight: '500' }}>Games</th>
                <th style={{ padding: '20px', color: theme.textSec, fontWeight: '500' }}>Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {restOfPlayers.map((player, index) => (
                <tr key={player.id} style={{
                  borderBottom: index !== restOfPlayers.length - 1 ? `1px solid ${theme.border}` : 'none',
                  transition: 'background-color 0.2s ease',
                }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(124, 77, 255, 0.05)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '20px', fontWeight: 'bold', color: theme.textSec }}>{index + 4}</td>
                  <td style={{ padding: '20px', color: theme.accent, fontWeight: 'bold' }}>{player.username}</td>
                  <td style={{ padding: '20px' }}>{player.played}</td>
                  <td style={{ padding: '20px', color: '#4CAF50', fontWeight: 'bold' }}>{player.correctPercent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

// Pomocniczy komponent rysujący jeden słupek podium
function PodiumStep({ player, place, height, color, theme }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100px' }}>

      {/* Informacje o graczu nad słupkiem */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontSize: '15px', fontWeight: 'bold', color: theme.textMain, marginBottom: '4px', textAlign: 'center', wordBreak: 'break-word' }}>
          {player.username}
        </span>
        <span style={{ fontSize: '13px', color: theme.textSec, fontWeight: '500' }}>
          {player.correctPercent}%
        </span>
      </div>

      {/* Kolorowy słupek */}
      <div style={{
        width: '100%',
        height: height,
        backgroundColor: theme.accent,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingTop: '15px',
        borderTopLeftRadius: '12px',
        borderTopRightRadius: '12px',
        boxShadow: `0 -5px 20px rgba(124, 77, 255, 0.15)`
      }}>
        {/* Kółko z numerem miejsca (np. złote dla 1) */}
        <div style={{
          width: '36px',
          height: '36px',
          backgroundColor: color,
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontWeight: '900',
          color: '#121212',
          fontSize: '18px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.4)'
        }}>
          {place}
        </div>
      </div>
    </div>
  );
}