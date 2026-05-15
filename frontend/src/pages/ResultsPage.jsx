// src/pages/ResultsPage.jsx
import { useLocation, useNavigate } from 'react-router-dom';

const formatElapsedTime = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Odbieramy dane przesłane z QuestionsPage (punktacja)
  const { totalScore, maxQuestions, completionTimeSeconds } = location.state || {
    totalScore: 0,
    maxQuestions: 0,
    completionTimeSeconds: 0,
  };

  // Obliczamy procent poprawych odpowiedzi
  const percentage = maxQuestions > 0 ? Math.round((totalScore / maxQuestions) * 100) : 0;

  const theme = {
    background: '#121212',
    cardBg: '#1e1e1e',
    accent: '#7c4dff',
    textMain: '#ffffff',
    textSec: '#b3b3b3'
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 70px)',
      backgroundColor: theme.background,
      color: theme.textMain,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: theme.cardBg,
        padding: '50px',
        borderRadius: '24px',
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%',
        border: '1px solid #333',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
      }}>
        <h1 style={{ color: theme.accent, fontSize: '3rem', marginBottom: '10px' }}>Finished!</h1>
        <p style={{ color: theme.textSec, fontSize: '1.2rem', marginBottom: '30px' }}>Here is your final result summary:</p>

        {/* Wynik punktowy */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ fontSize: '4rem', fontWeight: 'bold' }}>
            {totalScore} <span style={{ fontSize: '1.5rem', color: theme.textSec }}>/ {maxQuestions}</span>
          </div>
          <div style={{
            marginTop: '10px',
            fontSize: '1.2rem',
            color: percentage >= 50 ? '#4caf50' : '#f44336',
            fontWeight: 'bold'
          }}>
            Accuracy: {percentage}%
          </div>
          <div style={{
            marginTop: '12px',
            fontSize: '1rem',
            color: theme.textSec,
          }}>
            Time: <span style={{ color: '#8fd3ff', fontWeight: 'bold' }}>{formatElapsedTime(completionTimeSeconds)}</span>
          </div>
        </div>

        {/* Przyciski akcji */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <button
            onClick={() => navigate('/quizpage')}
            style={{
              padding: '15px',
              fontSize: '1rem',
              fontWeight: 'bold',
              backgroundColor: theme.accent,
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            Play Again
          </button>

          <button
            onClick={() => navigate('/')}
            style={{
              padding: '15px',
              fontSize: '1rem',
              backgroundColor: 'transparent',
              color: theme.textSec,
              border: `1px solid ${theme.textSec}`,
              borderRadius: '12px',
              cursor: 'pointer'
            }}
          >
            Back to Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}