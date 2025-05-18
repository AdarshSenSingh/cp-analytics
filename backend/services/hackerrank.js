const axios = require('axios');

const HACKERRANK_API_BASE = 'https://www.hackerrank.com/rest/contests';

/**
 * Fetches user submissions from HackerRank
 * @param {string} username - HackerRank username
 * @returns {Promise<Array>} - Array of submissions
 */
async function getUserSubmissions(username) {
  try {
    // Note: This is a simplified approach. HackerRank might require authentication
    // or have different API endpoints for production use
    const response = await axios.get(`${HACKERRANK_API_BASE}/master/hackers/${username}/profile`, {
      timeout: 10000, // 10 second timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    // Check if response is valid
    if (!response.data) {
      console.error('Invalid response from HackerRank API');
      return [];
    }
    
    // HackerRank API might return different structure
    // Try to extract submissions from different possible paths
    let submissions = [];
    
    if (response.data.models) {
      submissions = response.data.models;
    } else if (response.data.data && response.data.data.submissions) {
      submissions = response.data.data.submissions;
    } else if (response.data.submissions) {
      submissions = response.data.submissions;
    }
    
    console.log(`Found ${submissions.length} submissions for HackerRank user ${username}`);
    return submissions;
  } catch (error) {
    console.error('Error fetching HackerRank submissions:', error.message);
    // Return empty array instead of throwing error
    return [];
  }
}

/**
 * Maps HackerRank difficulty to standardized difficulty
 * @param {string} difficultyName - HackerRank difficulty name
 * @returns {string} - Standardized difficulty (easy, medium, hard)
 */
function mapDifficulty(difficultyName) {
  if (!difficultyName) return 'medium';
  
  const difficulty = difficultyName.toLowerCase();
  
  if (difficulty.includes('easy')) return 'easy';
  if (difficulty.includes('medium')) return 'medium';
  if (difficulty.includes('hard')) return 'hard';
  
  // If it's a numeric value
  const difficultyNum = parseInt(difficultyName);
  if (!isNaN(difficultyNum)) {
    if (difficultyNum < 30) return 'easy';
    if (difficultyNum < 60) return 'medium';
    return 'hard';
  }
  
  return 'medium';
}

module.exports = {
  getUserSubmissions,
  mapDifficulty
};
