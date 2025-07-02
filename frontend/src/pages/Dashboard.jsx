import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [platformAccounts, setPlatformAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch summary statistics
        const statsResponse = await axios.get('/api/analytics/summary', {
          headers: { 'x-auth-token': token }
        });
        
        // Fetch problem recommendations
        const recommendationsResponse = await axios.get('/api/analytics/recommendations', {
          headers: { 'x-auth-token': token }
        });
        
        // Fetch platform accounts
        const platformsResponse = await axios.get('/api/platforms/accounts', {
          headers: { 'x-auth-token': token }
        });
        
        console.log('Dashboard data loaded:');
        console.log('Stats:', statsResponse.data);
        console.log('Recommendations:', recommendationsResponse.data);
        console.log('Platform Accounts:', platformsResponse.data);
        
        // Log detailed platform accounts data
        if (platformsResponse.data.platformAccounts) {
          console.log('Platform Accounts Details:');
          platformsResponse.data.platformAccounts.forEach((account, index) => {
            console.log(`Account ${index + 1}:`, account);
          });
        }
        
        setStats(statsResponse.data);
        setRecommendations(recommendationsResponse.data);
        setPlatformAccounts(platformsResponse.data.platformAccounts || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link 
          to="/submissions" 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          View Submission History
        </Link>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Problems Solved</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{stats?.totalSolvedProblems || 0}</p>
          <div className="mt-2 text-xs text-gray-500">
            Across all platforms
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Submissions</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{stats?.totalSubmissions || 0}</p>
          <div className="mt-2 text-xs text-gray-500">
            From {Object.keys(stats?.problemsByPlatform || {}).length} platforms
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Success Rate</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{stats?.successRate?.toFixed(1) || 0}%</p>
          <div className="mt-2 text-xs text-gray-500">
            {stats?.submissionsByStatus?.accepted || 0} accepted submissions
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Connected Platforms</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{Object.keys(stats?.problemsByPlatform || {}).length}</p>
          <div className="mt-2 text-xs text-gray-500">
            <Link to="/platforms" className="text-indigo-600 hover:text-indigo-900">
              Manage platforms
            </Link>
          </div>
        </div>
      </div>
      
      {/* Recommended Problems */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recommended Problems</h2>
        </div>
        
        {recommendations.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {recommendations.map((problem) => (
              <div key={problem._id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Link to={`/problems/${problem._id}`} className="text-indigo-600 hover:text-indigo-900">
                      {problem.title}
                    </Link>
                    <div className="flex items-center mt-1">
                      <span className="text-xs font-medium bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full capitalize mr-2">
                        {problem.platform}
                      </span>
                      <span className="text-sm text-gray-500">
                        {problem.difficulty}
                      </span>
                    </div>
                  </div>
                  <div>
                    <a
                      href={problem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                    >
                      Solve
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-4 text-center text-gray-500">
            No recommendations available. Connect your coding platforms to get started!
          </div>
        )}
        
        <div className="px-6 py-4 bg-gray-50">
          <Link to="/problems" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            Browse all problems
          </Link>
        </div>
      </div>

      {/* Platform Stats */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Platform Statistics</h2>
        </div>
        <div className="p-6">
          {platformAccounts && platformAccounts.length > 0 ? (
            <div className="space-y-4">
              {platformAccounts.map((platform, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <h3 className="text-md font-medium">{platform.platform.charAt(0).toUpperCase() + platform.platform.slice(1)}</h3>
                    <p className="text-sm text-gray-500">{platform.username}</p>
                    <p className="text-xs text-gray-400">Last synced: {platform.lastSynced ? new Date(platform.lastSynced).toLocaleString() : 'Never'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">Problems Solved: <span className="font-medium">{platform.stats?.problemsSolved || 0}</span></p>
                    <p className="text-sm">Success Rate: <span className="font-medium">{platform.stats?.successRate || 0}%</span></p>
                    <Link 
                      to="/platforms" 
                      className="text-xs text-indigo-600 hover:text-indigo-900"
                    >
                      Sync now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              No platforms connected. <Link to="/platforms" className="text-indigo-600 hover:text-indigo-900">Connect your Codeforces account</Link> to see statistics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;









