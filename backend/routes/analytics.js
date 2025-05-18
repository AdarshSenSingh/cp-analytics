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
    // Get all submissions by the user
    const submissions = await Submission.find({ user: req.user.id });
    
    // Get all accepted submissions
    const acceptedSubmissions = submissions.filter(sub => sub.status === 'accepted');
    
    // Get unique solved problems
    const solvedProblemIds = [...new Set(acceptedSubmissions.map(sub => sub.problem.toString()))];
    
    // Count submissions by status
    const submissionsByStatus = submissions.reduce((acc, sub) => {
      acc[sub.status] = (acc[sub.status] || 0) + 1;
      return acc;
    }, {});
    
    // Get all problems solved by the user
    const solvedProblems = await Problem.find({ _id: { $in: solvedProblemIds } });
    
    // Count problems by difficulty
    const problemsByDifficulty = solvedProblems.reduce((acc, prob) => {
      acc[prob.difficulty] = (acc[prob.difficulty] || 0) + 1;
      return acc;
    }, {});
    
    // Count problems by platform
    const problemsByPlatform = solvedProblems.reduce((acc, prob) => {
      acc[prob.platform] = (acc[prob.platform] || 0) + 1;
      return acc;
    }, {});
    
    // Count problems by topic
    const problemsByTopic = {};
    solvedProblems.forEach(prob => {
      prob.topics.forEach(topic => {
        problemsByTopic[topic] = (problemsByTopic[topic] || 0) + 1;
      });
    });
    
    // Calculate success rate
    const successRate = submissions.length > 0 
      ? (acceptedSubmissions.length / submissions.length) * 100 
      : 0;
    
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
    // Get all submissions by the user
    const submissions = await Submission.find({ user: req.user.id })
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
// @desc    Get topic mastery analysis
// @access  Private
router.get('/topics', auth, async (req, res) => {
  try {
    // Get all accepted submissions by the user
    const acceptedSubmissions = await Submission.find({
      user: req.user.id,
      status: 'accepted'
    }).populate('problem');
    
    // Get all topics from solved problems
    const topicData = {};
    acceptedSubmissions.forEach(sub => {
      const problem = sub.problem;
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
        topicData[topic].difficulties[problem.difficulty] += 1;
        
        // Update last solved date if newer
        const submittedAt = new Date(sub.submittedAt);
        if (!topicData[topic].lastSolved || submittedAt > new Date(topicData[topic].lastSolved)) {
          topicData[topic].lastSolved = sub.submittedAt;
        }
      });
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

module.exports = router;

