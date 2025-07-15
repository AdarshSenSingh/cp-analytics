const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const User = require('../models/User');

// @route   GET api/submissions
// @desc    Get user submissions with optional filtering
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { 
      status, 
      platform, 
      startDate, 
      endDate, 
      sort, 
      page = 1, 
      limit = 10,
      populate
    } = req.query;
    
    // Build query object
    const query = { user: req.user.id };
    console.log('[GET /api/submissions] User:', req.user.id, 'Query:', query);
      // Extra debug: count all submissions and print a few
      const allSubmissions = await Submission.find({});
      console.log(`[DEBUG] Total submissions in DB: `);
      if (allSubmissions.length > 0) {
        console.log('[DEBUG] Example submission user IDs:', allSubmissions.slice(0, 3).map(s => s.user));
      }
    
    // Add filters if provided
    if (status) query.status = status;
    
    // Fix platform filtering - ensure exact match
    if (platform) {
      console.log('Filtering by platform:', platform);
      query.platform = platform.toLowerCase();
    }
    
    if (startDate) query.submittedAt = { $gte: new Date(startDate) };
    if (endDate) {
      if (!query.submittedAt) query.submittedAt = {};
      query.submittedAt.$lte = new Date(endDate);
    }
    
    console.log('Query:', JSON.stringify(query));
    
    // Build the base query
    let submissionsQuery = Submission.find(query);
    
    // Always populate problem for consistency
    submissionsQuery = submissionsQuery.populate('problem');
    
    // Add sorting
    if (sort) {
      submissionsQuery = submissionsQuery.sort(sort);
    } else {
      submissionsQuery = submissionsQuery.sort('-submittedAt');
    }
    
    // Add pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    
    submissionsQuery = submissionsQuery.skip(skip).limit(limitNum);
    
    // Execute query
    const submissions = await submissionsQuery.exec();
    console.log('[GET /api/submissions] Submissions found:', submissions.length);
    
    // Log the submissions for debugging
    if (submissions.length > 0) {
      console.log(`Found ${submissions.length} submissions`);
      console.log('First submission:', JSON.stringify(submissions[0], null, 2));
      submissions.forEach((sub, i) => {
        console.log(`Submission ${i+1}: platform=${sub.platform}, problem=${sub.problem ? sub.problem.title : 'null'}`);
      });
    } else {
      console.log('No submissions found for query');
    }
    
    // Get total count for pagination
    const total = await Submission.countDocuments(query);
    
    const responseData = {
      submissions,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      totalSubmissions: total
    };
    console.log('[API /api/submissions] Returning:', JSON.stringify(responseData, null, 2));
    res.json(responseData);
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
    const submission = await Submission.findById(req.params.id).populate('problem');
    
    if (!submission) {
      return res.status(404).json({ msg: 'Submission not found' });
    }
    
    // Check if the submission belongs to the current user
    // Convert both to strings for proper comparison
    const submissionUserId = submission.user.toString();
    const currentUserId = req.user.id.toString();
    
    console.log(`Comparing submission user: ${submissionUserId} with current user: ${currentUserId}`);
    
    if (submissionUserId !== currentUserId) {
      return res.status(401).json({ msg: 'Not authorized to view this submission' });
    }
    
    res.json(submission);
  } catch (err) {
    console.error('Error in GET /api/submissions/:id:', err.message);
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

    // Prune old submissions if user has more than 100
    const userSubmissionCount = await Submission.countDocuments({ user: req.user.id });
    if (userSubmissionCount >= 100) {
      // Find and delete the oldest submissions (keep 99, add this one as 100)
      const oldest = await Submission.find({ user: req.user.id }).sort({ submittedAt: 1 }).limit(userSubmissionCount - 99);
      const idsToDelete = oldest.map(s => s._id);
      if (idsToDelete.length > 0) {
        await Submission.deleteMany({ _id: { $in: idsToDelete } });
      }
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
    }); submission = await newSubmission.save();
    
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











