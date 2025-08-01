const express = require('express');
const router = express.Router();
const Target = require('../models/Target');

// POST /api/targets
router.post('/', async (req, res) => {
  try {
    const { email, targetType, problemsPerDay, contestTime } = req.body;
    if (targetType === 'problems' && !problemsPerDay) {
      return res.status(400).json({ error: 'problemsPerDay is required for problems target' });
    }
    if (targetType === 'contest' && !contestTime) {
      return res.status(400).json({ error: 'contestTime is required for contest target' });
    }
    const target = new Target({ email, targetType, problemsPerDay, contestTime });
    await target.save();
    res.status(201).json({ message: 'Target saved' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save target' });
  }
});

module.exports = router;
