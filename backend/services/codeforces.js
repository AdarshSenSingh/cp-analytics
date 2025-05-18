const axios = require('axios');

const CODEFORCES_API_BASE = 'https://codeforces.com/api';

/**
 * Fetches user submissions from Codeforces
 * @param {string} username - Codeforces username
 * @param {number} count - Number of submissions to fetch (max 100)
 * @returns {Promise<Array>} - Array of submissions
 */
async function getUserSubmissions(username, count = 100) {
  try {
    const response = await axios.get(`${CODEFORCES_API_BASE}/user.status`, {
      params: {
        handle: username,
        count
      }
    });
    
    if (response.data.status !== 'OK') {
      throw new Error(`Codeforces API error: ${response.data.comment}`);
    }
    
    return response.data.result;
  } catch (error) {
    console.error('Error fetching Codeforces submissions:', error.message);
    throw error;
  }
}

/**
 * Fetches problem details from Codeforces
 * @param {string} contestId - Contest ID
 * @param {string} index - Problem index (A, B, C, etc.)
 * @returns {Promise<Object>} - Problem details
 */
async function getProblemDetails(contestId, index) {
  try {
    const response = await axios.get(`${CODEFORCES_API_BASE}/contest.standings`, {
      params: {
        contestId,
        from: 1,
        count: 1
      }
    });
    
    if (response.data.status !== 'OK') {
      throw new Error(`Codeforces API error: ${response.data.comment}`);
    }
    
    const problem = response.data.result.problems.find(p => p.index === index);
    if (!problem) {
      throw new Error(`Problem not found: ${contestId}${index}`);
    }
    
    return problem;
  } catch (error) {
    console.error('Error fetching Codeforces problem details:', error.message);
    throw error;
  }
}

/**
 * Maps Codeforces verdict to our application's status
 * @param {string} verdict - Codeforces verdict
 * @returns {string} - Application status
 */
function mapVerdict(verdict) {
  const verdictMap = {
    'OK': 'accepted',
    'WRONG_ANSWER': 'wrong_answer',
    'TIME_LIMIT_EXCEEDED': 'time_limit_exceeded',
    'MEMORY_LIMIT_EXCEEDED': 'memory_limit_exceeded',
    'RUNTIME_ERROR': 'runtime_error',
    'COMPILATION_ERROR': 'compilation_error'
  };
  
  return verdictMap[verdict] || 'other';
}

/**
 * Maps Codeforces difficulty to our application's difficulty
 * @param {number} rating - Codeforces problem rating
 * @returns {string} - Application difficulty
 */
function mapDifficulty(rating) {
  if (!rating) return 'unknown';
  
  if (rating < 1400) return 'easy';
  if (rating < 2000) return 'medium';
  return 'hard';
}

module.exports = {
  getUserSubmissions,
  getProblemDetails,
  mapVerdict,
  mapDifficulty
};