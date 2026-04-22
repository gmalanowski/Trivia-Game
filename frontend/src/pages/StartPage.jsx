import { Link } from 'react-router-dom';

export default function StartPage() {
  return (
    <section className="start-page">
      <div className="start-page__card">
        <div className="start-logo" aria-label="Trivia Game logo">
          <div className="start-logo__icon">TG</div>
          <div>
            <p className="start-logo__tag">Wiedza. Rywalizacja. Emocje.</p>
            <h1 className="start-logo__title">Trivia Game</h1>
          </div>
        </div>

        <p className="start-page__description">
          Sprawdź swoją wiedzę w pytaniach z różnych kategorii, wybierz poziom trudności i pobij swój
          najlepszy wynik. Każdy quiz to nowy zestaw pytań i realny test refleksu.
        </p>

        <div className="start-page__actions">
          <Link to="/quizpage" className="start-btn start-btn--primary">
            Rozpocznij Quiz
          </Link>
          <Link to="/rejestracja" className="start-btn start-btn--accent">
            Zarejestruj się
          </Link>
          <Link to="/ranking" className="start-btn start-btn--secondary">
            Zobacz Ranking
          </Link>
        </div>
      </div>
    </section>
  );
}