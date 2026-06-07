// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import './App.css';

// Importy stron
import QuestionsPage from './pages/QuestionsPage';
import ResultsPage from './pages/ResultsPage';
import QuizConfigPage from './pages/QuizConfigPage';
import StartPage from './pages/StartPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// --- Główny komponent Aplikacji ---
function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: '#121212' }}>

        <Header />

        <Routes>
          <Route path="/" element={<StartPage />} />
          <Route path="/quizpage" element={<QuizConfigPage />} />
          <Route path="/questionspage" element={<QuestionsPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;