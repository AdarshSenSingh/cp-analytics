const axios = require('axios');

const CODEFORCES_API_BASE = 'https://codeforces.com/api';

/**
 * Fetches user submissions from Codeforces with date filtering
 * @param {string} username - Codeforces username
 * @param {number} count - Number of submissions to fetch (max 100)
 * @param {Date} startDate - Optional start date filter
 * @param {Date} endDate - Optional end date filter
 * @returns {Promise<Array>} - Array of filtered submissions
 */
async function getUserSubmissions(username, count = 100, startDate = null, endDate = null) {
  try {
    console.log(`Fetching submissions for ${username} from Codeforces API...`);
    
    const url = `${CODEFORCES_API_BASE}/user.status`;
    console.log(`Making request to: ${url} with params: handle=${username}, count=${count}`);
    
    const response = await axios.get(url, {
      params: {
        handle: username,
        count
      },
      timeout: 15000 // 15 second timeout
    });
    
    if (response.data.status !== 'OK') {
      throw new Error(`Codeforces API error: ${response.data.comment}`);
    }
    
    if (!response.data.result || !Array.isArray(response.data.result)) {
      console.error('Invalid response format from Codeforces API:', response.data);
      return [];
    }
    
    console.log(`Successfully fetched ${response.data.result.length} submissions from Codeforces`);
    
    // Apply date filtering if provided
    let filteredSubmissions = response.data.result;
    
    if (startDate || endDate) {
      filteredSubmissions = filteredSubmissions.filter(sub => {
        const submissionDate = new Date(sub.creationTimeSeconds * 1000);
        
        if (startDate && submissionDate < startDate) {
          return false;
        }
        
        if (endDate && submissionDate > endDate) {
          return false;
        }
        
        return true;
      });
      
      console.log(`Filtered to ${filteredSubmissions.length} submissions within date range`);
    }
    
    return filteredSubmissions;
  } catch (err) {
    console.error(`Error fetching Codeforces submissions for ${username}:`, err.message);
    throw err;
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