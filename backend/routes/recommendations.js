const express = require('express');
const router = express.Router();

// Dummy recommendations - replace with real logic as needed
router.get('/', async (req, res) => {
  res.json({
    recommendations: [
      {
        _id: 'cses-1083',
        title: 'Missing Number',
        url: 'https://cses.fi/problemset/task/1083/',
        platform: 'cses',
        difficulty: 'easy'
      },
      {
        _id: 'cses-1068',
        title: 'Weird Algorithm',
        url: 'https://cses.fi/problemset/task/1068/',
        platform: 'cses',
        difficulty: 'easy'
      }
    ]
  });
});

module.exports = router;
