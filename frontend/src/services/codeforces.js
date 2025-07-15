import axios from 'axios';

/**
 * Fetches the source code for a Codeforces submission.
 * @param {string} handle - The user's Codeforces handle.
 * @param {string|number} contestId - The contest ID.
 * @param {string|number} submissionId - The submission ID.
 * @returns {Promise<string>} - The source code as a string.
 */
export async function fetchCodeforcesSubmissionCode(handle, contestId, submissionId) {
  // Debug log
  console.log('[Codeforces Fetch] handle:', handle, 'contestId:', contestId, 'submissionId:', submissionId);
  try {
    const response = await axios.post('/api/codeforces/code', {
      handle,
      contestId,
      submissionId,
    });
    if (response.data && response.data.code) {
      console.log('[Codeforces Fetch] Extracted code length:', response.data.code.length);
      return response.data.code;
    } else {
      console.error('[Codeforces Fetch] No code found in backend response.');
      throw new Error('No code found in backend response.');
    }
  } catch (err) {
    console.error('[Codeforces Fetch] Error fetching or parsing:', err);
    throw err;
  }
}

