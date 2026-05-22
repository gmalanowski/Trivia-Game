import { useState, useEffect } from 'react';

// MOCK DATA - To be replaced with real backend data in Stage 3
const MOCK_USER = {
  username: 'PlayerOne',
  email: 'player@example.com',
  joinedDate: 'March 2026',
  avatarInitials: 'P1',
  stats: {
    totalQuizzes: 42,
    totalCorrect: 315,
    winRate: '75%',
  }
};

const MOCK_HISTORY = [
  { id: 1, date: '2026-05-15', category: 'Science & Nature', difficulty: 'Hard', score: 8, maxScore: 10 },
  { id: 2, date: '2026-05-14', category: 'History', difficulty: 'Medium', score: 9, maxScore: 10 },
  { id: 3, date: '2026-05-12', category: 'General Knowledge', difficulty: 'Easy', score: 10, maxScore: 10 },
  { id: 4, date: '2026-05-10', category: 'Entertainment: Film', difficulty: 'Hard', score: 4, maxScore: 10 },
  { id: 5, date: '2026-05-08', category: 'Geography', difficulty: 'Medium', score: 7, maxScore: 10 },
];

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate API fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      setUser(MOCK_USER);
      setHistory(MOCK_HISTORY);
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const theme = {
    background: '#121212',
    cardBg: '#1e1e1e',
    textMain: '#ffffff',
    textSec: '#b3b3b3',
    accent: '#7c4dff',
    border: '#333333',
    success: '#4CAF50',
    warning: '#FFC107',
    danger: '#F44336'
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', backgroundColor: theme.background, color: theme.textMain, minHeight: '100vh' }}>
        Loading profile...
      </div>
    );
  }

  // Helper function to determine score color
  const getScoreColor = (score, maxScore) => {
    const percentage = score / maxScore;
    if (percentage >= 0.8) return theme.success;
    if (percentage >= 0.5) return theme.warning;
    return theme.danger;
  };

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

      <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '30px' }}>

        {/* HEADER: USER INFO */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '25px',
          backgroundColor: theme.cardBg,
          padding: '30px',
          borderRadius: '16px',
          border: `1px solid ${theme.border}`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}>
          {/* Avatar */}
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'rgba(124, 77, 255, 0.2)',
            border: `2px solid ${theme.accent}`,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '28px',
            fontWeight: 'bold',
            color: theme.accent
          }}>
            {user.avatarInitials}
          </div>

          {/* Details */}
          <div>
            <h1 style={{ margin: '0 0 5px 0', fontSize: '28px' }}>{user.username}</h1>
            <p style={{ margin: '0 0 8px 0', color: theme.textSec, fontSize: '15px' }}>{user.email}</p>
            <p style={{ margin: 0, color: theme.textSec, fontSize: '13px' }}>Member since {user.joinedDate}</p>
          </div>
        </div>

        {/* STATS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <StatCard title="Quizzes Played" value={user.stats.totalQuizzes} theme={theme} />
          <StatCard title="Correct Answers" value={user.stats.totalCorrect} theme={theme} />
          <StatCard title="Accuracy" value={user.stats.winRate} theme={theme} color={theme.accent} />
        </div>

        {/* QUIZ HISTORY SECTION */}
        <div style={{ marginTop: '20px' }}>
          <h2 style={{ fontSize: '22px', borderBottom: `2px solid ${theme.border}`, paddingBottom: '10px', marginBottom: '20px' }}>
            Recent Quiz History
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {history.map((game) => (
              <div key={game.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: theme.cardBg,
                padding: '20px',
                borderRadius: '12px',
                border: `1px solid ${theme.border}`,
                transition: 'transform 0.2s ease',
              }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {/* Left side: Game details */}
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '6px' }}>{game.category}</div>
                  <div style={{ display: 'flex', gap: '15px', color: theme.textSec, fontSize: '14px' }}>
                    <span>📅 {game.date}</span>
                    <span>⚙️ {game.difficulty}</span>
                  </div>
                </div>

                {/* Right side: Score */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: theme.textSec, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Score</div>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: getScoreColor(game.score, game.maxScore)
                  }}>
                    {game.score} <span style={{ color: theme.textSec, fontSize: '16px' }}>/ {game.maxScore}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// Helper component for small statistic cards
function StatCard({ title, value, theme, color }) {
  return (
    <div style={{
      backgroundColor: theme.cardBg,
      padding: '20px',
      borderRadius: '12px',
      border: `1px solid ${theme.border}`,
      textAlign: 'center'
    }}>
      <div style={{ color: theme.textSec, fontSize: '14px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
        {title}
      </div>
      <div style={{ fontSize: '32px', fontWeight: 'bold', color: color || theme.textMain }}>
        {value}
      </div>
    </div>
  );
}