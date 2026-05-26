import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createQuestionSSE } from '../services/sseService.js';

const formatElapsedTime = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export default function QuestionsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { category, difficulty, categoryName } = location.state || {
    category: '',
    difficulty: 'medium',
    categoryName: 'Random',
  };

  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Queue state
  const [queuePosition, setQueuePosition] = useState(null);
  const [totalInQueue, setTotalInQueue] = useState(null);
  const [estimatedWaitSeconds, setEstimatedWaitSeconds] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [shuffledAnswers, setShuffledAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const sseRef = useRef(null);

  useEffect(() => {
    // Connect via SSE
    const sse = createQuestionSSE({ amount: 10, difficulty, category });

    sse.onQueueUpdate(({ position, totalInQueue: total, estimatedWaitSeconds: wait }) => {
      setQueuePosition(position);
      setTotalInQueue(total);
      setEstimatedWaitSeconds(wait);
    });

    sse.onResult((data) => {
      setQuestions(data);
      setIsLoading(false);
      setQueuePosition(null);
    });

    sse.onError((message) => {
      setError(message);
      setIsLoading(false);
      setQueuePosition(null);
    });

    sseRef.current = sse;

    return () => {
      sse.close();
    };
  }, [category, difficulty]);

  useEffect(() => {
    if (questions.length > 0) {
      const currentQ = questions[currentIndex];
      const answers = [...currentQ.incorrect_answers, currentQ.correct_answer];
      answers.sort(() => Math.random() - 0.5);
      setShuffledAnswers(answers);
    }
  }, [questions, currentIndex]);

  useEffect(() => {
    if (isLoading || questions.length === 0 || error) return;

    const startedAt = Date.now();
    const timerId = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    return () => clearInterval(timerId);
  }, [isLoading, questions.length, error]);

  const handleAnswerClick = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    const currentQ = questions[currentIndex];

    if (selectedAnswer === currentQ.correct_answer) {
      setScore(prev => prev + 1);
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
    } else {
      const finalScore = selectedAnswer === currentQ.correct_answer ? score + 1 : score;
      navigate('/results', {
        state: {
          totalScore: finalScore,
          maxQuestions: questions.length,
          completionTimeSeconds: elapsedSeconds,
        }
      });
    }
  };

  // Render queue waiting screen
  if (isLoading && queuePosition !== null) {
    return (
      <div style={{
        minHeight: 'calc(100vh - 70px)',
        backgroundColor: '#121212',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}>
        <div style={{
          backgroundColor: '#1e1e1e',
          padding: '50px',
          borderRadius: '20px',
          textAlign: 'center',
          maxWidth: '450px',
          width: '100%',
          border: '1px solid #333',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        }}>
          {/* Spinner */}
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #333',
            borderTop: '4px solid #7c4dff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 30px',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

          <h2 style={{ color: '#7c4dff', marginBottom: '10px' }}>Waiting in Queue</h2>
          <p style={{ color: '#b3b3b3', marginBottom: '25px', lineHeight: '1.5' }}>
            The trivia API has a rate limit. Your request has been queued and will be processed shortly.
          </p>

          <div style={{
            backgroundColor: '#2a2a2a',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '15px',
          }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#7c4dff' }}>
              {queuePosition}
              <span style={{ fontSize: '1.2rem', color: '#b3b3b3' }}> / {totalInQueue}</span>
            </div>
            <div style={{ color: '#b3b3b3', fontSize: '0.9rem', marginTop: '5px' }}>
              Position in queue
            </div>
          </div>

          {estimatedWaitSeconds > 0 && (
            <div style={{ color: '#8fd3ff', fontSize: '1.1rem' }}>
              Estimated wait: ~{estimatedWaitSeconds} seconds
            </div>
          )}
          {estimatedWaitSeconds === 0 && (
            <div style={{ color: '#4caf50', fontSize: '1.1rem' }}>
              Processing your request now...
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isLoading && error === null && queuePosition === null) {
    return (
      <div style={{
        minHeight: 'calc(100vh - 70px)',
        backgroundColor: '#121212',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '50px',
        fontSize: '20px',
      }}>
        Connecting...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: 'calc(100vh - 70px)',
        backgroundColor: '#121212',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '50px',
        textAlign: 'center',
      }}>
        <div style={{
          backgroundColor: '#1e1e1e',
          padding: '40px',
          borderRadius: '16px',
          maxWidth: '450px',
          border: '1px solid #333',
        }}>
          <h2 style={{ color: '#f44336', marginBottom: '15px' }}>Error</h2>
          <p style={{ color: '#b3b3b3', marginBottom: '25px' }}>{error}</p>
          <button
            type="button"
            onClick={() => navigate('/quizpage')}
            style={{
              padding: '12px 30px',
              fontSize: '16px',
              fontWeight: 'bold',
              backgroundColor: '#7c4dff',
              color: 'white',
              border: 'none',
              borderRadius: '30px',
              cursor: 'pointer',
            }}
          >
            Back to Setup
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '50px',
        fontSize: '20px',
        color: '#fff',
        backgroundColor: '#121212',
        minHeight: '100vh',
      }}>
        No questions available.
      </div>
    );
  }

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
          {shuffledAnswers.map((answer, index) => {
            const isSelected = selectedAnswer === answer;
            return (
              <button
                key={index}
                onClick={() => handleAnswerClick(answer)}
                style={{
                  padding: '20px',
                  fontSize: '16px',
                  border: isSelected ? `2px solid ${theme.accent}` : '2px solid transparent',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  backgroundColor: isSelected ? 'rgba(124, 77, 255, 0.15)' : theme.buttonDefault,
                  color: isSelected ? theme.accent : theme.textMain,
                  fontWeight: isSelected ? 'bold' : 'normal',
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
        disabled={!selectedAnswer}
        style={{
          marginTop: '40px',
          padding: '15px 45px',
          fontSize: '18px',
          fontWeight: 'bold',
          backgroundColor: selectedAnswer ? theme.accent : '#222',
          color: selectedAnswer ? 'white' : '#555',
          border: 'none',
          borderRadius: '30px',
          cursor: selectedAnswer ? 'pointer' : 'not-allowed',
          boxShadow: selectedAnswer ? `0 0 20px ${theme.accent}66` : 'none',
          transition: 'all 0.3s ease'
        }}
      >
        {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
      </button>
    </div>
  );
}