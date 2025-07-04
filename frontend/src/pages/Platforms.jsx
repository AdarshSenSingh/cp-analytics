import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Platforms = () => {
  const [platforms, setPlatforms] = useState([
    { id: 'codeforces', name: 'Codeforces', connected: false, username: '' }
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    username: ''
  });
  const [syncStatus, setSyncStatus] = useState({});

  useEffect(() => {
    fetchConnectedPlatforms();
  }, []);

  const fetchConnectedPlatforms = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // The backend route is /api/platforms/accounts according to backend/routes/platforms.js
      const response = await axios.get('/api/platforms/accounts', {
        headers: { 'x-auth-token': token }
      });
      
      // Update platforms with connection status
      const connectedPlatforms = response.data.platformAccounts || [];
      setPlatforms(prev => 
        prev.map(platform => {
          const connectedPlatform = connectedPlatforms.find(p => p.platform === platform.id);
          return connectedPlatform 
            ? { ...platform, connected: true, username: connectedPlatform.username }
            : platform;
        })
      );
      
      setError(null);
    } catch (err) {
      console.error('Error fetching connected platforms:', err);
      setError('Failed to load connected platforms. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleConnect = async (platform) => {
    try {
      setLoading(true);
      
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      // Make sure we have the username for the platform
      const username = formData.username || '';
      
      if (!username.trim()) {
        alert('Please enter a username');
        setLoading(false);
        return;
      }
      
      // Make the API call with proper headers
      const response = await axios.post('/api/platforms/connect', {
        platform: 'codeforces', // Always use codeforces
        username: username.trim()
      }, {
        headers: { 'x-auth-token': token },
        timeout: 30000 // Increase timeout for Codeforces API which can be slow
      });
      
      // Refresh connected platforms
      fetchConnectedPlatforms();
      
      // Show success message
      alert(`Successfully connected to Codeforces`);
    } catch (error) {
      console.error('Error connecting platform:', error);
      const errorMsg = error.response?.data?.msg || `Failed to connect to Codeforces. Please try again.`;
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (platformId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/platforms/${platformId}`, {
        headers: { 'x-auth-token': token }
      });
      
      // Refresh connected platforms
      fetchConnectedPlatforms();
    } catch (err) {
      console.error('Error disconnecting platform:', err);
      setError('Failed to disconnect platform. Please try again later.');
    }
  };

  const handleSync = async (platformId) => {
    try {
      setSyncStatus(prev => ({ ...prev, [platformId]: 'syncing' }));
      
      const token = localStorage.getItem('token');
      await axios.post(`/api/platforms/sync/${platformId}`, {}, {
        headers: { 'x-auth-token': token }
      });
      
      setSyncStatus(prev => ({ ...prev, [platformId]: 'success' }));
      
      // Clear success status after 3 seconds
      setTimeout(() => {
        setSyncStatus(prev => {
          const newStatus = { ...prev };
          delete newStatus[platformId];
          return newStatus;
        });
      }, 3000);
    } catch (err) {
      console.error('Error syncing platform:', err);
      setSyncStatus(prev => ({ ...prev, [platformId]: 'error' }));
      
      // Clear error status after 3 seconds
      setTimeout(() => {
        setSyncStatus(prev => {
          const newStatus = { ...prev };
          delete newStatus[platformId];
          return newStatus;
        });
      }, 3000);
    }
  };

  // Add this function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    handleConnect('codeforces');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Coding Platforms</h1>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Connected Platforms */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Connected Platforms</h2>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">Loading platforms...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {platforms.filter(p => p.connected).length > 0 ? (
              platforms.filter(p => p.connected).map((platform) => (
                <div key={platform.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <img 
                          className="h-10 w-10 rounded-full" 
                          src="/images/codeforces.png" 
                          alt="Codeforces"
                          onError={(e) => {
                            // Use a data URI as fallback
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzZiNzI4MCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptMCAxOGMtNC40MSAwLTgtMy41OS04LThzMy41OS04IDgtOCA4IDMuNTkgOCA4LTMuNTkgOC04IDh6bTAtMTRjLTIuMjEgMC00IDEuNzktNCA0czEuNzkgNCA0IDQgNC0xLjc5IDQtNC0xLjc5LTQtNC00em0wIDZjLTEuMSAwLTItLjktMi0yczAuOS0yIDItMiAyIDAuOSAyIDItMC45IDItMiAyeiIvPjwvc3ZnPg==';
                          }}
                        />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">{platform.name}</h3>
                        <p className="text-sm text-gray-500">Connected as: {platform.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleSync(platform.id)}
                        disabled={syncStatus[platform.id] === 'syncing'}
                        className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md ${
                          syncStatus[platform.id] === 'syncing'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : syncStatus[platform.id] === 'success'
                            ? 'bg-green-100 text-green-800'
                            : syncStatus[platform.id] === 'error'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                        }`}
                      >
                        {syncStatus[platform.id] === 'syncing'
                          ? 'Syncing...'
                          : syncStatus[platform.id] === 'success'
                          ? 'Synced!'
                          : syncStatus[platform.id] === 'error'
                          ? 'Sync Failed'
                          : 'Sync Submissions'}
                      </button>
                      <button
                        onClick={() => handleDisconnect(platform.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-4 text-center">
                <p className="text-gray-500">No platforms connected yet.</p>
              </div>
            )}
          </div>
        )}
        </div>
        
        {/* Connect New Platform */}
        <div className="bg-white rounded-lg shadow overflow-hidden mt-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Connect New Platform</h2>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Codeforces Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="Enter your Codeforces username"
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Connect Codeforces
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Platform Benefits */}
        <div className="bg-white rounded-lg shadow overflow-hidden mt-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Benefits of Connecting Platforms</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900 text-center">Automatic Syncing</h3>
                <p className="mt-2 text-sm text-gray-500 text-center">
                  Your submissions are automatically synced from connected platforms.
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900 text-center">Unified Analytics</h3>
                <p className="mt-2 text-sm text-gray-500 text-center">
                  Get insights across all your coding platforms in one place.
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900 text-center">Smart Recommendations</h3>
                <p className="mt-2 text-sm text-gray-500 text-center">
                  Get personalized problem recommendations based on your performance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default Platforms;
