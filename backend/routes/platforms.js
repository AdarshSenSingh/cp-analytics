const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const codeforcesService = require('../services/codeforces');
// Remove other platform services
// const hackerRankService = require('../services/hackerrank');

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
    
    // Validate platform - only allow codeforces
    if (platform !== 'codeforces') {
      return res.status(400).json({ msg: 'Only Codeforces is supported' });
    }
    
    // For Codeforces, verify the username exists
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
// @desc    Sync user data from a platform
// @access  Private
router.post('/sync/:platform', auth, async (req, res) => {
  const { platform } = req.params;
  
  try {
    // Only allow Codeforces
    if (platform !== 'codeforces') {
      return res.status(400).json({ msg: 'Only Codeforces is supported' });
    }

    // Find the user
    const user = await User.findById(req.user.id);
    
    // Check if the platform is connected
    const platformAccount = user.platformAccounts.find(acc => acc.platform === platform);
    if (!platformAccount) {
      return res.status(400).json({ msg: `${platform} is not connected` });
    }
    
    console.log(`Starting ${platform} sync for user: ${platformAccount.username}`);
    
    // Add user ID to the platform account object
    platformAccount.user = user._id;
    
    // Sync Codeforces
    const syncedData = await syncCodeforces(platformAccount);
    
    // Update last synced timestamp
    const platformIndex = user.platformAccounts.findIndex(acc => acc.platform === platform);
    user.platformAccounts[platformIndex].lastSynced = new Date();
    
    await user.save();
    
    res.json({ 
      success: true,
      syncedData: syncedData || { problems: [], submissions: [] },
      platformAccount: user.platformAccounts[platformIndex]
    });
  } catch (err) {
    console.error(`Error syncing ${platform}:`, err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Helper function for Codeforces sync
async function syncCodeforces(platformAccount) {
  const username = platformAccount.username;
  const userId = platformAccount.user;
  
  try {
    // Fetch user submissions from Codeforces
    const submissions = await codeforcesService.getUserSubmissions(username);
    console.log(`Fetched ${submissions.length} submissions for ${username} from Codeforces`);
    
    if (!submissions || submissions.length === 0) {
      console.log(`No submissions found for ${username} on Codeforces`);
      return { problems: [], submissions: [] };
    }
    
    const processedSubmissions = [];
    const processedProblems = [];
    
    // Process each submission
    for (const sub of submissions) {
      try {
        // Skip if problem info is missing
        if (!sub.problem || !sub.problem.contestId || !sub.problem.index) {
          continue;
        }
        
        // Create a unique platform ID for the problem
        const platformId = `${sub.problem.contestId}${sub.problem.index}`;
        
        // Check if problem already exists
        let problem = await Problem.findOne({
          platformId,
          platform: 'codeforces'
        });
        
        // If problem doesn't exist, create it
        if (!problem) {
          console.log(`Creating new problem: ${platformId}`);
          // Map Codeforces tags to our topics
          const topics = sub.problem.tags ? sub.problem.tags.filter(tag => !tag.startsWith('*')) : [];
          
          problem = new Problem({
            platformId,
            platform: 'codeforces',
            title: sub.problem.name,
            url: `https://codeforces.com/problemset/problem/${sub.problem.contestId}/${sub.problem.index}`,
            difficulty: codeforcesService.mapDifficulty(sub.problem.rating),
            rating: sub.problem.rating || null, // Save the actual rating value
            topics,
            acceptanceRate: null, // Codeforces doesn't provide this directly
            timeLimit: sub.problem.timeLimit,
            memoryLimit: sub.problem.memoryLimit
          });
          
          await problem.save();
          processedProblems.push(problem);
        } else if (!problem.rating && sub.problem.rating) {
          // Update existing problem with rating if it doesn't have one
          problem.rating = sub.problem.rating;
          problem.difficulty = codeforcesService.mapDifficulty(sub.problem.rating);
          await problem.save();
        }
        
        // Check if submission already exists
        const existingSubmission = await Submission.findOne({
          platformSubmissionId: sub.id.toString(),
          platform: 'codeforces'
        });
        
        if (!existingSubmission) {
          console.log(`Creating new submission for problem ${platformId}`);
          // Create new submission - ENSURE user ID is set correctly
          const submission = new Submission({
            user: userId, // Use the user ID passed from the route handler
            problem: problem._id,
            platformSubmissionId: sub.id.toString(),
            status: codeforcesService.mapVerdict(sub.verdict),
            language: sub.programmingLanguage,
            code: '', // Codeforces API doesn't provide the code
            timeTaken: sub.timeConsumedMillis ? sub.timeConsumedMillis / 1000 : 0, // Convert to seconds
            memoryUsed: sub.memoryConsumedBytes ? sub.memoryConsumedBytes / 1024 : 0, // Convert to KB
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
    
    console.log(`Processed ${processedSubmissions.length} new submissions and ${processedProblems.length} new problems`);
    
    // Update platform account stats
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        const accountIndex = user.platformAccounts.findIndex(acc => 
          acc.platform === 'codeforces' && acc.username === username
        );
        
        if (accountIndex !== -1) {
          // Count total problems solved (unique accepted submissions)
          const acceptedSubmissions = await Submission.find({
            user: userId,
            platform: 'codeforces',
            status: 'accepted'
          });
          
          const uniqueProblemIds = [...new Set(acceptedSubmissions.map(sub => sub.problem.toString()))];
          
          // Count total submissions
          const totalSubmissions = await Submission.countDocuments({
            user: userId,
            platform: 'codeforces'
          });
          
          // Calculate success rate
          const successRate = totalSubmissions > 0 
            ? (acceptedSubmissions.length / totalSubmissions) * 100 
            : 0;
          
          console.log(`Updating stats for ${username}: ${uniqueProblemIds.length} problems solved, ${totalSubmissions} total submissions, ${successRate.toFixed(1)}% success rate`);
          
          // Update stats
          user.platformAccounts[accountIndex].stats = {
            problemsSolved: uniqueProblemIds.length,
            totalSubmissions: totalSubmissions,
            successRate: parseFloat(successRate.toFixed(1))
          };
          
          await user.save();
        }
      }
    }
    
    return {
      problems: processedProblems,
      submissions: processedSubmissions
    };
  } catch (err) {
    console.error(`Error syncing Codeforces for ${username}:`, err.message);
    throw err;
  }
}

// Helper function for HackerRank sync
async function syncHackerRank(platformAccount) {
  // Implementation for HackerRank sync
  // ...
  return { problems: [], submissions: [] };
}

// Export the router and sync functions separately
module.exports = router;

// Export the sync functions for use in the scheduler
module.exports.syncCodeforces = syncCodeforces;
// Remove other sync functions
// module.exports.syncHackerRank = syncHackerRank;
