const axios = require('axios');

/**
 * Fetches user submissions from LeetCode
 * @param {string} username - LeetCode username
 * @returns {Promise<Array>} - Array of submissions
 */
async function getUserSubmissions(username) {
  try {
    console.log(`Attempting to fetch LeetCode submissions for ${username}`);
    
    // Since LeetCode doesn't provide a public API, we'll return mock data for testing
    // In a production app, you would need to implement a proper solution
    // Options include:
    // 1. Using LeetCode's GraphQL API with authentication
    // 2. Building a browser extension that users can use to export their data
    // 3. Asking users to manually upload their submission data
    
    // Generate some mock submissions for testing
    const mockSubmissions = [
      {
        id: 'lc1001',
        title: 'Two Sum',
        titleSlug: 'two-sum',
        status: 'Accepted',
        statusDisplay: 'Accepted',
        timestamp: Math.floor(Date.now() / 1000) - 86400, // 1 day ago
        language: 'javascript',
        runtime: '76 ms',
        memory: '42.1 MB',
        code: 'function twoSum(nums, target) {\n  const map = {};\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map[complement] !== undefined) {\n      return [map[complement], i];\n    }\n    map[nums[i]] = i;\n  }\n  return [];\n}',
        questionId: '1',
        difficulty: 'Easy',
        topicTags: ['Array', 'Hash Table']
      },
      {
        id: 'lc1002',
        title: 'Add Two Numbers',
        titleSlug: 'add-two-numbers',
        status: 'Accepted',
        statusDisplay: 'Accepted',
        timestamp: Math.floor(Date.now() / 1000) - 172800, // 2 days ago
        language: 'javascript',
        runtime: '112 ms',
        memory: '46.8 MB',
        code: 'function addTwoNumbers(l1, l2) {\n  const dummy = new ListNode(0);\n  let current = dummy;\n  let carry = 0;\n  \n  while (l1 || l2) {\n    const x = l1 ? l1.val : 0;\n    const y = l2 ? l2.val : 0;\n    const sum = x + y + carry;\n    \n    carry = Math.floor(sum / 10);\n    current.next = new ListNode(sum % 10);\n    current = current.next;\n    \n    if (l1) l1 = l1.next;\n    if (l2) l2 = l2.next;\n  }\n  \n  if (carry > 0) {\n    current.next = new ListNode(carry);\n  }\n  \n  return dummy.next;\n}',
        questionId: '2',
        difficulty: 'Medium',
        topicTags: ['Linked List', 'Math', 'Recursion']
      },
      {
        id: 'lc1003',
        title: 'Longest Substring Without Repeating Characters',
        titleSlug: 'longest-substring-without-repeating-characters',
        status: 'Accepted',
        statusDisplay: 'Accepted',
        timestamp: Math.floor(Date.now() / 1000) - 259200, // 3 days ago
        language: 'javascript',
        runtime: '92 ms',
        memory: '45.2 MB',
        code: 'function lengthOfLongestSubstring(s) {\n  const map = {};\n  let start = 0;\n  let maxLen = 0;\n  \n  for (let i = 0; i < s.length; i++) {\n    const char = s[i];\n    \n    if (map[char] !== undefined && map[char] >= start) {\n      start = map[char] + 1;\n    } else {\n      maxLen = Math.max(maxLen, i - start + 1);\n    }\n    \n    map[char] = i;\n  }\n  \n  return maxLen;\n}',
        questionId: '3',
        difficulty: 'Medium',
        topicTags: ['Hash Table', 'String', 'Sliding Window']
      }
    ];
    
    return mockSubmissions;
  } catch (error) {
    console.error('Error fetching LeetCode submissions:', error.message);
    return [];
  }
}

/**
 * Maps LeetCode difficulty to our application's difficulty
 * @param {string} difficulty - LeetCode difficulty
 * @returns {string} - Application difficulty
 */
function mapDifficulty(difficulty) {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'easy';
    case 'medium':
      return 'medium';
    case 'hard':
      return 'hard';
    default:
      return 'unknown';
  }
}

module.exports = {
  getUserSubmissions,
  mapDifficulty
};
