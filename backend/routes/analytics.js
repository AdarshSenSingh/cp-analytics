const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const User = require('../models/User');

// @route   GET api/analytics/summary
// @desc    Get summary statistics
// @access  Private
router.get('/summary', auth, async (req, res) => {
  try {
    // Extract query parameters
    const { startDate, endDate, platform } = req.query;
    
    // Build query object
    const query = { 
      user: req.user.id 
    };
    console.log('[GET /api/analytics/summary] User:', req.user.id, 'Query:', query);
    
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
    console.log('[GET /api/analytics/summary] Submissions found:', submissions.length);
    
    // Get all accepted submissions
    const acceptedSubmissions = submissions.filter(sub => sub.status === 'accepted');
    
    // Get unique solved problem IDs
    const solvedProblemIds = [...new Set(acceptedSubmissions.map(sub => sub.problem?._id.toString()).filter(Boolean))];
    
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
    
    // Calculate first attempt success rate and average attempts per problem
    const problemAttempts = {};
    const firstAttemptSuccesses = {};
    
    // Sort submissions by date (ascending)
    const sortedSubmissions = [...submissions].sort((a, b) => 
      new Date(a.submittedAt) - new Date(b.submittedAt)
    );
    
    // Process submissions to count attempts per problem
    sortedSubmissions.forEach(sub => {
      if (!sub.problem) return;
      
      const problemId = sub.problem._id.toString();
      
      if (!problemAttempts[problemId]) {
        problemAttempts[problemId] = 0;
        
        // If first attempt is successful
        if (sub.status === 'accepted') {
          firstAttemptSuccesses[problemId] = true;
        }
      }
      
      problemAttempts[problemId]++;
    });
    
    // Calculate first attempt success rate
    const totalProblemsAttempted = Object.keys(problemAttempts).length;
    const firstAttemptSuccessCount = Object.keys(firstAttemptSuccesses).length;
    const firstAttemptSuccessRate = totalProblemsAttempted > 0 
      ? (firstAttemptSuccessCount / totalProblemsAttempted) * 100 
      : 0;
    
    // Calculate average attempts per problem
    const totalAttempts = Object.values(problemAttempts).reduce((sum, count) => sum + count, 0);
    const averageAttemptsPerProblem = totalProblemsAttempted > 0 
      ? totalAttempts / totalProblemsAttempted 
      : 0;
    
    // Return the data
    res.json({
      totalSubmissions: submissions.length,
      totalSolvedProblems: solvedProblemIds.length,
      submissionsByStatus,
      problemsByDifficulty,
      problemsByPlatform,
      problemsByTopic,
      successRate: parseFloat(successRate.toFixed(2)),
      firstAttemptSuccessRate: parseFloat(firstAttemptSuccessRate.toFixed(2)),
      averageAttemptsPerProblem: parseFloat(averageAttemptsPerProblem.toFixed(2))
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
    console.log('[GET /api/analytics/activity] User:', req.user.id, 'Query:', query);
    
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
    console.log('[GET /api/analytics/activity] Submissions found:', submissions.length);
    
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
    
    console.log('[API /api/analytics/summary] Returning:', JSON.stringify(activityData, null, 2));
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
    
    console.log('[API /api/analytics/summary] Returning:', JSON.stringify(topicsAnalysis, null, 2));
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
    
    console.log('[API /api/analytics/summary] Returning:', JSON.stringify(recommendations, null, 2));
    res.json(recommendations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/analytics/topics-mistakes
// @desc    Get problems with most mistakes in decreasing order
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
    
    // Count mistakes by problem
    const problemMistakes = {};
    
    failedSubmissions.forEach(sub => {
      const problem = sub.problem;
      if (!problem) return;
      
      const problemId = problem._id.toString();
      
      if (!problemMistakes[problemId]) {
        problemMistakes[problemId] = {
          id: problemId,
          title: problem.title,
          url: problem.url,
          difficulty: problem.difficulty,
          topics: problem.topics || [],
          mistakeCount: 0
        };
      }
      
      problemMistakes[problemId].mistakeCount += 1;
    });
    
    // Convert to array format for easier consumption by frontend
    const problemsMistakesAnalysis = Object.values(problemMistakes);
    
    // Sort by mistake count (descending)
    problemsMistakesAnalysis.sort((a, b) => b.mistakeCount - a.mistakeCount);
    
    console.log('[API /api/analytics/summary] Returning:', JSON.stringify(problemsMistakesAnalysis, null, 2));
    res.json(problemsMistakesAnalysis);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/analytics/ratings
// @desc    Get problems solved by rating
// @access  Private
router.get('/ratings', auth, async (req, res) => {
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
    
    // Get unique solved problems
    const uniqueProblems = {};
    acceptedSubmissions.forEach(sub => {
      if (sub.problem) {
        uniqueProblems[sub.problem._id.toString()] = sub.problem;
      }
    });
    
    // Count problems by rating
    const ratingRanges = {
      '800-1000': 0,
      '1000-1200': 0,
      '1200-1400': 0,
      '1400-1600': 0,
      '1600-1800': 0,
      '1800-2000': 0,
      '2000-2200': 0,
      '2200-2400': 0,
      '2400-2600': 0,
      '2600-2800': 0,
      '2800-3000': 0,
      '3000-3200': 0,
      '3200-3500': 0,
      'unknown': 0
    };
    
    Object.values(uniqueProblems).forEach(problem => {
      if (!problem.rating) {
        ratingRanges.unknown += 1;
        return;
      }
      
      const rating = parseInt(problem.rating);
      
      if (rating >= 800 && rating < 1000) ratingRanges['800-1000'] += 1;
      else if (rating >= 1000 && rating < 1200) ratingRanges['1000-1200'] += 1;
      else if (rating >= 1200 && rating < 1400) ratingRanges['1200-1400'] += 1;
      else if (rating >= 1400 && rating < 1600) ratingRanges['1400-1600'] += 1;
      else if (rating >= 1600 && rating < 1800) ratingRanges['1600-1800'] += 1;
      else if (rating >= 1800 && rating < 2000) ratingRanges['1800-2000'] += 1;
      else if (rating >= 2000 && rating < 2200) ratingRanges['2000-2200'] += 1;
      else if (rating >= 2200 && rating < 2400) ratingRanges['2200-2400'] += 1;
      else if (rating >= 2400 && rating < 2600) ratingRanges['2400-2600'] += 1;
      else if (rating >= 2600 && rating < 2800) ratingRanges['2600-2800'] += 1;
      else if (rating >= 2800 && rating < 3000) ratingRanges['2800-3000'] += 1;
      else if (rating >= 3000 && rating < 3200) ratingRanges['3000-3200'] += 1;
      else if (rating >= 3200 && rating <= 3500) ratingRanges['3200-3500'] += 1;
      else ratingRanges.unknown += 1;
    });
    
    console.log('[API /api/analytics/summary] Returning:', JSON.stringify(ratingRanges, null, 2));
    res.json(ratingRanges);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;


