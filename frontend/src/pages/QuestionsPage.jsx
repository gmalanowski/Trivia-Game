import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Import nawigacji
import { fetchQuizQuestions } from '../services/api.js';

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

  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [shuffledAnswers, setShuffledAnswers] = useState([]);
  const [score, setScore] = useState(0); // STAN PUNKTACJI
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const data = await fetchQuizQuestions(10, difficulty, category);
        setQuestions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadQuestions();
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

    // SPRAWDZANIE: Jeśli dobra odpowiedź, dodaj punkt
    if (selectedAnswer === currentQ.correct_answer) {
      setScore(prev => prev + 1);
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
    } else {
      // KONIEC GRY: Przenosimy do wyników i wysyłamy punkty w "state"
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

const centerStyle = { textAlign: 'center', padding: '50px', fontSize: '20px', color: '#fff', backgroundColor: '#121212', minHeight: '100vh' };