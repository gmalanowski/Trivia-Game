import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: username,
          password: password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const msg = data.error?.message || data.error || 'Błąd logowania';
        throw new Error(typeof msg === 'object' ? JSON.stringify(msg) : msg);
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('username', username);
      navigate('/profile');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 70px)',
      backgroundColor: theme.background,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: theme.cardBg,
        padding: '40px',
        borderRadius: '16px',
        border: `1px solid ${theme.border}`,
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: theme.textMain, fontSize: '28px', margin: '0 0 10px 0' }}>Welcome back!</h1>
          <p style={{ color: theme.textSec, fontSize: '14px' }}>Log in to earn EXP points</p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(255, 82, 82, 0.1)',
            color: theme.danger,
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            border: `1px solid ${theme.danger}`
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', color: theme.textSec, marginBottom: '8px', fontSize: '13px' }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., alice_wonder"
              required
              style={inputStyle(theme)}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: theme.textSec, marginBottom: '8px', fontSize: '13px' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={inputStyle(theme)}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              backgroundColor: theme.accent,
              color: 'white',
              border: 'none',
              padding: '14px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              marginTop: '10px',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => !isLoading && (e.target.style.backgroundColor = theme.accentHover)}
            onMouseOut={(e) => !isLoading && (e.target.style.backgroundColor = theme.accent)}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle = (theme) => ({
  width: '100%',
  padding: '12px 16px',
  backgroundColor: '#121212',
  border: `1px solid ${theme.border}`,
  borderRadius: '8px',
  color: 'white',
  fontSize: '15px',
  outline: 'none',
  boxSizing: 'border-box'
});