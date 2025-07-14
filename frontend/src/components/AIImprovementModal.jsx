import React, { useState } from 'react';
import { getAIResponse } from '../services/ai';

export default function AIImprovementModal({ open, onClose }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    platform: 'codeforces',
    currentRating: '',
    targetRating: '',
    days: '14',
    hoursPerDay: '1',
  });
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAIResponse] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setAIResponse('');
    try {
      const prompt = `Give me a ${form.days}-day roadmap to reach ${form.targetRating} rating on ${form.platform}. My current rating is ${form.currentRating}. I can study ${form.hoursPerDay} hours per day. Give actionable steps, resources, and tips.`;
      const response = await getAIResponse(prompt, { max_tokens: 400 });
      setAIResponse(response);
      setStep(2);
    } catch (err) {
      setError('Failed to get AI response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4 text-indigo-700">AI Roadmap to Improve Rating</h2>
        {step === 0 && (
          <button
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
            onClick={() => setStep(1)}
          >
            Start Guidance
          </button>
        )}
        {step === 1 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Platform</label>
              <select name="platform" value={form.platform} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md">
                <option value="codeforces">Codeforces</option>
                <option value="atcoder">AtCoder</option>
                <option value="leetcode">LeetCode</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Rating</label>
              <input name="currentRating" type="number" value={form.currentRating} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Target Rating</label>
              <input name="targetRating" type="number" value={form.targetRating} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Days to Achieve</label>
              <input name="days" type="number" value={form.days} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Hours per Day</label>
              <input name="hoursPerDay" type="number" value={form.hoursPerDay} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md" />
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700" disabled={loading}>
              {loading ? 'Generating...' : 'Get My Roadmap'}
            </button>
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          </form>
        )}
        {step === 2 && (
          <div>
            <h3 className="text-lg font-semibold mb-2 text-indigo-600">Your Personalized Roadmap</h3>
            <pre className="bg-gray-100 p-3 rounded text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">{aiResponse}</pre>
            <button className="mt-4 w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700" onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}
