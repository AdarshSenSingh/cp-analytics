const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const User = require('../models/User');

// @route   GET api/problems
// @desc    Get all problems
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const problems = await Problem.find().sort({ createdAt: -1 });
    res.json(problems);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/problems/:id
// @desc    Get problem by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    
    if (!problem) {
      return res.status(404).json({ msg: 'Problem not found' });
    }
    
    res.json(problem);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Problem not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/problems
// @desc    Create a problem
// @access  Private
router.post('/', [
  auth,
  [
    check('platformId', 'Platform ID is required').not().isEmpty(),
    check('platform', 'Platform is required').not().isEmpty(),
    check('title', 'Title is required').not().isEmpty(),
    check('url', 'URL is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Check if problem already exists
    const existingProblem = await Problem.findOne({ 
      platform: req.body.platform, 
      platformId: req.body.platformId 
    });

    if (existingProblem) {
      return res.json(existingProblem);
    }

    // Create new problem
    const newProblem = new Problem({
      platformId: req.body.platformId,
      platform: req.body.platform,
      title: req.body.title,
      url: req.body.url,
      difficulty: req.body.difficulty || 'unknown',
      topics: req.body.topics || [],
      description: req.body.description,
      acceptanceRate: req.body.acceptanceRate,
      timeLimit: req.body.timeLimit,
      memoryLimit: req.body.memoryLimit
    });

    const problem = await newProblem.save();
    res.json(problem);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/problems/user/solved
// @desc    Get all problems solved by the user
// @access  Private
router.get('/user/solved', auth, async (req, res) => {
  try {
    // Find all accepted submissions by the user
    const submissions = await Submission.find({
      user: req.user.id,
      status: 'accepted'
    }).select('problem');

    // Extract unique problem IDs
    const problemIds = [...new Set(submissions.map(sub => sub.problem))];
    
    // Find all problems with those IDs
    const problems = await Problem.find({
      _id: { $in: problemIds }
    });

    res.json(problems);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/problems/topics
// @desc    Get all unique problem topics
// @access  Private
router.get('/topics/all', auth, async (req, res) => {
  try {
    const problems = await Problem.find().select('topics');
    const allTopics = problems.flatMap(problem => problem.topics);
    const uniqueTopics = [...new Set(allTopics)].filter(topic => topic);
    
    res.json(uniqueTopics);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/problems/:id/notes
// @desc    Update notes for a problem
// @access  Private
router.put('/:id/notes', auth, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    
    if (!problem) {
      return res.status(404).json({ msg: 'Problem not found' });
    }
    
    // Initialize notes Map if it doesn't exist
    if (!problem.notes) {
      problem.notes = new Map();
    }
    
    // Update notes for this user
    problem.notes.set(req.user.id, req.body.notes);
    
    await problem.save();
    
    res.json({ 
      id: problem._id,
      notes: problem.notes.get(req.user.id) 
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Problem not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/problems/:id/notes
// @desc    Get notes for a problem
// @access  Private
router.get('/:id/notes', auth, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    
    if (!problem) {
      return res.status(404).json({ msg: 'Problem not found' });
    }
    
    const notes = problem.notes && problem.notes.get(req.user.id) || '';
    
    res.json({ 
      id: problem._id,
      notes 
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Problem not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;
