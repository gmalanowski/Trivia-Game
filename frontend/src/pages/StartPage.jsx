import { Link } from 'react-router-dom';

export default function StartPage() {
  return (
    <section className="start-page">
      <div className="start-page__card">
        <div className="start-logo" aria-label="Trivia Game logo">
          <div className="start-logo__icon">TG</div>
          <div>
            <p className="start-logo__tag">Knowledge. Competition. Emotion.</p>
            <h1 className="start-logo__title">Trivia Game</h1>
          </div>
        </div>

        <p className="start-page__description">
          Test your knowledge with questions from multiple categories, choose the difficulty level, and beat
          your best score. Every quiz is a fresh set of questions and a real reflex challenge.
        </p>

        <div className="start-page__actions">
          <Link to="/quizpage" className="start-btn start-btn--primary">
            Start Quiz
          </Link>
          <Link to="/register" className="start-btn start-btn--accent">
            Sign Up
          </Link>
          <Link to="/leaderboard" className="start-btn start-btn--secondary">
            View Leaderboard
          </Link>
        </div>
      </div>
    </section>
  );
}