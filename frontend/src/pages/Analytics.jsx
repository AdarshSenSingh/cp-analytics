import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { analyticsAPI, platformsAPI } from '../services/api';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
Chart.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Analytics = () => {
  const { token } = useAuth();
  const [summaryData, setSummaryData] = useState(null);
  const [topicsData, setTopicsData] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [topicsMistakesData, setTopicsMistakesData] = useState([]);
  const [platformAccounts, setPlatformAccounts] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState('codeforces');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 30 days
    endDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlatformAccounts = async () => {
      try {
        const response = await platformsAPI.getAccounts();
        setPlatformAccounts(response.data.platformAccounts || []);
        
        // Set default platform to Codeforces if available
        const codeforcesAccount = response.data.platformAccounts?.find(acc => 
          acc.platform.toLowerCase() === 'codeforces'
        );
        
        if (codeforcesAccount) {
          setSelectedPlatform('codeforces');
        }
      } catch (err) {
        console.error('Error fetching platform accounts:', err);
      }
    };
    
    fetchPlatformAccounts();
  }, [token]);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Build query parameters
        const params = {};
        
        if (selectedPlatform) {
          params.platform = selectedPlatform;
        }
        
        if (dateRange.startDate && dateRange.endDate) {
          params.startDate = dateRange.startDate;
          params.endDate = dateRange.endDate;
        }
        
        // Fetch summary data
        const summaryResponse = await analyticsAPI.getSummary(params);
        setSummaryData(summaryResponse.data);
        
        // Fetch topics data
        const topicsResponse = await analyticsAPI.getTopicsAnalysis(params);
        setTopicsData(topicsResponse.data);
        
        // Fetch activity data
        const activityResponse = await analyticsAPI.getActivity(params);
        setActivityData(activityResponse.data);
        
        // Fetch topics mistakes data
        const topicsMistakesResponse = await analyticsAPI.getTopicsMistakes(params);
        setTopicsMistakesData(topicsMistakesResponse.data);
        
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };
    
    if (selectedPlatform) {
      fetchAnalyticsData();
    }
  }, [token, selectedPlatform, dateRange]);

  // Prepare data for difficulty distribution pie chart
  const difficultyChartData = {
    labels: ['Easy', 'Medium', 'Hard'],
    datasets: [
      {
        data: [
          summaryData?.problemsByDifficulty?.easy || 0,
          summaryData?.problemsByDifficulty?.medium || 0,
          summaryData?.problemsByDifficulty?.hard || 0,
        ],
        backgroundColor: ['#4ade80', '#facc15', '#f87171'],
        borderColor: ['#22c55e', '#eab308', '#ef4444'],
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for topics bar chart (top 10 topics)
  const topicsChartData = {
    labels: topicsData.slice(0, 10).map(topic => topic.topic),
    datasets: [
      {
        label: 'Problems Solved',
        data: topicsData.slice(0, 10).map(topic => topic.count),
        backgroundColor: '#60a5fa',
      },
    ],
  };

  // Add this activity chart data definition
  const activityChartData = {
    labels: activityData.map(item => item.date),
    datasets: [
      {
        label: 'Problems Solved',
        data: activityData.map(item => item.accepted),
        backgroundColor: '#34d399',
      },
      {
        label: 'Total Submissions',
        data: activityData.map(item => item.total),
        backgroundColor: '#a78bfa',
      },
    ],
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePlatformChange = (e) => {
    setSelectedPlatform(e.target.value);
  };

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

  // Find the selected platform account
  const platformAccount = platformAccounts.find(acc => acc.platform.toLowerCase() === selectedPlatform);

  return (
    <div className="space-y-8">
      {/* Platform Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold">Codeforces Analytics</h1>
        {platformAccount && (
          <div className="mt-2">
            <p className="text-lg">Username: <span className="font-semibold">{platformAccount.username}</span></p>
            <p className="text-sm mt-1">
              Last synced: {platformAccount.lastSynced 
                ? new Date(platformAccount.lastSynced).toLocaleString() 
                : 'Never'}
            </p>
          </div>
        )}
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
            <select
              value={selectedPlatform}
              onChange={handlePlatformChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="codeforces">Codeforces</option>
              {platformAccounts.map((acc, idx) => (
                acc.platform.toLowerCase() !== 'codeforces' && (
                  <option key={idx} value={acc.platform.toLowerCase()}>
                    {acc.platform.charAt(0).toUpperCase() + acc.platform.slice(1)}
                  </option>
                )
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            />
          </div>
        </div>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Problems Solved</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{summaryData?.totalSolvedProblems || 0}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Submissions</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{summaryData?.totalSubmissions || 0}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Accepted Submissions</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{summaryData?.submissionsByStatus?.accepted || 0}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Success Rate</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {summaryData?.successRate ? summaryData.successRate.toFixed(1) : 0}%
          </p>
        </div>
      </div>
      
      {/* Difficulty Distribution */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Problem Difficulty Distribution</h2>
        </div>
        <div className="p-6">
          <div className="h-64 flex justify-center">
            <Pie data={difficultyChartData} options={{ maintainAspectRatio: false }} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <span className="inline-block w-3 h-3 bg-green-400 rounded-full mr-1"></span>
              <span className="text-sm font-medium">Easy: {summaryData?.problemsByDifficulty?.easy || 0}</span>
            </div>
            <div>
              <span className="inline-block w-3 h-3 bg-yellow-400 rounded-full mr-1"></span>
              <span className="text-sm font-medium">Medium: {summaryData?.problemsByDifficulty?.medium || 0}</span>
            </div>
            <div>
              <span className="inline-block w-3 h-3 bg-red-400 rounded-full mr-1"></span>
              <span className="text-sm font-medium">Hard: {summaryData?.problemsByDifficulty?.hard || 0}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Topics Analysis */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Topics Mastery (Perfect Solves)</h2>
          <p className="text-sm text-gray-500 mt-1">Topics where you solved problems on the first attempt</p>
        </div>
        <div className="p-6">
          <div className="h-80">
            <Bar 
              data={topicsChartData} 
              options={{
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Problems Solved'
                    }
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'Topics'
                    }
                  }
                }
              }} 
            />
          </div>
        </div>
      </div>
      
      {/* Topics with Most Mistakes */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Topics with Most Mistakes</h2>
          <p className="text-sm text-gray-500 mt-1">Topics with wrong submissions in the selected date range</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wrong Submissions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Problem</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topicsMistakesData.length > 0 ? (
                topicsMistakesData.flatMap((topic, topicIndex) => 
                  topic.problems.map((problem, problemIndex) => (
                    <tr key={`${topicIndex}-${problemIndex}`} className={topicIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      {problemIndex === 0 ? (
                        <td className="px-6 py-4 whitespace-nowrap" rowSpan={topic.problems.length}>
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center bg-red-100 text-red-600 rounded-full">
                              <span className="text-sm font-medium">{topicIndex + 1}</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{topic.topic}</div>
                            </div>
                          </div>
                        </td>
                      ) : null}
                      {problemIndex === 0 ? (
                        <td className="px-6 py-4 whitespace-nowrap" rowSpan={topic.problems.length}>
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            {topic.mistakeCount} wrong submissions
                          </span>
                        </td>
                      ) : null}
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <a 
                            href={problem.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-indigo-600 hover:text-indigo-900 mr-2"
                          >
                            {problem.title}
                          </a>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            problem.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                            problem.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {problem.difficulty}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                    No mistake data available in the selected date range. Keep practicing to see your weak areas!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Activity Over Time */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Activity Over Time</h2>
        </div>
        <div className="p-6">
          <div className="h-80">
            <Bar 
              data={activityChartData} 
              options={{
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Problems Solved'
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
      </div>
    </div>
  );
};

export default Analytics;