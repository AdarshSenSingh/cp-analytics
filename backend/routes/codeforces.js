const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');

// @route   POST /api/codeforces/code
// @desc    Fetch and scrape code from Codeforces submission
// @access  Public (or add auth if you want)
router.post('/code', async (req, res) => {
  console.log('[Codeforces API] Incoming body:', req.body);
  const { handle, contestId, submissionId } = req.body;
  if (!contestId || !submissionId) {
    return res.status(400).json({ error: 'contestId and submissionId are required' });
  }
  try {
    const url = `https://codeforces.com/contest/${contestId}/submission/${submissionId}`;
    const response = await axios.get(url, {
      headers: {
        'Accept': 'text/html',
        'User-Agent': 'Mozilla/5.0 (compatible; CodeFetcherBot/1.0)'
      }
    });
    const html = response.data;
    // Use cheerio to parse HTML
    const $ = cheerio.load(html);
    const code = $('#program-source-text').text();
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
