import { Link, useLocation } from 'react-router-dom';

// Profesjonalna paleta kolorów z Twojego projektu
const colors = {
  bg: '#1a1a1a',          // Ciemny grafit (tło paska)
  bgAlt: '#333333',       // Ciemniejszy szary (obramowanie)
  text: '#ffffff',        // Biały (tekst)
  primary: '#7c4dff',     // Nowoczesny fiolet (akcent przycisków)
  primaryHover: '#b47cff' // Jaśniejszy fiolet (efekt po najechaniu)
};

export default function Header() {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const isAuthenticated = Boolean(token);

  // Funkcja pomocnicza do sprawdzania, czy dany link jest aktywny
  const isActive = (path) => location.pathname === path;

  // Styl dla pojedynczego przycisku nawigacji
  const getNavStyle = (path) => ({
    textDecoration: 'none',
    color: colors.text,
    fontSize: '16px',
    backgroundColor: isActive(path) ? colors.primary : 'transparent', // Fiolet tylko dla aktywnego
    padding: '12px 24px',
    borderRadius: '8px', // Zaokrąglone rogi z Twoich makiet
    transition: 'background-color 0.2s ease',
    border: 'none',
    cursor: 'pointer'
  });

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between', // Rozsuwa elementy na boki
      alignItems: 'center',
      width: '100%', // Rozciągnięty na całej długości
      padding: '15px 50px', // Odstępy wewnątrz paska
      backgroundColor: colors.bg,
      color: colors.text,
      borderBottom: `2px solid ${colors.bgAlt}`, // Ciemne obramowanie na dole
      boxSizing: 'border-box' // Zapobiega "wypychaniu" paska poza ekran
    }}>
      {/* Lewa sekcja - Logo */}
      <div>
        <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 'bold' }}>
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
            Trivia<span style={{ color: colors.primary }}>Game</span>
          </Link>
        </h2>
      </div>

      {/* Prawa sekcja - Menu sterowane stanem autoryzacji (BEZ przycisku Logout) */}
      <nav style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        {isAuthenticated ? (
          /* --- WIDOK DLA ZALOGOWANEGO --- */
          <>
            <Link to="/quizpage" style={getNavStyle('/quizpage')}>Quiz</Link>
            <Link to="/leaderboard" style={getNavStyle('/leaderboard')}>Leaderboard</Link>
            <Link to="/profile" style={getNavStyle('/profile')}>Profile</Link>
          </>
        ) : (
          /* --- WIDOK DLA NIEZALOGOWANEGO --- */
          <>
            <Link to="/login" style={getNavStyle('/login')}>Login</Link>
            <Link to="/register" style={getNavStyle('/register')}>Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}