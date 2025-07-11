import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import ProfilePopup from '../components/ProfilePopup';

Chart.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend, Filler);

const Dashboard = () => {
  const token = localStorage.getItem('token');
  const [user, setUser] = useState(null);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [stats, setStats] = useState(null);
  const [submissionActivity, setSubmissionActivity] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activityDateRange, setActivityDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        // User info
        const userRes = await axios.get('/api/auth/me', { headers: { 'x-auth-token': token } });
        setUser(userRes.data);

        // Stats (from platform accounts or a dedicated endpoint)
        let statsData = null;
        if (userRes.data.platformAccounts && userRes.data.platformAccounts.length > 0) {
          // Example: aggregate stats from all platforms
          statsData = userRes.data.platformAccounts.reduce((acc, accObj) => {
            if (accObj.stats) {
              acc.totalProblems += accObj.stats.problemsSolved || 0;
              acc.solvedToday += accObj.stats.solvedToday || 0;
              acc.solvedThisWeek += accObj.stats.solvedThisWeek || 0;
              acc.solvedThisMonth += accObj.stats.solvedThisMonth || 0;
            }
            return acc;
          }, { totalProblems: 0, solvedToday: 0, solvedThisWeek: 0, solvedThisMonth: 0 });
        }
        setStats(statsData);

        // Submission activity (for chart)
        const activityParams = new URLSearchParams();
        if (activityDateRange.startDate) activityParams.append('startDate', activityDateRange.startDate);
        if (activityDateRange.endDate) activityParams.append('endDate', activityDateRange.endDate);
        const activityRes = await axios.get(`/api/analytics/activity?${activityParams.toString()}`, {
          headers: { 'x-auth-token': token }
        });
        setSubmissionActivity(activityRes.data || []);

        // Recent submissions
        const submissionsRes = await axios.get('/api/submissions?limit=5', {
          headers: { 'x-auth-token': token }
        });
        setRecentActivity(submissionsRes.data?.submissions || []);

        // Recommendations (if your backend provides this endpoint)
        try {
          const recRes = await axios.get('/api/recommendations', {
            headers: { 'x-auth-token': token }
          });
          setRecommendations(recRes.data?.recommendations || []);
        } catch (recErr) {
          setRecommendations([]); // If not available, just show nothing
        }
      } catch (err) {
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [token, activityDateRange.startDate, activityDateRange.endDate]);

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setActivityDateRange(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  // Chart data
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

  return (
    <>
      <Navbar />
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white p-6 rounded-lg shadow-lg flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome, {user?.name || 'Coder'}!
            </h1>
            {user?.platformAccounts && user.platformAccounts.length > 0 && (
              <div className="mt-2 text-sm">
                Connected Platforms: {user.platformAccounts.map(acc => acc.platform).join(', ')}
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowProfilePopup(true)}
              className="px-4 py-2 bg-white text-indigo-600 rounded-md hover:bg-gray-100 transition-colors"
            >
              Profile
            </button>
          </div>
        </div>

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
            {stats && (
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
            )}

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

            {/* Recommendations (if available) */}
            {recommendations.length > 0 && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Recommended Problems</h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendations.map((rec) => (
                    <a
                      key={rec._id}
                      href={rec.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-blue-50 p-4 rounded-lg hover:bg-blue-100 transition"
                    >
                      <div className="font-bold text-blue-800 mb-1">{rec.title}</div>
                      <div className="text-xs text-gray-600 mb-1">{rec.platform} &middot; {rec.difficulty}</div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Dashboard;
