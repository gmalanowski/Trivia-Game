// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import './App.css';
import QuestionsPage from './pages/QuestionsPage';
import ResultsPage from './pages/ResultsPage';
import QuizConfigPage from './pages/QuizConfigPage';
import StartPage from './pages/StartPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';

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

          {/* 2. PODMIENIAMY PUSTY DIV NA NASZ KOMPONENT */}
          <Route path="/leaderboard" element={<LeaderboardPage />} />

          {/* Dodatkowe puste ścieżki żeby uniknąć błędów */}
          <Route path="/register" element={<div style={{ padding: '50px', color: '#000' }}>Registration coming soon</div>} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;