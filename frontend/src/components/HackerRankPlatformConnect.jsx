import { useState } from 'react';
import { platformsAPI } from '../services/api';

const HackerRankPlatformConnect = ({ onConnect, onError }) => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await platformsAPI.connectPlatform({
        platform: 'hackerrank',
        username: username.trim()
      });
      
      if (response.data && response.data.success) {
        try {
          await platformsAPI.syncPlatform('hackerrank');
        } catch (syncErr) {
          console.error('Sync error:', syncErr);
        }
      }
      
      setIsLoading(false);
      onConnect && onConnect(response.data);
    } catch (err) {
      console.error('Connection error:', err);
      setIsLoading(false);
      const errorMessage = err.response?.data?.msg || 'Failed to connect to HackerRank';
      setError(errorMessage);
      onError && onError(errorMessage);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Connect to HackerRank</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            HackerRank Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter your HackerRank username"
            disabled={isLoading}
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Connecting...' : 'Connect & Sync'}
        </button>
      </form>
      
      <div className="mt-4 text-sm text-gray-500">
        <p>This will:</p>
        <ul className="list-disc pl-5 mt-2">
          <li>Connect your HackerRank account</li>
          <li>Import your solved problems</li>
          <li>Track your submissions</li>
        </ul>
      </div>
    </div>
  );
};

export default HackerRankPlatformConnect;