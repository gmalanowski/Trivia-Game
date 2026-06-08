import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

// Komponent pomocniczy do blokowania dostępu dla niezalogowanych
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: '#121212' }}>

        <Header />

        <Routes>
          {/* Publiczne trasy dostępne dla każdego */}
          <Route path="/" element={<StartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Prywatne trasy zabezpieczone przed osobami bez tokenu */}
          <Route path="/quizpage" element={
            <ProtectedRoute><QuizConfigPage /></ProtectedRoute>
          } />
          <Route path="/questionspage" element={
            <ProtectedRoute><QuestionsPage /></ProtectedRoute>
          } />
          <Route path="/results" element={
            <ProtectedRoute><ResultsPage /></ProtectedRoute>
          } />
          <Route path="/leaderboard" element={
            <ProtectedRoute><LeaderboardPage /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}