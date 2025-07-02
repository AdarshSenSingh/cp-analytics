const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const User = require('../models/User');

// @route   GET api/analytics/summary
// @desc    Get summary statistics for the user
// @access  Private
router.get('/summary', auth, async (req, res) => {
  try {
    // Extract query parameters
    const { startDate, endDate, platform } = req.query;
    
    // Build query object
    const query = { user: req.user.id };
    
    // Add date range filter if provided
    if (startDate && endDate) {
      query.submittedAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + 'T23:59:59.999Z')
      };
    }
    
    // Add platform filter if provided
    if (platform) {
      query.platform = platform.toLowerCase();
    }
    
    // Get all submissions by the user with filters
    const submissions = await Submission.find(query).populate('problem');
    
    // Get all accepted submissions
    const acceptedSubmissions = submissions.filter(sub => sub.status === 'accepted');
    
    // Get unique solved problem IDs
    const solvedProblemIds = [...new Set(acceptedSubmissions.map(sub => sub.problem?._id.toString()))];
    
    // Count submissions by status
    const submissionsByStatus = {};
    submissions.forEach(sub => {
      if (!submissionsByStatus[sub.status]) {
        submissionsByStatus[sub.status] = 0;
      }
      submissionsByStatus[sub.status] += 1;
    });
    
    // Count problems by difficulty
    const problemsByDifficulty = {};
    acceptedSubmissions.forEach(sub => {
      if (sub.problem && sub.problem.difficulty) {
        if (!problemsByDifficulty[sub.problem.difficulty]) {
          problemsByDifficulty[sub.problem.difficulty] = 0;
        }
        problemsByDifficulty[sub.problem.difficulty] += 1;
      }
    });
    
    // Count problems by platform
    const problemsByPlatform = {};
    acceptedSubmissions.forEach(sub => {
      if (sub.platform) {
        if (!problemsByPlatform[sub.platform]) {
          problemsByPlatform[sub.platform] = 0;
        }
        problemsByPlatform[sub.platform] += 1;
      }
    });
    
    // Count problems by topic
    const problemsByTopic = {};
    acceptedSubmissions.forEach(sub => {
      if (sub.problem && sub.problem.topics) {
        sub.problem.topics.forEach(topic => {
          if (!problemsByTopic[topic]) {
            problemsByTopic[topic] = 0;
          }
          problemsByTopic[topic] += 1;
        });
      }
    });
    
    // Calculate success rate
    const successRate = submissions.length > 0 
      ? (acceptedSubmissions.length / submissions.length) * 100 
      : 0;
    
    // If platform is Codeforces, try to get real data from Codeforces API
    if (platform && platform.toLowerCase() === 'codeforces') {
      // Get user's Codeforces account
      const user = await User.findById(req.user.id);
      const codeforcesAccount = user.platformAccounts.find(acc => acc.platform === 'codeforces');
      
      if (codeforcesAccount && codeforcesAccount.username) {
        // Try to get actual Codeforces stats
        const codeforcesService = require('../services/codeforces');
        
        try {
          // Get submissions with date filtering
          const codeforcesSubmissions = await codeforcesService.getUserSubmissions(
            codeforcesAccount.username, 
            100, // Limit to last 100 submissions
            startDate ? new Date(startDate) : null,
            endDate ? new Date(endDate + 'T23:59:59.999Z') : null
          );
          
          if (codeforcesSubmissions && codeforcesSubmissions.length > 0) {
            // Process Codeforces submissions to get real stats
            const cfAcceptedSubmissions = codeforcesSubmissions.filter(
              sub => sub.verdict === 'OK'
            );
            
            // Get unique solved problem IDs from Codeforces
            const cfSolvedProblems = [...new Set(
              cfAcceptedSubmissions.map(sub => `${sub.problem.contestId}${sub.problem.index}`)
            )];
            
            // Count problems by difficulty from Codeforces
            const cfProblemsByDifficulty = {
              easy: 0,
              medium: 0,
              hard: 0
            };
            
            cfAcceptedSubmissions.forEach(sub => {
              const difficulty = codeforcesService.mapDifficulty(sub.problem.rating);
              if (difficulty) {
                cfProblemsByDifficulty[difficulty] += 1;
              }
            });
            
            // Count problems by topic from Codeforces
            const cfProblemsByTopic = {};
            cfAcceptedSubmissions.forEach(sub => {
              if (sub.problem.tags) {
                sub.problem.tags.forEach(tag => {
                  if (!cfProblemsByTopic[tag]) {
                    cfProblemsByTopic[tag] = 0;
                  }
                  cfProblemsByTopic[tag] += 1;
                });
              }
            });
            
            // Calculate success rate from Codeforces
            const cfSuccessRate = codeforcesSubmissions.length > 0 
              ? (cfAcceptedSubmissions.length / codeforcesSubmissions.length) * 100 
              : 0;
            
            // Return real Codeforces data
            return res.json({
              totalSubmissions: codeforcesSubmissions.length,
              totalSolvedProblems: cfSolvedProblems.length,
              submissionsByStatus: {
                accepted: cfAcceptedSubmissions.length,
                rejected: codeforcesSubmissions.length - cfAcceptedSubmissions.length
              },
              problemsByDifficulty: cfProblemsByDifficulty,
              problemsByPlatform: { codeforces: cfSolvedProblems.length },
              problemsByTopic: cfProblemsByTopic,
              successRate: cfSuccessRate
            });
          }
        } catch (cfErr) {
          console.error('Error fetching Codeforces data:', cfErr);
          // Continue with local data if Codeforces API fails
        }
      }
    }
    
    // Return local data if we couldn't get real Codeforces data
    res.json({
      totalSubmissions: submissions.length,
      totalSolvedProblems: solvedProblemIds.length,
      submissionsByStatus,
      problemsByDifficulty,
      problemsByPlatform,
      problemsByTopic,
      successRate
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/analytics/activity
// @desc    Get user activity over time
// @access  Private
router.get('/activity', auth, async (req, res) => {
  try {
    // Extract query parameters
    const { startDate, endDate, platform } = req.query;
    
    // Build query object
    const query = { user: req.user.id };
    
    // Add date range filter if provided
    if (startDate && endDate) {
      query.submittedAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + 'T23:59:59.999Z')
      };
    }
    
    // Add platform filter if provided
    if (platform) {
      query.platform = platform.toLowerCase();
    }
    
    // Get all submissions by the user with filters
    const submissions = await Submission.find(query)
      .select('submittedAt status')
      .sort({ submittedAt: 1 });
    
    // Group submissions by day
    const activityByDay = {};
    submissions.forEach(sub => {
      const date = new Date(sub.submittedAt).toISOString().split('T')[0];
      if (!activityByDay[date]) {
        activityByDay[date] = {
          total: 0,
          accepted: 0
        };
      }
      activityByDay[date].total += 1;
      if (sub.status === 'accepted') {
        activityByDay[date].accepted += 1;
      }
    });
    
    // Convert to array format for easier consumption by frontend
    const activityData = Object.keys(activityByDay).map(date => ({
      date,
      total: activityByDay[date].total,
      accepted: activityByDay[date].accepted
    }));
    
    res.json(activityData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/analytics/topics
// @desc    Get topic mastery analysis (only perfect submissions)
// @access  Private
router.get('/topics', auth, async (req, res) => {
  try {
    // Extract query parameters
    const { startDate, endDate, platform } = req.query;
    
    // Build query object
    const query = { 
      user: req.user.id,
      status: 'accepted'
    };
    
    // Add date range filter if provided
    if (startDate && endDate) {
      query.submittedAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + 'T23:59:59.999Z')
      };
    }
    
    // Add platform filter if provided
    if (platform) {
      query.platform = platform.toLowerCase();
    }
    
    // Get all accepted submissions by the user with filters
    const acceptedSubmissions = await Submission.find(query).populate('problem');
    
    // Get all problems
    const problemIds = acceptedSubmissions.map(sub => sub.problem?._id.toString());
    
    // Find problems with no failed submissions (perfect solves)
    const perfectProblems = [];
    
    for (const problemId of [...new Set(problemIds)]) {
      if (!problemId) continue;
      
      // Count failed submissions for this problem
      const failedCount = await Submission.countDocuments({
        user: req.user.id,
        problem: problemId,
        status: { $ne: 'accepted' }
      });
      
      // If no failed submissions, add to perfect problems
      if (failedCount === 0) {
        const submission = acceptedSubmissions.find(sub => 
          sub.problem && sub.problem._id.toString() === problemId
        );
        
        if (submission) {
          perfectProblems.push(submission);
        }
      }
    }
    
    // Get all topics from perfectly solved problems
    const topicData = {};
    perfectProblems.forEach(sub => {
      const problem = sub.problem;
      if (problem && problem.topics) {
        problem.topics.forEach(topic => {
          if (!topicData[topic]) {
            topicData[topic] = {
              count: 0,
              difficulties: {
                easy: 0,
                medium: 0,
                hard: 0,
                unknown: 0
              },
              lastSolved: null
            };
          }
          topicData[topic].count += 1;
          if (problem.difficulty) {
            topicData[topic].difficulties[problem.difficulty] += 1;
          } else {
            topicData[topic].difficulties.unknown += 1;
          }
          
          // Update last solved date if newer
          const submittedAt = new Date(sub.submittedAt);
          if (!topicData[topic].lastSolved || submittedAt > new Date(topicData[topic].lastSolved)) {
            topicData[topic].lastSolved = sub.submittedAt;
          }
        });
      }
    });
    
    // Convert to array format for easier consumption by frontend
    const topicsAnalysis = Object.keys(topicData).map(topic => ({
      topic,
      count: topicData[topic].count,
      difficulties: topicData[topic].difficulties,
      lastSolved: topicData[topic].lastSolved
    }));
    
    // Sort by count (descending)
    topicsAnalysis.sort((a, b) => b.count - a.count);
    
    res.json(topicsAnalysis);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/analytics/recommendations
// @desc    Get personalized problem recommendations
// @access  Private
router.get('/recommendations', auth, async (req, res) => {
  try {
    // Get all problems solved by the user
    const solvedSubmissions = await Submission.find({
      user: req.user.id,
      status: 'accepted'
    }).select('problem');
    
    const solvedProblemIds = solvedSubmissions.map(sub => sub.problem);
    
    // Get user's preferences
    const user = await User.findById(req.user.id).select('preferences');
    const preferredDifficulty = user.preferences.preferredDifficulty;
    const preferredTopics = user.preferences.preferredTopics;
    
    // Build query for recommendations
    const query = {
      _id: { $nin: solvedProblemIds }
    };
    
    // Filter by difficulty if not 'all'
    if (preferredDifficulty !== 'all') {
      query.difficulty = preferredDifficulty;
    }
    
    // Filter by topics if specified
    if (preferredTopics && preferredTopics.length > 0) {
      query.topics = { $in: preferredTopics };
    }
    
    // Get recommendations
    const recommendations = await Problem.find(query)
      .limit(10)
      .sort({ acceptanceRate: -1 });
    
    res.json(recommendations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/analytics/topics-mistakes
// @desc    Get topics with most mistakes in decreasing order
// @access  Private
router.get('/topics-mistakes', auth, async (req, res) => {
  try {
    // Extract query parameters
    const { startDate, endDate, platform } = req.query;
    
    // Build query object for failed submissions
    const query = { 
      user: req.user.id,
      status: { $ne: 'accepted' } // Only get non-accepted submissions
    };
    
    // Add date range filter if provided
    if (startDate && endDate) {
      query.submittedAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + 'T23:59:59.999Z')
      };
    }
    
    // Add platform filter if provided
    if (platform) {
      query.platform = platform.toLowerCase();
    }
    
    // Get all failed submissions by the user with filters
    const failedSubmissions = await Submission.find(query).populate('problem');
    
    // Count mistakes by topic
    const topicMistakes = {};
    const problemsByTopic = {};
    
    failedSubmissions.forEach(sub => {
      const problem = sub.problem;
      if (problem && problem.topics) {
        problem.topics.forEach(topic => {
          if (!topicMistakes[topic]) {
            topicMistakes[topic] = 0;
            problemsByTopic[topic] = [];
          }
          
          topicMistakes[topic] += 1;
          
          // Add problem to the list if not already there
          const problemExists = problemsByTopic[topic].some(p => 
            p.id === problem._id.toString()
          );
          
          if (!problemExists) {
            problemsByTopic[topic].push({
              id: problem._id.toString(),
              title: problem.title,
              url: problem.url,
              difficulty: problem.difficulty
            });
          }
        });
      }
    });
    
    // Convert to array format for easier consumption by frontend
    const topicsMistakesAnalysis = Object.keys(topicMistakes).map(topic => ({
      topic,
      mistakeCount: topicMistakes[topic],
      problems: problemsByTopic[topic].slice(0, 5) // Show up to 5 problems per topic
    }));
    
    // Sort by mistake count (descending)
    topicsMistakesAnalysis.sort((a, b) => b.mistakeCount - a.mistakeCount);
    
    res.json(topicsMistakesAnalysis);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;


