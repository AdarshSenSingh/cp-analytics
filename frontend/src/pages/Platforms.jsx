import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { platformsAPI } from '../services/api';
import CodeforcesPlatformConnect from '../components/CodeforcesPlatformConnect';
import HackerRankPlatformConnect from '../components/HackerRankPlatformConnect';
import LeetCodePlatformConnect from '../components/LeetCodePlatformConnect';

const Platforms = () => {
  const { token } = useAuth();
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConnect, setShowConnect] = useState(false);
  const [connectPlatform, setConnectPlatform] = useState('');
  const [syncStatus, setSyncStatus] = useState({});

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const fetchPlatforms = async () => {
    try {
      setLoading(true);
      const response = await platformsAPI.getAccounts();
      setPlatforms(response.data.platformAccounts || []);
      setLoading(false);
    } catch (err) {
      setError('Failed to load platform accounts');
      setLoading(false);
    }
  };

  const handleConnect = async (data) => {
    setShowConnect(false);
    setConnectPlatform('');
    await fetchPlatforms();
  };

  const handleDisconnect = async (platform) => {
    try {
      await platformsAPI.disconnectPlatform(platform);
      await fetchPlatforms();
    } catch (err) {
      setError(`Failed to disconnect ${platform}`);
    }
  };

  const handleSync = async (platform) => {
    try {
      setSyncStatus({ ...syncStatus, [platform]: 'syncing' });
      const response = await platformsAPI.syncPlatform(platform);
      setSyncStatus({ ...syncStatus, [platform]: 'success' });
      
      // Show sync results
      const { problems, submissions } = response.data.syncedData;
      alert(`Sync completed! Added ${problems.length} problems and ${submissions.length} submissions.`);
      
      // Refresh platforms data to show updated stats
      await fetchPlatforms();
    } catch (err) {
      console.error(`Sync error for ${platform}:`, err);
      setSyncStatus({ ...syncStatus, [platform]: 'error' });
      setError(`Failed to sync ${platform}: ${err.response?.data?.msg || 'Server error'}`);
      
      // Clear error after 5 seconds
      setTimeout(() => setError(''), 5000);
    }
  };

  const renderConnectForm = () => {
    console.log("Rendering connect form for platform:", connectPlatform);
    
    if (!connectPlatform) {
      // If no platform is selected, show the platform selection menu
      return (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Select Platform</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setConnectPlatform('codeforces')}
              className="p-4 border rounded-lg hover:bg-gray-50"
            >
              Codeforces
            </button>
            <button
              onClick={() => setConnectPlatform('hackerrank')}
              className="p-4 border rounded-lg hover:bg-gray-50"
            >
              HackerRank
            </button>
            <button
              onClick={() => setConnectPlatform('leetcode')}
              className="p-4 border rounded-lg hover:bg-gray-50"
            >
              LeetCode
            </button>
          </div>
        </div>
      );
    }
    
    // If a platform is selected, show the appropriate connect form
    switch(connectPlatform) {
      case 'codeforces':
        return (
          <CodeforcesPlatformConnect 
            onConnect={handleConnect} 
            onError={(msg) => setError(msg)} 
          />
        );
      case 'hackerrank':
        return (
          <HackerRankPlatformConnect 
            onConnect={handleConnect} 
            onError={(msg) => setError(msg)} 
          />
        );
      case 'leetcode':
        return (
          <LeetCodePlatformConnect 
            onConnect={handleConnect} 
            onError={(msg) => setError(msg)} 
          />
        );
      default:
        return null;
    }
  };

  const handleConnectButtonClick = () => {
    setShowConnect(!showConnect);
    if (showConnect) {
      // If we're closing the connect form, reset the platform
      setConnectPlatform('');
    } else {
      // If we're opening the connect form, default to showing the platform selection
      setConnectPlatform('');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Coding Platforms</h1>
        <button
          onClick={handleConnectButtonClick}
          className="bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700"
        >
          {showConnect ? 'Cancel' : 'Connect Platform'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showConnect && (
        <div className="mb-8">
          {renderConnectForm()}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading platforms...</div>
      ) : platforms.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium text-gray-700 mb-2">No platforms connected</h3>
          <p className="text-gray-500 mb-4">
            Connect to coding platforms to automatically track your progress
          </p>
          <button
            onClick={() => setShowConnect(true)}
            className="bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700"
          >
            Connect Your First Platform
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {platforms.map((platform) => (
            <div key={platform.platform} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium capitalize">{platform.platform}</h2>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Connected
                  </span>
                </div>
              </div>
              
              <div className="px-6 py-4">
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Username</p>
                  <p className="font-medium">{platform.username}</p>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Last Synced</p>
                  <p className="font-medium">
                    {platform.lastSynced 
                      ? new Date(platform.lastSynced).toLocaleString() 
                      : 'Never'}
                  </p>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleSync(platform.platform)}
                    className={`flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                      ${syncStatus[platform.platform] === 'syncing' 
                        ? 'bg-blue-400' 
                        : 'bg-blue-600 hover:bg-blue-700'}`}
                    disabled={syncStatus[platform.platform] === 'syncing'}
                  >
                    {syncStatus[platform.platform] === 'syncing' 
                      ? 'Syncing...' 
                      : 'Sync Now'}
                  </button>
                  
                  <button
                    onClick={() => handleDisconnect(platform.platform)}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Platforms;






