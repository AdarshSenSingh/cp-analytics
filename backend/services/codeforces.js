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
    console.log(`Fetching submissions for ${username} from Codeforces API...`);
    
    // Log the full URL for debugging
    const url = `${CODEFORCES_API_BASE}/user.status`;
    console.log(`Making request to: ${url} with params: handle=${username}, count=${count}`);
    
    const response = await axios.get(url, {
      params: {
        handle: username,
        count
      },
      timeout: 15000 // 15 second timeout
    });
    
    // Log the response status and data structure
    console.log(`Codeforces API response status: ${response.data.status}`);
    console.log(`Response data structure:`, Object.keys(response.data));
    
    if (response.data.status !== 'OK') {
      throw new Error(`Codeforces API error: ${response.data.comment}`);
    }
    
    if (!response.data.result || !Array.isArray(response.data.result)) {
      console.error('Invalid response format from Codeforces API:', response.data);
      return [];
    }
    
    console.log(`Successfully fetched ${response.data.result.length} submissions from Codeforces`);
    
    // Log a sample submission to understand the structure
    if (response.data.result.length > 0) {
      console.log('Sample submission structure:', JSON.stringify(response.data.result[0], null, 2));
    }
    
    return response.data.result;
  } catch (error) {
    console.error('Error fetching Codeforces submissions:', error.message);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    }
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
 * Maps Codeforces verdict to our status format
 * @param {string} verdict - Codeforces verdict
 * @returns {string} - Mapped status
 */
function mapVerdict(verdict) {
  if (!verdict) return 'pending';
  
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
 * Maps Codeforces problem rating to difficulty
 * @param {number} rating - Codeforces problem rating
 * @returns {string} - Difficulty level
 */
function mapDifficulty(rating) {
  if (!rating) return 'medium';
  
  if (rating < 1200) return 'easy';
  if (rating < 1800) return 'medium';
  return 'hard';
}

module.exports = {
  getUserSubmissions,
  getProblemDetails,
  mapVerdict,
  mapDifficulty
};