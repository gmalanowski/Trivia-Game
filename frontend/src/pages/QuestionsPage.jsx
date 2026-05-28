import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Import nawigacji
import { startQuizSession, finishQuizSession } from '../services/api.js';

const formatElapsedTime = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export default function QuestionsPage() {
  const navigate = useNavigate(); // Hook do przenoszenia między stronami
  const location = useLocation();

  const { category, difficulty, categoryName } = location.state || {
    category: '',
    difficulty: 'medium',
    categoryName: 'Random',
  };

  const token = localStorage.getItem('token');

  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [collectedAnswers, setCollectedAnswers] = useState([]);
  const [revealAnswer, setRevealAnswer] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const loadQuestions = async () => {
      if (!token) {
        setError('You must be logged in to start a quiz session.');
        setIsLoading(false);
        return;
      }

      try {
        const data = await startQuizSession({
          amount: 10,
          difficulty,
          category,
          token,
        });

        setSessionId(data?.sessionId || null);
        setQuestions(data?.questions || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadQuestions();
  }, [category, difficulty, token]);

  useEffect(() => {
    if (isLoading || questions.length === 0 || error) return;

    const startedAt = Date.now();
    const timerId = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    return () => clearInterval(timerId);
  }, [isLoading, questions.length, error]);

  const handleAnswerClick = (answer) => {
    if (revealAnswer) {
      return;
    }

    setSelectedAnswer(answer);
    setRevealAnswer(true);
  };

  const handleNextQuestion = async () => {
    const currentQ = questions[currentIndex];

    if (!currentQ || !selectedAnswer) {
      return;
    }

    const nextAnswers = [
      ...collectedAnswers,
      { resultId: currentQ.resultId, userAnswer: selectedAnswer },
    ];

    if (currentIndex < questions.length - 1) {
      setCollectedAnswers(nextAnswers);
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setRevealAnswer(false);
    } else {
      try {
        setIsSubmitting(true);

        const result = await finishQuizSession({
          sessionId,
          answers: nextAnswers,
          token,
        });

        navigate('/results', {
          state: {
            totalScore: result?.score ?? 0,
            maxQuestions: result?.totalQuestions ?? questions.length,
            expGained: result?.expGained ?? 0,
            completionTimeSeconds: elapsedSeconds,
          }
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (isLoading) return <div style={centerStyle}>Loading questions...</div>;
  if (error) return <div style={centerStyle}>Error: {error}</div>;
  if (questions.length === 0) return <div style={centerStyle}>No questions available.</div>;

  const currentQ = questions[currentIndex];
  const difficultyLabel =
    difficulty === 'easy' ? 'Easy' : difficulty === 'hard' ? 'Hard' : 'Medium';
  const selectedCategoryLabel =
    categoryName || (category ? currentQ.category : 'Random');

  const theme = {
    background: '#121212',
    cardBg: '#1e1e1e',
    textMain: '#ffffff',
    textSec: '#b3b3b3',
    accent: '#7c4dff',
    correct: '#2e7d32',
    wrong: '#c62828',
    buttonDefault: '#333333',
    buttonSelected: '#7c4dff',
    buttonHover: '#444444'
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 70px)',
      backgroundColor: theme.background,
      color: theme.textMain,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 20px',
      transition: 'all 0.3s ease'
    }}>

      <div style={{
        color: theme.accent,
        fontSize: '14px',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        marginBottom: '10px',
        fontWeight: 'bold'
      }}>
        {currentQ.category}
      </div>

      <div style={{
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: '16px'
      }}>
        <span style={{
          backgroundColor: '#2a2a2a',
          border: '1px solid #3a3a3a',
          borderRadius: '999px',
          padding: '6px 12px',
          fontSize: '13px',
          color: '#ddd'
        }}>
          Category: {selectedCategoryLabel}
        </span>
        <span style={{
          backgroundColor: 'rgba(124, 77, 255, 0.15)',
          border: '1px solid rgba(124, 77, 255, 0.55)',
          borderRadius: '999px',
          padding: '6px 12px',
          fontSize: '13px',
          color: theme.accent,
          fontWeight: 'bold'
        }}>
          Difficulty: {difficultyLabel}
        </span>
        <span style={{
          backgroundColor: '#1f2833',
          border: '1px solid #35506a',
          borderRadius: '999px',
          padding: '6px 12px',
          fontSize: '13px',
          color: '#8fd3ff',
          fontWeight: 'bold'
        }}>
          Time: {formatElapsedTime(elapsedSeconds)}
        </span>
      </div>

      <div style={{ color: theme.textSec, marginBottom: '30px' }}>
        Question <span style={{ color: theme.textMain }}>{currentIndex + 1}</span> / {questions.length}
      </div>

      <div style={{
        backgroundColor: theme.cardBg,
        padding: '40px',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '700px',
        textAlign: 'center',
        border: '1px solid #333',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
      }}>
        <h2 style={{
          marginBottom: '40px',
          lineHeight: '1.4',
          fontSize: '24px',
          fontWeight: '500'
        }} dangerouslySetInnerHTML={{ __html: currentQ.question }} />

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px'
        }}>
          {(currentQ.answers || []).map((answer, index) => {
            const isSelected = selectedAnswer === answer;
            const isCorrect = revealAnswer && answer === currentQ.correctAnswer;
            const isWrong = revealAnswer && isSelected && answer !== currentQ.correctAnswer;

            let borderColor = 'transparent';
            let bgColor = theme.buttonDefault;
            let textColor = theme.textMain;
            let fontWeight = 'normal';

            if (isCorrect) {
              borderColor = theme.correct;
              bgColor = 'rgba(46, 125, 50, 0.18)';
              textColor = theme.correct;
              fontWeight = 'bold';
            } else if (isWrong) {
              borderColor = theme.wrong;
              bgColor = 'rgba(198, 40, 40, 0.18)';
              textColor = theme.wrong;
              fontWeight = 'bold';
            } else if (isSelected) {
              borderColor = theme.accent;
              bgColor = 'rgba(124, 77, 255, 0.15)';
              textColor = theme.accent;
              fontWeight = 'bold';
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswerClick(answer)}
                style={{
                  padding: '20px',
                  fontSize: '16px',
                  border: `2px solid ${borderColor}`,
                  borderRadius: '12px',
                  cursor: revealAnswer ? 'default' : 'pointer',
                  backgroundColor: bgColor,
                  color: textColor,
                  fontWeight: fontWeight,
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                dangerouslySetInnerHTML={{ __html: answer }}
              />
            );
          })}
        </div>
      </div>

      <button
        onClick={handleNextQuestion}
        disabled={!selectedAnswer || isSubmitting}
        style={{
          marginTop: '40px',
          padding: '15px 45px',
          fontSize: '18px',
          fontWeight: 'bold',
          backgroundColor: selectedAnswer && !isSubmitting ? theme.accent : '#222',
          color: selectedAnswer && !isSubmitting ? 'white' : '#555',
          border: 'none',
          borderRadius: '30px',
          cursor: selectedAnswer && !isSubmitting ? 'pointer' : 'not-allowed',
          boxShadow: selectedAnswer && !isSubmitting ? `0 0 20px ${theme.accent}66` : 'none',
          transition: 'all 0.3s ease'
        }}
      >
        {isSubmitting
          ? 'Saving...'
          : (currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz')}
      </button>
    </div>
  );
}

const centerStyle = { textAlign: 'center', padding: '50px', fontSize: '20px', color: '#fff', backgroundColor: '#121212', minHeight: '100vh' };