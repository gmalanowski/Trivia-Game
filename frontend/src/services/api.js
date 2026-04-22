// src/services/api.js

const BACKEND_URL = 'http://localhost:3000/api/v1'; 

// 1. Dodaliśmy 'category' jako trzeci argument
export const fetchQuizQuestions = async (amount = 10, difficulty = 'medium', category = '') => {
  try {
    // 2. Budujemy parametr kategorii tylko jeśli została wybrana
    const categoryParam = category ? `&category=${category}` : '';
    
    // 3. Budujemy pełny adres URL
    const url = `${BACKEND_URL}/questions?amount=${amount}&difficulty=${difficulty}${categoryParam}`;
    
    // 4. Wykonujemy JEDNO zapytanie pod właściwy adres
    const response = await fetch(url);
    
    if (!response.ok) {
      let backendMessage = `Błąd serwera: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData?.error) {
          backendMessage = errorData.error;
        }
      } catch {
        // Ignore JSON parse errors and keep default message.
      }

      throw new Error(backendMessage);
    }

    const questionsArray = await response.json();
    return questionsArray;
    
  } catch (error) {
    console.error("Błąd podczas pobierania pytań z backendu:", error);
    throw error; 
  }
};

// Funkcja do pobierania listy kategorii do dropdowna
export const fetchCategories = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/categories`);
    if (!response.ok) throw new Error('Nie udało się pobrać kategorii');
    return await response.json();
  } catch (error) {
    console.error("Błąd kategorii:", error);
    throw error;
  }
};