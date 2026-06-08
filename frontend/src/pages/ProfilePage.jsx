import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, STATIC_BASE_URL, joinPath } from '../config';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  const [uploadError, setUploadError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // States for Game History list
  const [history, setHistory] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState(null);

  // States for Modal (Specific Session Details)
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [sessionDetails, setSessionDetails] = useState(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'mistakes', 'correct'

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const storedUsername = localStorage.getItem('username');

  const theme = {
    background: '#121212',
    cardBg: '#1e1e1e',
    cardLight: '#2a2a2a',
    textMain: '#ffffff',
    textSec: '#b3b3b3',
    accent: '#7c4dff',
    border: '#333333',
    success: '#4CAF50',
    danger: '#ff5252',
    gold: '#FFD700'
  };

  // Fetch Profile Info
  useEffect(() => {
    if (!token || !storedUsername) {
      setIsLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(joinPath(API_BASE_URL, "users", storedUsername), {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch profile data.');

        const data = await response.json();
        setUser(data.user);
      } catch (err) {
        setPageError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [token, storedUsername]);

  // Fetch Game History List
  useEffect(() => {
    if (!token) {
      setIsHistoryLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        const response = await fetch(`${joinPath(API_BASE_URL, "users", "me", "history")}?limit=10`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch game history.');

        const result = await response.json();
        setHistory(result.data || []);
      } catch (err) {
        setHistoryError(err.message);
      } finally {
        setIsHistoryLoading(false);
      }
    };

    fetchHistory();
  }, [token]);

  // Fetch Specific Session Details for Modal
  const handleSessionClick = async (sessionId) => {
    setSelectedSessionId(sessionId);
    setIsModalLoading(true);
    setModalError(null);
    setActiveTab('all'); // Reset tab when opening new modal

    try {
      const response = await fetch(joinPath(API_BASE_URL, "users", "me", "history", sessionId), {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch game details.');

      const data = await response.json();
      setSessionDetails(data);
    } catch (err) {
      setModalError(err.message);
    } finally {
      setIsModalLoading(false);
    }
  };

  // Close the Modal
  const closeModal = () => {
    setSelectedSessionId(null);
    setSessionDetails(null);
    setModalError(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadError(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(joinPath(API_BASE_URL, "users", "avatar"), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload avatar.');
      }

      setUser(data.user);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // --- Helper functions for the Modal ---
  const getBadgeData = (score, total) => {
    if (!total) return { text: 'In Progress...', color: theme.textSec };
    const percentage = (score / total) * 100;
    if (percentage === 100) return { text: 'Perfect Score! 🏆', color: theme.gold };
    if (percentage >= 75) return { text: 'Great Job! ⭐', color: theme.success };
    if (percentage >= 50) return { text: 'Passed! 👍', color: theme.accent };
    return { text: 'Better luck next time! 🧠', color: theme.danger };
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return '--';
    const diff = new Date(end) - new Date(start);
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  if (isLoading) return <div style={centerStyle(theme)}>Loading profile...</div>;

  if (!token || !storedUsername) {
    return (
      <div style={centerStyle(theme)}>
        <div style={{ backgroundColor: theme.cardBg, padding: '40px', borderRadius: '16px', border: `1px solid ${theme.border}`, textAlign: 'center' }}>
          <h2>Please log in to see your profile</h2>
          <p style={{ color: theme.textSec, marginBottom: '20px' }}>Your game history and statistics are waiting!</p>
          <button onClick={() => navigate('/login')} style={{ backgroundColor: theme.accent, color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (pageError) return <div style={centerStyle(theme)}>Error: {pageError}</div>;

  return (
    <div style={{ minHeight: 'calc(100vh - 70px)', backgroundColor: theme.background, color: theme.textMain, padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '30px' }}>

        {uploadError && (
          <div style={{ backgroundColor: 'rgba(255, 82, 82, 0.1)', color: theme.danger, padding: '12px', borderRadius: '8px', border: `1px solid ${theme.danger}` }}>
            ⚠️ {uploadError}
          </div>
        )}

        {/* HEADER */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.cardBg, padding: '30px', borderRadius: '16px', border: `1px solid ${theme.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
            <div
              onClick={handleAvatarClick}
              title="Click to change avatar"
              style={{
                width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(124, 77, 255, 0.2)', border: `2px solid ${theme.accent}`, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '28px', color: theme.accent, overflow: 'hidden', cursor: 'pointer', position: 'relative'
              }}
            >
              {isUploading ? (
                <span style={{ fontSize: '14px' }}>...</span>
              ) : user.avatarUrl ? (
                <img src={joinPath(STATIC_BASE_URL, user.avatarUrl)} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user.username[0].toUpperCase()
              )}

              <div style={{ position: 'absolute', bottom: 0, width: '100%', height: '20px', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: 0.8 }}>
                <span style={{ fontSize: '10px', color: 'white' }}>EDIT</span>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/jpeg, image/png, image/webp, image/gif"
              onChange={handleFileChange}
            />

            <div>
              <h1 style={{ margin: 0 }}>{user.username}</h1>
              <p style={{ color: theme.accent, fontWeight: 'bold', margin: '5px 0' }}>{user.title || 'Novice'}</p>
              <p style={{ color: theme.textSec, fontSize: '14px' }}>{user.bio || 'No bio available.'}</p>
            </div>
          </div>
          <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: 'transparent', border: `1px solid ${theme.danger}`, color: theme.danger, borderRadius: '8px', cursor: 'pointer' }}>
            Log out
          </button>
        </div>

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <StatCard title="Total EXP" value={user.exp} theme={theme} color={theme.accent} />
          <StatCard title="Rank Status" value="Active" theme={theme} />
        </div>

        {/* GAME HISTORY LIST */}
        <div style={{ marginTop: '20px' }}>
          <h2 style={{ fontSize: '22px', borderBottom: `1px solid ${theme.border}`, paddingBottom: '10px', marginBottom: '20px' }}>Recent Games</h2>

          {isHistoryLoading ? (
            <div style={{ textAlign: 'center', color: theme.textSec, padding: '20px' }}>Loading history...</div>
          ) : historyError ? (
            <div style={{ textAlign: 'center', color: theme.danger, padding: '20px' }}>⚠️ {historyError}</div>
          ) : history.length === 0 ? (
            <div style={{ padding: '20px', backgroundColor: theme.cardBg, borderRadius: '12px', border: `1px solid ${theme.border}`, textAlign: 'center', color: theme.textSec }}>
              You haven't played any games yet. Start a quiz to see your history!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {history.map((session) => (
                <div
                  key={session.id}
                  onClick={() => handleSessionClick(session.id)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: theme.cardBg,
                    padding: '20px',
                    borderRadius: '12px',
                    border: `1px solid ${theme.border}`,
                    cursor: 'pointer',
                    transition: 'border-color 0.2s ease-in-out'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = theme.accent}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = theme.border}
                >
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '16px', color: theme.textMain }}>
                      {session.category || 'Mixed Category'}
                      <span style={{ fontSize: '12px', color: theme.accent, marginLeft: '10px', textTransform: 'uppercase' }}>
                        {session.difficulty || 'Any'}
                      </span>
                    </div>
                    <div style={{ color: theme.textSec, fontSize: '13px', marginTop: '6px' }}>
                      {new Date(session.startedAt).toLocaleDateString()} at {new Date(session.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: session.score >= (session.totalQuestions / 2) ? theme.success : theme.accent }}>
                      {session.score} / {session.totalQuestions}
                    </div>
                    <div style={{ color: theme.textSec, fontSize: '12px', marginTop: '4px' }}>
                      {session.status === 'COMPLETED' ? 'Completed' : 'In Progress'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ENHANCED SESSION DETAILS MODAL */}
      {selectedSessionId && (
        <div
          onClick={closeModal}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(3px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000, padding: '20px', boxSizing: 'border-box'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`,
              width: '100%', maxWidth: '650px', maxHeight: '90vh',
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}
          >
            {/* 1. Modal Header */}
            <div style={{ padding: '20px 25px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#181818' }}>
              <h3 style={{ margin: 0, color: theme.textMain, fontSize: '20px' }}>Post-Game Summary</h3>
              <button onClick={closeModal} style={{ background: 'transparent', border: 'none', color: theme.textSec, fontSize: '28px', cursor: 'pointer', lineHeight: '1' }}>
                &times;
              </button>
            </div>

            <div style={{ overflowY: 'auto' }}>
              {isModalLoading ? (
                <div style={{ textAlign: 'center', color: theme.textSec, padding: '40px 0' }}>Loading details...</div>
              ) : modalError ? (
                <div style={{ textAlign: 'center', color: theme.danger, padding: '40px 0' }}>⚠️ {modalError}</div>
              ) : sessionDetails ? (
                <>
                  {/* 2. Dynamic Performance Badge */}
                  <div style={{
                    backgroundColor: `${getBadgeData(sessionDetails.score, sessionDetails.totalQuestions).color}22`, // 22 adds transparency 
                    padding: '15px',
                    textAlign: 'center',
                    borderBottom: `1px solid ${theme.border}`
                  }}>
                    <strong style={{
                      color: getBadgeData(sessionDetails.score, sessionDetails.totalQuestions).color,
                      fontSize: '18px',
                      letterSpacing: '1px'
                    }}>
                      {getBadgeData(sessionDetails.score, sessionDetails.totalQuestions).text}
                    </strong>
                  </div>

                  {/* 3. Score Dashboard (Stats) */}
                  <div style={{ display: 'flex', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={modalStatStyle(theme)}>
                      <div style={{ fontSize: '12px', color: theme.textSec, textTransform: 'uppercase', marginBottom: '5px' }}>Accuracy</div>
                      <div style={{ fontSize: '22px', fontWeight: 'bold', color: theme.textMain }}>
                        {sessionDetails.totalQuestions ? Math.round((sessionDetails.score / sessionDetails.totalQuestions) * 100) : 0}%
                      </div>
                    </div>
                    <div style={{ width: '1px', backgroundColor: theme.border }}></div>
                    <div style={modalStatStyle(theme)}>
                      <div style={{ fontSize: '12px', color: theme.textSec, textTransform: 'uppercase', marginBottom: '5px' }}>Time Spent</div>
                      <div style={{ fontSize: '22px', fontWeight: 'bold', color: theme.textMain }}>
                        {calculateDuration(sessionDetails.startedAt, sessionDetails.endedAt)}
                      </div>
                    </div>
                    <div style={{ width: '1px', backgroundColor: theme.border }}></div>
                    <div style={modalStatStyle(theme)}>
                      <div style={{ fontSize: '12px', color: theme.textSec, textTransform: 'uppercase', marginBottom: '5px' }}>EXP Earned</div>
                      <div style={{ fontSize: '22px', fontWeight: 'bold', color: theme.accent }}>
                        +{sessionDetails.score}
                      </div>
                    </div>
                  </div>

                  {/* 4. Tabs for Filtering */}
                  <div style={{ display: 'flex', padding: '15px 25px 0 25px', gap: '10px' }}>
                    <button onClick={() => setActiveTab('all')} style={tabStyle(activeTab === 'all', theme)}>All Questions</button>
                    <button onClick={() => setActiveTab('mistakes')} style={tabStyle(activeTab === 'mistakes', theme)}>Mistakes</button>
                    <button onClick={() => setActiveTab('correct')} style={tabStyle(activeTab === 'correct', theme)}>Correct</button>
                  </div>

                  {/* 5. Question List (Filtered) */}
                  <div style={{ padding: '20px 25px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {sessionDetails.results
                        .filter(r => {
                          if (activeTab === 'correct') return r.isCorrect;
                          if (activeTab === 'mistakes') return !r.isCorrect;
                          return true;
                        })
                        .map((result, idx) => (
                          <div key={result.id} style={{ padding: '16px', backgroundColor: theme.cardLight, borderRadius: '10px', borderLeft: `4px solid ${result.isCorrect ? theme.success : theme.danger}` }}>
                            <p
                              style={{ margin: '0 0 10px 0', color: theme.textMain, fontSize: '15px', lineHeight: '1.4' }}
                              dangerouslySetInnerHTML={{ __html: `<strong>Q:</strong> ${result.questionText}` }}
                            />

                            <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                              <span style={{ color: theme.textSec }}>You answered: </span>
                              <span
                                style={{ color: result.isCorrect ? theme.success : theme.danger, fontWeight: 'bold' }}
                                dangerouslySetInnerHTML={{ __html: result.userAnswer || 'Skipped / Timeout' }}
                              />
                            </div>

                            {!result.isCorrect && (
                              <div style={{ fontSize: '14px' }}>
                                <span style={{ color: theme.textSec }}>Correct answer: </span>
                                <span
                                  style={{ color: theme.success, fontWeight: 'bold' }}
                                  dangerouslySetInnerHTML={{ __html: result.correctAnswer }}
                                />
                              </div>
                            )}
                          </div>
                        ))}

                      {/* Info jeśli filtr zwróci puste wyniki (np. gracz miał 100% i kliknie "Mistakes") */}
                      {sessionDetails.results.filter(r => activeTab === 'correct' ? r.isCorrect : activeTab === 'mistakes' ? !r.isCorrect : true).length === 0 && (
                        <div style={{ textAlign: 'center', padding: '20px', color: theme.textSec, fontStyle: 'italic' }}>
                          No questions found in this category.
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Helper components for styling
function StatCard({ title, value, theme, color }) {
  return (
    <div style={{ backgroundColor: theme.cardBg, padding: '20px', borderRadius: '12px', border: `1px solid ${theme.border}`, textAlign: 'center' }}>
      <div style={{ color: theme.textSec, fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px' }}>{title}</div>
      <div style={{ fontSize: '32px', fontWeight: 'bold', color: color || theme.textMain }}>{value}</div>
    </div>
  );
}

const modalStatStyle = (theme) => ({
  flex: 1,
  padding: '15px',
  textAlign: 'center',
  backgroundColor: theme.cardBg
});

const tabStyle = (isActive, theme) => ({
  padding: '8px 16px',
  backgroundColor: isActive ? theme.cardLight : 'transparent',
  color: isActive ? theme.textMain : theme.textSec,
  border: `1px solid ${isActive ? theme.border : 'transparent'}`,
  borderBottom: 'none',
  borderRadius: '8px 8px 0 0',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: isActive ? 'bold' : 'normal',
  transition: 'all 0.2s'
});

const centerStyle = (theme) => ({ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 70px)', backgroundColor: theme.background, color: theme.textMain });