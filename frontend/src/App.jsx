// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import './App.css';
import QuestionsPage from './pages/QuestionsPage';
import ResultsPage from './pages/ResultsPage';
import QuizConfigPage from './pages/QuizConfigPage'; // 1. IMPORTUJEMY
import StartPage from './pages/StartPage';





// --- Główny komponent Aplikacji ---
function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>

        {/* Nasz wspólny pasek na górze - wstawiony tylko raz! */}
        <Header />

        {/* Dynamiczny środek strony - zmienia się w zależności od paska adresu */}
        <Routes>
          <Route path="/" element={<StartPage />} />
          <Route path="/quizpage" element={<QuizConfigPage />} />
          <Route path="/questionspage" element={<QuestionsPage />} />
          <Route path="/podsumowanie-wyniku" element={<ResultsPage />} />
          {/* Dodatkowe puste ścieżki żeby uniknąć błędów */}
          <Route path="/rejestracja" element={<div style={{ padding: '50px', color: '#000' }}>Rejestracja w budowie</div>} />
          <Route path="/ranking" element={<div style={{ padding: '50px', color: '#000' }}>Ranking w budowie</div>} />
          <Route path="/profil" element={<div style={{ padding: '50px', color: '#000' }}>Profil w budowie</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;