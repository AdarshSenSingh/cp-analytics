const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const User = require('../models/User');

// @route   GET api/submissions
// @desc    Get all submissions for the current user with filtering and pagination
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const populate = req.query.populate === 'problem';
    
    // Build query
    let query = { user: req.user.id };
    
    // Add filters if provided
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    if (req.query.platform) {
      query.platform = req.query.platform;
    }
    
    if (req.query.startDate) {
      query.submittedAt = { $gte: new Date(req.query.startDate) };
    }
    
    // Build the base query
    let submissionsQuery = Submission.find(query);
    
    // Add population if requested
    if (populate) {
      submissionsQuery = submissionsQuery.populate('problem');
    }
    
    // Add sorting
    const sortField = req.query.sort || '-submittedAt';
    submissionsQuery = submissionsQuery.sort(sortField);
    
    // Get total count for pagination
    const totalCount = await Submission.countDocuments(query);
    
    // Add pagination
    submissionsQuery = submissionsQuery.skip(skip).limit(limit);
    
    const submissions = await submissionsQuery;
    
    // Log for debugging
    console.log(`Found ${submissions.length} submissions for user ${req.user.id} (page ${page}, limit ${limit})`);
    if (submissions.length > 0) {
      console.log('Platforms represented:', [...new Set(submissions.map(s => s.platform || s.problem.platform))]);
    }
    
    // Return with pagination info
    res.json({
      submissions,
      totalItems: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page
    });
  } catch (err) {
    console.error('Error fetching submissions:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/submissions/:id
// @desc    Get submission by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('problem');
    
    if (!submission) {
      return res.status(404).json({ msg: 'Submission not found' });
    }
    
    // Check if the submission belongs to the user
    if (submission.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    res.json(submission);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Submission not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/submissions
// @desc    Create a submission
// @access  Private
router.post('/', [
  auth,
  [
    check('problem', 'Problem ID is required').not().isEmpty(),
    check('status', 'Status is required').not().isEmpty(),
    check('language', 'Language is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Check if problem exists
    const problem = await Problem.findById(req.body.problem);
    if (!problem) {
      return res.status(404).json({ msg: 'Problem not found' });
    }

    // Create new submission
    const newSubmission = new Submission({
      user: req.user.id,
      problem: req.body.problem,
      platformSubmissionId: req.body.platformSubmissionId,
      status: req.body.status,
      language: req.body.language,
      code: req.body.code,
      timeTaken: req.body.timeTaken,
      memoryUsed: req.body.memoryUsed,
      runtimePercentile: req.body.runtimePercentile,
      memoryPercentile: req.body.memoryPercentile,
      timeComplexity: req.body.timeComplexity,
      spaceComplexity: req.body.spaceComplexity,
      notes: req.body.notes,
      aiAnalysis: req.body.aiAnalysis,
      submittedAt: req.body.submittedAt || Date.now()
    });

    const submission = await newSubmission.save();
    
    // If submission is accepted, update user points
    if (req.body.status === 'accepted') {
      await User.findByIdAndUpdate(req.user.id, { $inc: { points: 10 } });
    }
    
    res.json(submission);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/submissions/:id
// @desc    Update a submission
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    let submission = await Submission.findById(req.params.id);
    
    if (!submission) {
      return res.status(404).json({ msg: 'Submission not found' });
    }
    
    // Check if the submission belongs to the user
    if (submission.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    // Update fields
    const updateFields = {};
    if (req.body.notes) updateFields.notes = req.body.notes;
    if (req.body.timeComplexity) updateFields.timeComplexity = req.body.timeComplexity;
    if (req.body.spaceComplexity) updateFields.spaceComplexity = req.body.spaceComplexity;
    if (req.body.aiAnalysis) updateFields.aiAnalysis = req.body.aiAnalysis;
    
    submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );
    
    res.json(submission);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Submission not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/submissions/problem/:problemId
// @desc    Get all submissions for a specific problem by the current user
// @access  Private
router.get('/problem/:problemId', auth, async (req, res) => {
  try {
    const submissions = await Submission.find({
      user: req.user.id,
      problem: req.params.problemId
    }).sort({ submittedAt: -1 });
    
    res.json(submissions);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Problem not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;





