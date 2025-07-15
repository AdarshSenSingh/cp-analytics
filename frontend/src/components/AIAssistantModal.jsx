import React, { useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { getAIResponse } from '../services/ai';

const recommendedPrompts = [
  { label: 'Optimize the code', prompt: (code, problem) => `Optimize the following code for the problem "${problem}":\n${code}` },
  { label: 'Analyze complexity', prompt: (code, problem) => `Analyze the time and space complexity of the following code for the problem "${problem}":\n${code}` },
  { label: 'Correct the code', prompt: (code, problem) => `Find and correct any errors in the following code for the problem "${problem}":\n${code}` },
  { label: 'Explain the code', prompt: (code, problem) => `Explain what the following code does for the problem "${problem}":\n${code}` },
];

export default function AIAssistantModal({ open, onClose, code, language, problemTitle }) {
  const [chat, setChat] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  if (!open) return null;

  const handleSend = async (msg) => {
    setIsLoading(true);
    setLocalError('');
    setChat((prev) => [...prev, { from: 'user', text: msg }]);
    try {
      const prompt = `${msg}\n\nCode:\n${code}`;
      const response = await getAIResponse(prompt, { max_tokens: 350 });
      setChat((prev) => [...prev, { from: 'ai', text: response }]);
    } catch (err) {
      setLocalError('Failed to get AI response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrompt = (promptFn) => {
    const prompt = promptFn(code, problemTitle);
    setInput(prompt);
    handleSend(prompt);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      handleSend(input.trim());
      setInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-2 text-indigo-700">AI Assistant</h2>
        <div className="mb-4">
          <div className="mb-2 text-sm text-gray-700 font-semibold">Code for: {problemTitle}</div>
          <div className="border rounded bg-gray-900 text-white overflow-x-auto mb-2 min-h-[80px]">
            {isLoading ? (
              <div className="p-4 text-gray-300">Loading code...</div>
            ) : localError ? (
              <div className="p-4 text-red-400">{localError}</div>
            ) : (
              <SyntaxHighlighter
                language={language || 'text'}
                style={vs2015}
                customStyle={{
                  margin: 0,
                  padding: '1rem',
                  borderRadius: '0.375rem',
                  fontSize: '0.9rem',
                  lineHeight: '1.25rem',
                }}
              >
                {code || '// No code available'}
              </SyntaxHighlighter>
            )}
          </div>
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          {recommendedPrompts.map((item) => (
            <button
              key={item.label}
              className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded hover:bg-indigo-200 text-xs font-medium"
              onClick={() => handlePrompt(item.prompt)}
              disabled={isLoading}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="bg-gray-50 rounded p-3 mb-3 h-48 overflow-y-auto flex flex-col-reverse">
          {[...chat].reverse().map((msg, idx) => (
            <div key={idx} className={`mb-2 ${msg.from === 'user' ? 'text-right' : 'text-left'}`}>
              <span className={`inline-block px-3 py-2 rounded-lg ${msg.from === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-900'}`}>
                {msg.text}
              </span>
            </div>
          ))}
          {isLoading && <div className="text-gray-400 text-xs">AI is typing...</div>}
        </div>
        {localError && <div className="text-red-500 text-sm mb-2">{localError}</div>}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Ask something about this code..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            disabled={isLoading || !input.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
