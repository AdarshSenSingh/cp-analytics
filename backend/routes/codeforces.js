const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');

// @route   POST /api/codeforces/code
// @desc    Fetch and scrape code from Codeforces submission using Puppeteer (headless browser)
// @access  Public (or add auth if you want)
const fetchCodeforcesCode = require('../services/fetchCodeforcesCode');

router.post('/code', async (req, res) => {
  console.log('[Codeforces API] Incoming body:', req.body);
  const { url, username, password } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'submission url is required' });
  }
  try {
    const code = await fetchCodeforcesCode(url, username, password);
    if (!code) {
      return res.status(404).json({ error: 'Could not extract code from Codeforces submission page.' });
    }
    res.json({ code });
  } catch (err) {
    console.error('[Codeforces Fetch] Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch code from Codeforces.' });
  }
});

module.exports = router;
