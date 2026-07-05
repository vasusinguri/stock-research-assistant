/**
 * API Service layer for communicating with FastAPI Backend.
 * Dynamically supports production Cloud URL (VITE_API_BASE_URL) or local Vite proxy fallback (/api/v1).
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

/**
 * Check backend health status
 */
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch health check from backend:', error);
    throw error;
  }
}

/**
 * Search for Indian stocks by ticker symbol or company name
 */
export async function searchStocks(query) {
  if (!query || query.trim().length === 0) return [];
  try {
    const response = await fetch(`${API_BASE_URL}/stocks/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error(`Failed to search stocks for query '${query}':`, error);
    return [];
  }
}

/**
 * Fetch detailed basic info for a selected stock ticker
 */
export async function fetchStockInfo(symbol) {
  try {
    const response = await fetch(`${API_BASE_URL}/stocks/${encodeURIComponent(symbol)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch stock info for symbol '${symbol}':`, error);
    throw error;
  }
}

/**
 * Fetch deep fundamental analysis DTO (Ratios, Solvency, Growth, Shareholding)
 */
export async function fetchStockFundamentals(symbol) {
  try {
    const response = await fetch(`${API_BASE_URL}/stocks/${encodeURIComponent(symbol)}/fundamentals`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch stock fundamentals for '${symbol}':`, error);
    throw error;
  }
}

/**
 * Send AI Research Assistant Explanation Request
 */
export async function askAI(symbol, questionType = 'beginner_overview', customQuestion = null) {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/explain`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        symbol: symbol,
        question_type: questionType,
        user_question: customQuestion,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to generate AI explanation for '${symbol}':`, error);
    throw error;
  }
}
