const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const codeforcesService = require('../services/codeforces');
const hackerRankService = require('../services/hackerrank');
const leetcodeService = require('../services/leetcode');

// @route   POST api/platforms/connect
// @desc    Connect a platform account
// @access  Private
router.post('/connect', auth, async (req, res) => {
  try {
    const { platform, username, accessToken, refreshToken } = req.body;
    
    // Validate input
    if (!platform || !username) {
      return res.status(400).json({ msg: 'Platform and username are required' });
    }
    
    // Validate platform
    if (!['leetcode', 'codeforces', 'hackerrank', 'atcoder', 'other'].includes(platform)) {
      return res.status(400).json({ msg: 'Invalid platform' });
    }
    
    // For Codeforces, verify the username exists
    if (platform === 'codeforces') {
      try {
        // Try to fetch user info from Codeforces to verify username
        const response = await axios.get(`https://codeforces.com/api/user.info`, {
          params: { handles: username }
        });
        
        if (response.data.status !== 'OK') {
          return res.status(400).json({ msg: 'Invalid Codeforces username' });
        }
      } catch (err) {
        console.error('Error verifying Codeforces username:', err.message);
        return res.status(400).json({ msg: 'Could not verify Codeforces username. Please check if the username is correct.' });
      }
    }
    
    // For LeetCode, we'll skip verification entirely
    // LeetCode doesn't provide a public API and blocks scraping attempts
    // We'll trust the user to enter a valid username
    
    // Find the user
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Check if platform is already connected
    const platformIndex = user.platformAccounts.findIndex(acc => acc.platform === platform);
    
    if (platformIndex !== -1) {
      // Update existing platform account
      user.platformAccounts[platformIndex] = {
        ...user.platformAccounts[platformIndex],
        username,
        accessToken,
        refreshToken,
        lastSynced: null
      };
    } else {
      // Add new platform account
      user.platformAccounts.push({
        platform,
        username,
        accessToken,
        refreshToken,
        lastSynced: null,
        stats: {
          problemsSolved: 0,
          totalSubmissions: 0,
          successRate: 0
        }
      });
    }
    
    await user.save();
    
    res.json({ 
      success: true,
      platformAccount: user.platformAccounts.find(acc => acc.platform === platform)
    });
  } catch (err) {
    console.error('Error connecting platform:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET api/platforms/accounts
// @desc    Get user's platform accounts
// @access  Private
router.get('/accounts', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      platformAccounts: user.platformAccounts
    });
  } catch (err) {
    console.error('Error getting platform accounts:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   DELETE api/platforms/:platform
// @desc    Disconnect a platform account
// @access  Private
router.delete('/:platform', auth, async (req, res) => {
  try {
    const platform = req.params.platform;
    
    // Update user's platform accounts
    const user = await User.findById(req.user.id);
    
    // Filter out the platform to disconnect
    user.platformAccounts = user.platformAccounts.filter(acc => acc.platform !== platform);
    
    await user.save();
    
    res.json({ msg: 'Platform disconnected successfully', platformAccounts: user.platformAccounts });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/platforms/sync/:platform
// @desc    Sync platform data
// @access  Private
router.post('/sync/:platform', auth, async (req, res) => {
  try {
    const { platform } = req.params;
    
    // Validate platform
    if (!['leetcode', 'codeforces', 'hackerrank', 'atcoder', 'other'].includes(platform)) {
      return res.status(400).json({ msg: 'Invalid platform' });
    }
    
    // Find the user
    const user = await User.findById(req.user.id);
    
    // Check if platform is connected
    const platformAccount = user.platformAccounts.find(acc => acc.platform === platform);
    
    if (!platformAccount) {
      return res.status(400).json({ msg: `${platform} account not connected` });
    }
    
    // Add user ID to the account object for the sync function
    const accountWithUser = {
      ...platformAccount.toObject(),
      user: user._id
    };
    
    // Sync platform data
    let syncedData = { problems: [], submissions: [] };
    
    try {
      if (platform === 'codeforces') {
        syncedData = await syncCodeforces(accountWithUser);
      } else if (platform === 'leetcode') {
        syncedData = await syncLeetCode(accountWithUser);
      } else if (platform === 'hackerrank') {
        syncedData = await syncHackerRank(accountWithUser);
      } else {
        return res.status(400).json({ msg: `Syncing ${platform} is not supported yet` });
      }
    } catch (syncError) {
      console.error(`Error during ${platform} sync:`, syncError.message);
      // Continue with empty data rather than failing the request
    }
    
    // Update last synced timestamp
    const platformIndex = user.platformAccounts.findIndex(acc => acc.platform === platform);
    user.platformAccounts[platformIndex].lastSynced = new Date();
    
    // Update stats
    if (syncedData) {
      const acceptedSubmissions = syncedData.submissions.filter(sub => sub.status === 'accepted');
      
      user.platformAccounts[platformIndex].stats = {
        problemsSolved: syncedData.problems.length,
        totalSubmissions: syncedData.submissions.length,
        successRate: syncedData.submissions.length > 0 
          ? (acceptedSubmissions.length / syncedData.submissions.length) * 100 
          : 0
      };
    }
    
    await user.save();
    
    res.json({ 
      success: true,
      syncedData: syncedData || { problems: [], submissions: [] },
      platformAccount: user.platformAccounts[platformIndex]
    });
  } catch (err) {
    console.error('Error syncing platform:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Helper function for LeetCode sync
async function syncLeetCode(platformAccount) {
  try {
    const username = platformAccount.username;
    console.log(`Starting LeetCode sync for user: ${username}`);
    
    // Fetch user submissions from LeetCode
    const leetcodeService = require('../services/leetcode');
    const submissions = await leetcodeService.getUserSubmissions(username);
    
    console.log(`Fetched ${submissions.length} submissions from LeetCode`);
    
    const processedSubmissions = [];
    const processedProblems = [];
    const Problem = require('../models/Problem');
    const Submission = require('../models/Submission');
    
    // Process each submission
    for (const sub of submissions) {
      try {
        // Create a unique problem ID for LeetCode problems
        const platformId = sub.questionId || sub.titleSlug;
        
        // Check if problem already exists in our database
        let problem = await Problem.findOne({
          platform: 'leetcode',
          platformId
        });
        
        // If problem doesn't exist, create it
        if (!problem) {
          console.log(`Creating new LeetCode problem: ${sub.title}`);
          problem = new Problem({
            platformId,
            platform: 'leetcode',
            title: sub.title,
            url: `https://leetcode.com/problems/${sub.titleSlug}`,
            difficulty: leetcodeService.mapDifficulty(sub.difficulty),
            topics: sub.topicTags || [],
            acceptanceRate: sub.stats?.acceptanceRate
          });
          
          await problem.save();
          processedProblems.push(problem);
        }
        
        // Check if submission already exists
        const existingSubmission = await Submission.findOne({
          platformSubmissionId: sub.id.toString(),
          platform: 'leetcode'
        });
        
        if (!existingSubmission) {
          console.log(`Creating new LeetCode submission for problem: ${sub.title}`);
          // Create new submission
          const submission = new Submission({
            user: platformAccount.user,
            problem: problem._id,
            platformSubmissionId: sub.id.toString(),
            status: sub.statusDisplay === 'Accepted' ? 'accepted' : 'rejected',
            language: sub.language,
            code: sub.code || '',
            timeTaken: sub.runtime,
            memoryUsed: sub.memory,
            submittedAt: new Date(sub.timestamp * 1000),
            platform: 'leetcode'  // Explicitly set platform to 'leetcode'
          });
          
          await submission.save();
          processedSubmissions.push(submission);
        }
      } catch (err) {
        console.error(`Error processing LeetCode submission:`, err.message);
        // Continue with next submission
      }
    }
    
    console.log(`LeetCode sync completed. Processed ${processedProblems.length} problems and ${processedSubmissions.length} submissions.`);
    
    return {
      problems: processedProblems,
      submissions: processedSubmissions
    };
  } catch (err) {
    console.error('Error syncing LeetCode:', err.message);
    return {
      problems: [],
      submissions: []
    };
  }
}

// Helper function for Codeforces sync
async function syncCodeforces(platformAccount) {
  const username = platformAccount.username;
  
  // Fetch user submissions from Codeforces
  const submissions = await codeforcesService.getUserSubmissions(username);
  
  const processedSubmissions = [];
  const processedProblems = [];
  
  // Process each submission
  for (const sub of submissions) {
    try {
      // Create a unique problem ID for Codeforces problems
      const platformId = `${sub.problem.contestId}${sub.problem.index}`;
      
      // Check if problem already exists in our database
      let problem = await Problem.findOne({
        platform: 'codeforces',
        platformId
      });
      
      // If problem doesn't exist, create it
      if (!problem) {
        // Map Codeforces tags to our topics
        const topics = sub.problem.tags || [];
        
        problem = new Problem({
          platformId,
          platform: 'codeforces',
          title: sub.problem.name,
          url: `https://codeforces.com/problemset/problem/${sub.problem.contestId}/${sub.problem.index}`,
          difficulty: codeforcesService.mapDifficulty(sub.problem.rating),
          topics,
          acceptanceRate: null, // Codeforces doesn't provide this directly
          timeLimit: sub.problem.timeLimit,
          memoryLimit: sub.problem.memoryLimit
        });
        
        await problem.save();
        processedProblems.push(problem);
      }
      
      // Check if submission already exists
      const existingSubmission = await Submission.findOne({
        platformSubmissionId: sub.id.toString(),
        platform: 'codeforces'
      });
      
      if (!existingSubmission) {
        // Create new submission - ENSURE platform is set to 'codeforces'
        const submission = new Submission({
          user: platformAccount.user,
          problem: problem._id,
          platformSubmissionId: sub.id.toString(),
          status: codeforcesService.mapVerdict(sub.verdict),
          language: sub.programmingLanguage,
          code: '', // Codeforces API doesn't provide the code
          timeTaken: sub.timeConsumedMillis / 1000, // Convert to seconds
          memoryUsed: sub.memoryConsumedBytes / 1024, // Convert to KB
          submittedAt: new Date(sub.creationTimeSeconds * 1000), // Convert Unix timestamp to Date
          platform: 'codeforces' // Explicitly set platform to 'codeforces'
        });
        
        await submission.save();
        processedSubmissions.push(submission);
      }
    } catch (err) {
      console.error(`Error processing submission ${sub.id}:`, err.message);
      // Continue with next submission
    }
  }
  
  return {
    problems: processedProblems,
    submissions: processedSubmissions
  };
}

// Helper function for HackerRank sync
async function syncHackerRank(platformAccount) {
  try {
    const username = platformAccount.username;
    
    // Fetch user submissions from HackerRank
    const submissions = await hackerRankService.getUserSubmissions(username);
    
    const processedSubmissions = [];
    const processedProblems = [];
    
    // Process each submission
    for (const sub of submissions) {
      try {
        // Skip if not a valid submission
        if (!sub.name || !sub.slug) continue;
        
        // Create a unique platform ID for the problem
        const platformId = sub.slug;
        
        // Check if problem already exists in our database
        let problem = await Problem.findOne({
          platformId,
          platform: 'hackerrank'
        });
        
        // If problem doesn't exist, create it
        if (!problem) {
          // Map HackerRank tags to our topics
          const topics = sub.track?.slug ? [sub.track.slug] : [];
          
          problem = new Problem({
            platformId,
            platform: 'hackerrank',
            title: sub.name,
            url: `https://www.hackerrank.com/challenges/${sub.slug}`,
            difficulty: hackerRankService.mapDifficulty(sub.difficulty_name),
            topics,
            acceptanceRate: null
          });
          
          await problem.save();
          processedProblems.push(problem);
        }
        
        // Check if submission already exists
        const existingSubmission = await Submission.findOne({
          platformSubmissionId: sub.id.toString(),
          platform: 'hackerrank'
        });
        
        // Skip if submission already exists
        if (existingSubmission) continue;
        
        // Create new submission
        const submission = new Submission({
          user: platformAccount.user,
          problem: problem._id,
          platform: 'hackerrank',
          platformSubmissionId: sub.id.toString(),
          status: sub.status === 'solved' ? 'accepted' : 'rejected',
          language: sub.language || 'unknown',
          submittedAt: sub.submitted_at ? new Date(sub.submitted_at) : new Date(),
          code: sub.code || ''
        });
        
        await submission.save();
        processedSubmissions.push(submission);
      } catch (err) {
        console.error('Error processing HackerRank submission:', err.message);
        // Continue with next submission
      }
    }
    
    return {
      problems: processedProblems,
      submissions: processedSubmissions
    };
  } catch (error) {
    console.error('Error in syncHackerRank:', error.message);
    // Return empty arrays instead of throwing error to prevent 500
    return {
      problems: [],
      submissions: []
    };
  }
}

module.exports = router;






















