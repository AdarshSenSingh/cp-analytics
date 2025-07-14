import axios from 'axios';

export async function getAIResponse(prompt, options = {}) {
  const res = await axios.post('/api/ai/generate', {
    prompt,
    ...options
  });
  return res.data.text;
}
