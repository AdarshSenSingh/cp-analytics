import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Bar, Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import ProfilePopup from '../components/ProfilePopup';

// Register Chart.js components including Filler
Chart.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

const Dashboard = () => {
  const token = localStorage.getItem('token');
  const [user, setUser] = useState(null);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [codeforcesRating, setCodeforcesRating] = useState(null);
  const [codeforcesUsername, setCodeforcesUsername] = useState('');
  const [submissionActivity, setSubmissionActivity] = useState([]);
  const [activityDateRange, setActivityDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 30 days
    endDate: new Date().toISOString().split('T')[0]
  });
  
  const [stats, setStats] = useState({
    totalProblems: 0,
    solvedToday: 0,
    solvedThisWeek: 0,
    solvedThisMonth: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [platformAccounts, setPlatformAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add this function to handle profile updates
  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  // Add a sync function
  const handleSync = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Sync Codeforces data
      if (codeforcesUsername) {
        await axios.post(`/api/platforms/sync/codeforces`, {}, {
          headers: { 'x-auth-token': token }
        });
        
        // Refetch user data and stats by triggering the useEffect
        // We don't need to call fetchDashboardData since the useEffect will handle it
        setLoading(false); // Set loading to false to allow the useEffect to run again
      }
    } catch (err) {
      console.error('Error syncing with Codeforces:', err);
      setError('Failed to sync with Codeforces. Please try again later.');
      setLoading(false);
    }
  };

  // Use the existing stats from the user's platform account instead of creating a new endpoint
  const fetchCodeforcesStats = async (username) => {
    try {
      // We already have the user's platform accounts from the main useEffect
      // Just use that data instead of making a new API call
      if (user && user.platformAccounts) {
        const cfAccount = user.platformAccounts.find(acc => acc.platform === 'codeforces');
        if (cfAccount && cfAccount.stats) {
          setStats({
            totalProblems: cfAccount.stats.problemsSolved || 0,
            solvedToday: cfAccount.stats.solvedToday || 0,
            solvedThisWeek: cfAccount.stats.solvedThisWeek || 0,
            solvedThisMonth: cfAccount.stats.solvedThisMonth || 0
          });
        }
      }
    } catch (err) {
      console.error('Error fetching Codeforces statistics:', err);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch user data
        if (token) {
          try {
            const userResponse = await axios.get('/api/auth/me', {
              headers: { 'x-auth-token': token }
            });
            setUser(userResponse.data);
            
            // Fetch Codeforces rating if user has a Codeforces account
            if (userResponse.data.platformAccounts && 
                userResponse.data.platformAccounts.some(acc => acc.platform === 'codeforces')) {
              const cfAccount = userResponse.data.platformAccounts.find(acc => acc.platform === 'codeforces');
              setCodeforcesUsername(cfAccount.username);
              
              try {
                const cfResponse = await axios.get(`https://codeforces.com/api/user.info?handles=${cfAccount.username}`);
                if (cfResponse.data.status === 'OK' && cfResponse.data.result.length > 0) {
                  setCodeforcesRating(cfResponse.data.result[0].rating);
                  
                  // Fetch Codeforces statistics
                  await fetchCodeforcesStats(cfAccount.username);
                }
              } catch (cfErr) {
                console.error('Error fetching Codeforces rating:', cfErr);
              }
            }
          } catch (userErr) {
            console.error('Error fetching user:', userErr);
          }
        }
        
        // Fetch platform accounts
        const accountsResponse = await axios.get('/api/platforms/accounts', {
          headers: { 'x-auth-token': token }
        });
        
        setPlatformAccounts(accountsResponse.data.platformAccounts || []);
        
        // Fetch submission activity data with date range
        try {
          const activityParams = new URLSearchParams();
          if (activityDateRange.startDate) activityParams.append('startDate', activityDateRange.startDate);
          if (activityDateRange.endDate) activityParams.append('endDate', activityDateRange.endDate);
          
          const activityResponse = await axios.get(`/api/analytics/activity?${activityParams.toString()}`, {
            headers: { 'x-auth-token': token }
          });
          
          setSubmissionActivity(activityResponse.data || []);
        } catch (activityErr) {
          console.error('Error fetching submission activity:', activityErr);
          // Use mock data if API fails
          setSubmissionActivity([
            { date: '2023-05-01', accepted: 3 },
            { date: '2023-05-02', accepted: 5 },
            { date: '2023-05-03', accepted: 2 },
            { date: '2023-05-04', accepted: 4 },
            { date: '2023-05-05', accepted: 7 },
            { date: '2023-05-06', accepted: 1 },
            { date: '2023-05-07', accepted: 6 },
          ]);
        }
        
        // Set recent activity and recommendations (keeping mock data for now)
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
  }, [token]);

  // Separate useEffect for handling date range changes
  useEffect(() => {
    const fetchActivityData = async () => {
      if (!token) return;
      
      try {
        const activityParams = new URLSearchParams();
        if (activityDateRange.startDate) activityParams.append('startDate', activityDateRange.startDate);
        if (activityDateRange.endDate) activityParams.append('endDate', activityDateRange.endDate);
        
        const activityResponse = await axios.get(`/api/analytics/activity?${activityParams.toString()}`, {
          headers: { 'x-auth-token': token }
        });
        
        setSubmissionActivity(activityResponse.data || []);
      } catch (activityErr) {
        console.error('Error fetching submission activity:', activityErr);
        // Use mock data if API fails
        setSubmissionActivity([
          { date: '2023-05-01', accepted: 3 },
          { date: '2023-05-02', accepted: 5 },
          { date: '2023-05-03', accepted: 2 },
          { date: '2023-05-04', accepted: 4 },
          { date: '2023-05-05', accepted: 7 },
          { date: '2023-05-06', accepted: 1 },
          { date: '2023-05-07', accepted: 6 },
        ]);
      }
    };
    
    fetchActivityData();
  }, [activityDateRange, token]);

  // Prepare data for activity line chart
  const submissionActivityData = {
    labels: submissionActivity.map(item => item.date),
    datasets: [
      {
        label: 'Accepted Submissions',
        data: submissionActivity.map(item => item.accepted),
        borderColor: '#4ade80',
        backgroundColor: 'rgba(74, 222, 128, 0.2)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setActivityDateRange(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header with Profile Button */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white p-6 rounded-lg shadow-lg flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome, {codeforcesUsername || user?.name || 'Coder'}!
          </h1>
          {codeforcesRating && (
            <div className="mt-2 text-xl">
              Current Codeforces Rating: <span className="font-bold">{codeforcesRating}</span>
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          {codeforcesUsername && (
            <button
              onClick={handleSync}
              disabled={loading}
              className="px-4 py-2 bg-white text-indigo-600 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {loading ? 'Syncing...' : 'Sync Codeforces'}
            </button>
          )}
          <button
            onClick={() => setShowProfilePopup(true)}
            className="px-4 py-2 bg-white text-indigo-600 rounded-md hover:bg-gray-100 transition-colors"
          >
            Profile
          </button>
        </div>
      </div>
      
      {/* Profile Popup */}
      {showProfilePopup && (
        <ProfilePopup 
          user={user} 
          onClose={() => setShowProfilePopup(false)}
          onUpdate={handleProfileUpdate}
        />
      )}
      
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
          
          {/* Submission Activity Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Submission Activity</h2>
              <div className="flex space-x-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">From</label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={activityDateRange.startDate}
                    onChange={handleDateRangeChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">To</label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={activityDateRange.endDate}
                    onChange={handleDateRangeChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="h-64">
              <Line 
                data={submissionActivityData} 
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Accepted Submissions'
                      },
                      ticks: {
                        precision: 0
                      }
                    },
                    x: {
                      title: {
                        display: true,
                        text: 'Date'
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
          
          {/* Recommended Section */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Want to improve rating? Don't worry!</h2>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Roadmap Section */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-blue-800 mb-3">Rating Roadmap</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                    <span>Newbie (800-1199): Focus on basic algorithms</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                    <span>Pupil (1200-1399): Learn data structures</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                    <span>Specialist (1400-1599): Master graph algorithms</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                    <span>Expert (1600+): Advanced techniques</span>
                  </li>
                </ul>
              </div>
              
              {/* Problem Recommendations */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-green-800 mb-3">Recommended Problems</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="https://codeforces.com/problemset/problem/4/A" className="text-blue-600 hover:underline">Watermelon (800)</a></li>
                  <li><a href="https://codeforces.com/problemset/problem/158/A" className="text-blue-600 hover:underline">Next Round (900)</a></li>
                  <li><a href="https://codeforces.com/problemset/problem/231/A" className="text-blue-600 hover:underline">Team (1000)</a></li>
                  <li><a href="https://codeforces.com/problemset/problem/50/A" className="text-blue-600 hover:underline">Domino piling (1200)</a></li>
                  <li><a href="https://codeforces.com/problemset/problem/189/A" className="text-blue-600 hover:underline">Cut Ribbon (1500)</a></li>
                </ul>
              </div>
              
              {/* Learning Materials */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-purple-800 mb-3">Learning Materials</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-blue-600 hover:underline">Dynamic Programming Guide</a></li>
                  <li><a href="#" className="text-blue-600 hover:underline">Graph Algorithms Tutorial</a></li>
                  <li><a href="#" className="text-blue-600 hover:underline">Number Theory Basics</a></li>
                  <li><a href="#" className="text-blue-600 hover:underline">Greedy Algorithms Explained</a></li>
                  <li><a href="#" className="text-blue-600 hover:underline">Binary Search Applications</a></li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;

