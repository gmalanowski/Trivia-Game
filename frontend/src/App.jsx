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
          <Route path="/results" element={<ResultsPage />} />
          {/* Dodatkowe puste ścieżki żeby uniknąć błędów */}
          <Route path="/register" element={<div style={{ padding: '50px', color: '#000' }}>Registration coming soon</div>} />
          <Route path="/leaderboard" element={<div style={{ padding: '50px', color: '#000' }}>Leaderboard coming soon</div>} />
          <Route path="/profile" element={<div style={{ padding: '50px', color: '#000' }}>Profile coming soon</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;