import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL, joinPath } from '../config';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const theme = {
    background: '#121212',
    cardBg: '#1e1e1e',
    accent: '#7c4dff',
    accentHover: '#6a3de8',
    textMain: '#ffffff',
    textSec: '#b3b3b3',
    border: '#333333',
    danger: '#ff5252'
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Frontend validation
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 12) {
      setError('Password must be at least 12 characters long.');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and underscores.');
      return;
    }

    setIsLoading(true);

    try {
      const url = joinPath(API_BASE_URL, "auth", "register");
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
      });

      const data = await response.json();

      // Backend error handling
      if (!response.ok) {
        let errorMsg = 'Registration failed. Please try again.';

        if (data && data.error) {
          if (typeof data.error === 'string') {
            try {
              const parsedError = JSON.parse(data.error);
              if (Array.isArray(parsedError) && parsedError[0]?.message) {
                errorMsg = parsedError[0].message;
              } else {
                errorMsg = data.error;
              }
            } catch (parseErr) {
              errorMsg = data.error;
            }
          } else if (Array.isArray(data.error) && data.error[0]?.message) {
            errorMsg = data.error[0].message;
          } else if (typeof data.error === 'object') {
            errorMsg = data.error.message || 'Registration failed.';
          }
        }

        throw new Error(errorMsg);
      }

      // Success
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.user.username);

      navigate('/profile');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 70px)', backgroundColor: theme.background, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '400px', backgroundColor: theme.cardBg, padding: '40px', borderRadius: '16px', border: `1px solid ${theme.border}`, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: theme.textMain, fontSize: '28px', margin: '0 0 10px 0' }}>Create an Account</h1>
          <p style={{ color: theme.textSec, fontSize: '14px' }}>Join the game and start earning EXP!</p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(255, 82, 82, 0.1)', color: theme.danger, padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', border: `1px solid ${theme.danger}` }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', color: theme.textSec, marginBottom: '8px', fontSize: '13px' }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle(theme)} />
          </div>

          <div>
            <label style={{ display: 'block', color: theme.textSec, marginBottom: '8px', fontSize: '13px' }}>Username (min. 3 characters)</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g., quiz_master" required style={inputStyle(theme)} />
          </div>

          <div>
            <label style={{ display: 'block', color: theme.textSec, marginBottom: '8px', fontSize: '13px' }}>Password (min. 12 characters)</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle(theme)} />
          </div>

          <div>
            <label style={{ display: 'block', color: theme.textSec, marginBottom: '8px', fontSize: '13px' }}>Confirm Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required style={inputStyle(theme)} />
          </div>

          <button type="submit" disabled={isLoading} style={{ backgroundColor: theme.accent, color: 'white', border: 'none', padding: '14px', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: isLoading ? 'not-allowed' : 'pointer', marginTop: '10px' }}>
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', color: theme.textSec, fontSize: '14px' }}>
          Already have an account? <Link to="/login" style={{ color: theme.accent, textDecoration: 'none' }}>Log in</Link>
        </p>
      </div>
    </div>
  );
}

const inputStyle = (theme) => ({
  width: '100%', padding: '12px 16px', backgroundColor: '#121212', border: `1px solid ${theme.border}`, borderRadius: '8px', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box'
});