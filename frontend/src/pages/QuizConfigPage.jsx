import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCategories } from '../services/api.js';

export default function QuizConfigPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch {
        setCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  const handleStart = () => {
    const selectedCategoryName =
      categories.find((cat) => String(cat.id) === String(selectedCategory))?.name || 'Random';

    navigate('/questionspage', {
      state: { category: selectedCategory, difficulty, categoryName: selectedCategoryName },
    });
  };

  const theme = {
    background: '#121212',
    cardBg: '#1e1e1e',
    accent: '#7c4dff',
    textMain: '#ffffff',
    textMuted: '#bbb',
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 70px)',
        backgroundColor: theme.background,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          backgroundColor: theme.cardBg,
          padding: '40px',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '420px',
          textAlign: 'center',
          border: '1px solid #333',
        }}
      >
        <h1 style={{ color: theme.accent, marginBottom: '30px' }}>Quiz Setup</h1>

        <div style={{ textAlign: 'left', marginBottom: '20px' }}>
          <label style={{ color: theme.textMuted, display: 'block', marginBottom: '8px' }}>
            Choose category:
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            disabled={isLoadingCategories}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: '#333',
              color: '#fff',
              border: 'none',
            }}
          >
            <option value="">
              {isLoadingCategories ? 'Loading categories...' : 'All (Random)'}
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ textAlign: 'left', marginBottom: '30px' }}>
          <label style={{ color: theme.textMuted, display: 'block', marginBottom: '8px' }}>
            Difficulty:
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            {['easy', 'medium', 'hard'].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setDifficulty(level)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: difficulty === level ? theme.accent : '#333',
                  color: '#fff',
                  textTransform: 'capitalize',
                }}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleStart}
          style={{
            width: '100%',
            padding: '15px',
            borderRadius: '12px',
            backgroundColor: theme.accent,
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '18px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Start Game
        </button>
      </div>
    </div>
  );
}