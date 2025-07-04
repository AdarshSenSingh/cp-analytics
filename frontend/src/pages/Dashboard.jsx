import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProblems: 0,
    solvedToday: 0,
    solvedThisWeek: 0,
    solvedThisMonth: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // TEMPORARY: Use mock data instead of API calls
        // Comment out or remove these API calls if backend is not ready
        /*
        const token = localStorage.getItem('token');
        
        // Fetch stats
        const statsResponse = await axios.get('/api/analytics/summary', {
          headers: { 'x-auth-token': token }
        });
        
        // Fetch recent activity
        const activityResponse = await axios.get('/api/submissions/recent', {
          params: { limit: 5 },
          headers: { 'x-auth-token': token }
        });
        
        // Fetch recommendations
        const recommendationsResponse = await axios.get('/api/analytics/recommendations', {
          params: { limit: 5 },
          headers: { 'x-auth-token': token }
        });
        
        setStats(statsResponse.data);
        setRecentActivity(activityResponse.data);
        setRecommendations(recommendationsResponse.data);
        */
        
        // Mock data for development
        setStats({
          totalProblems: 42,
          solvedToday: 3,
          solvedThisWeek: 12,
          solvedThisMonth: 28
        });
        
        setRecentActivity([
          {
            _id: '1',
            problem: { _id: '101', title: 'Two Sum' },
            status: 'accepted',
            submittedAt: new Date().toISOString()
          },
          {
            _id: '2',
            problem: { _id: '102', title: 'Valid Parentheses' },
            status: 'failed',
            submittedAt: new Date().toISOString()
          }
        ]);
        
        setRecommendations([
          {
            _id: '201',
            title: 'Merge Two Sorted Lists',
            platform: 'leetcode',
            difficulty: 'Easy',
            url: 'https://leetcode.com/problems/merge-two-sorted-lists/'
          },
          {
            _id: '202',
            title: 'Maximum Subarray',
            platform: 'leetcode',
            difficulty: 'Medium',
            url: 'https://leetcode.com/problems/maximum-subarray/'
          }
        ]);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Prepare data for activity chart
  const activityData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Problems Solved',
        data: [3, 5, 2, 4, 7, 1, 6], // Example data
        backgroundColor: '#60a5fa',
      },
    ],
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      {loading ? (
        <div className="text-center py-10">
          <p className="text-gray-500">Loading dashboard data...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-red-500">{error}</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-sm font-medium text-gray-500">Total Problems Solved</h2>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalProblems}</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-sm font-medium text-gray-500">Solved Today</h2>
              <p className="mt-2 text-3xl font-bold text-indigo-600">{stats.solvedToday}</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-sm font-medium text-gray-500">Solved This Week</h2>
              <p className="mt-2 text-3xl font-bold text-green-600">{stats.solvedThisWeek}</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-sm font-medium text-gray-500">Solved This Month</h2>
              <p className="mt-2 text-3xl font-bold text-purple-600">{stats.solvedThisMonth}</p>
            </div>
          </div>
          
          {/* Activity Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Weekly Activity</h2>
            <div className="h-64">
              <Bar 
                data={activityData} 
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Problems Solved'
                      }
                    }
                  }
                }} 
              />
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
            </div>
            
            {recentActivity.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {recentActivity.map((submission) => (
                  <div key={submission._id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Link to={`/problems/${submission.problem?._id}`} className="text-indigo-600 hover:text-indigo-900">
                          {submission.problem?.title || 'Unknown Problem'}
                        </Link>
                        <div className="flex items-center mt-1">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            submission.status === 'accepted' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {submission.status === 'accepted' ? 'Accepted' : 'Failed'}
                          </span>
                          <span className="ml-2 text-sm text-gray-500">
                            {new Date(submission.submittedAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div>
                        <Link
                          to={`/submissions/${submission._id}`}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-4 text-center text-gray-500">
                No recent activity found.
              </div>
            )}
            
            <div className="px-6 py-4 bg-gray-50">
              <Link to="/submissions" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                View all submissions
              </Link>
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
        </>
      )}
    </div>
  );
};

export default Dashboard;









