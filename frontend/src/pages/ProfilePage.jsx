import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, STATIC_BASE_URL, joinPath } from '../config';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const storedUsername = localStorage.getItem('username');

  const theme = {
    background: '#121212',
    cardBg: '#1e1e1e',
    textMain: '#ffffff',
    textSec: '#b3b3b3',
    accent: '#7c4dff',
    border: '#333333',
    success: '#4CAF50',
    danger: '#ff5252'
  };

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

        {/* Błąd wgrywania awatara */}
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

        {/* GAME HISTORY PLACEHOLDER */}
        <div style={{ marginTop: '20px' }}>
          <h2 style={{ fontSize: '22px', borderBottom: `1px solid ${theme.border}`, paddingBottom: '10px', marginBottom: '20px' }}>Recent Games</h2>
          <div style={{ padding: '20px', backgroundColor: theme.cardBg, borderRadius: '12px', border: `1px solid ${theme.border}`, textAlign: 'center', color: theme.textSec }}>
            Game history features will be available soon (requires a backend update).
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ title, value, theme, color }) {
  return (
    <div style={{ backgroundColor: theme.cardBg, padding: '20px', borderRadius: '12px', border: `1px solid ${theme.border}`, textAlign: 'center' }}>
      <div style={{ color: theme.textSec, fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px' }}>{title}</div>
      <div style={{ fontSize: '32px', fontWeight: 'bold', color: color || theme.textMain }}>{value}</div>
    </div>
  );
}

const centerStyle = (theme) => ({ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 70px)', backgroundColor: theme.background, color: theme.textMain });