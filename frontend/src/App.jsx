import './App.css'

function App() {
  // Tutaj w przyszłości dodamy logikę, np. co ma się stać po kliknięciu przycisku

  return (
    <div className="start-screen">
      <h1>Trivia Game</h1>
      <p>Witaj w quizie sprawdzającym Twoją wiedzę!</p>
      <div className="filters-container">
        <div className="filter-group">
          <label htmlFor="category">Wybierz kategorię:</label>
          <select id="category">
            <option value="">Wszystkie</option>
            <option value="geography">Geografia</option>
            <option value="history">Historia</option>
            <option value="sport">Sport</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Poziom trudności:</label>
          <div className="difficulty-options">
            <label className="radio-label">
              <input type="radio" name="difficulty" value="easy" defaultChecked /> Łatwy
            </label>
            <label className="radio-label">
              <input type="radio" name="difficulty" value="medium" /> Średni
            </label>
            <label className="radio-label">
              <input type="radio" name="difficulty" value="hard" /> Trudny
            </label>
          </div>
        </div>
      </div>
      <button>Rozpocznij grę</button>
    </div>

  )
}

export default App