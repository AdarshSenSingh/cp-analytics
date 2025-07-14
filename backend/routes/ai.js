const express = require('express');
const router = express.Router();
const axios = require('axios');

const COHERE_API_KEY = process.env.COHERE_API_KEY; // Store your key in .env

router.post('/generate', async (req, res) => {
  const { prompt, max_tokens = 300, temperature = 0.7 } = req.body;
  try {
    const response = await axios.post(
      'https://api.cohere.ai/v1/generate',
      {
        prompt,
        model: 'command-r-plus',
        max_tokens,
        temperature
      },
      {
        headers: {
          Authorization: `Bearer ${COHERE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    res.json({ text: response.data.generations[0].text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
