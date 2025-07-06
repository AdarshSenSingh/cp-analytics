import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  ArcElement,
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { analyticsAPI, platformsAPI } from '../services/api';

// Register Chart.js components
ChartJS.register(
  ArcElement,  // Required for Pie charts
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend
);

const Analytics = () => {
  const token = localStorage.getItem('token');
  
  const [summaryData, setSummaryData] = useState(null);
  const [topicsData, setTopicsData] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [topicsMistakesData, setTopicsMistakesData] = useState([]);
  const [ratingsData, setRatingsData] = useState({});
  const [platformAccounts, setPlatformAccounts] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState('codeforces');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 30 days
    endDate: new Date().toISOString().split('T')[0]
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Add missing state variables for notes functionality
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [problemNotes, setProblemNotes] = useState({});
  const [viewingNote, setViewingNote] = useState(null);
  const [viewingProblem, setViewingProblem] = useState(null);
  
  // Add missing handler functions
  const handleEditNote = (problemId, initialText) => {
    setEditingNoteId(problemId);
    setNoteText(initialText);
  };
  
  const handleSaveNote = async (problemId) => {
    try {
      const response = await axios.put(`/api/problems/${problemId}/notes`, {
        notes: noteText
      }, {
        headers: { 'x-auth-token': token }
      });
      
      setProblemNotes(prev => ({
        ...prev,
        [problemId]: response.data.notes
      }));
      
      setEditingNoteId(null);
    } catch (err) {
      console.error('Error saving note:', err);
    }
  };
  
  const handleViewNote = (problem, note) => {
    setViewingProblem(problem);
    setViewingNote(note);
  };
  
  const handleDeleteNote = async (problemId) => {
    try {
      await axios.put(`/api/problems/${problemId}/notes`, {
        notes: ''
      }, {
        headers: { 'x-auth-token': token }
      });
      
      setProblemNotes(prev => {
        const updated = { ...prev };
        delete updated[problemId];
        return updated;
      });
      
      setViewingNote(null);
      setViewingProblem(null);
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };

  // Fetch data function to be reused
  const fetchAnalyticsData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch platform accounts
      const accountsResponse = await platformsAPI.getAccounts();
      setPlatformAccounts(accountsResponse.data.platformAccounts || []);
      
      // Prepare query params
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);
      if (selectedPlatform) params.append('platform', selectedPlatform);
      
      // Fetch summary data
      const summaryResponse = await analyticsAPI.getSummary(token, params);
      setSummaryData(summaryResponse.data);
      
      // Fetch topics data
      const topicsResponse = await analyticsAPI.getTopics(token, params);
      setTopicsData(topicsResponse.data);
      
      // Fetch activity data
      const activityResponse = await analyticsAPI.getActivity(token, params);
      setActivityData(activityResponse.data);
      
      // Fetch topics mistakes data
      const mistakesResponse = await analyticsAPI.getTopicsMistakes(token, params);
      setTopicsMistakesData(mistakesResponse.data);
      
      // Fetch ratings data
      const ratingsResponse = await analyticsAPI.getRatings(token, params);
      setRatingsData(ratingsResponse.data);
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data. Please try again later.');
      setIsLoading(false);
    }
  }, [dateRange, selectedPlatform, token]);

  // Handle date range change without page refresh
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const handlePlatformChange = (e) => {
    setSelectedPlatform(e.target.value);
  };

  // Add a sync function
  const handleSync = async () => {
    try {
      setIsLoading(true);
      
      // Use the token from state/localStorage
      await axios.post(`/api/platforms/sync/${selectedPlatform}`, {}, {
        headers: { 'x-auth-token': token }
      });
      
      // Refetch all data after sync
      await fetchAnalyticsData();
    } catch (err) {
      console.error('Error syncing with Codeforces:', err);
      setError('Failed to sync with Codeforces. Please try again later.');
      setIsLoading(false);
    }
  };

  // Initial data fetch when component mounts
  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  useEffect(() => {
    if (topicsMistakesData.length > 0) {
      loadProblemNotes(topicsMistakesData);
    }
  }, [topicsMistakesData]);

  const loadProblemNotes = async (problems) => {
    try {
      const notes = {};
      
      for (const problem of problems) {
        try {
          const response = await axios.get(`/api/problems/${problem.id}/notes`, {
            headers: { 'x-auth-token': token }
          });
          
          if (response.data.notes) {
            notes[problem.id] = response.data.notes;
          }
        } catch (err) {
          console.error(`Error loading notes for problem ${problem.id}:`, err);
        }
      }
      
      setProblemNotes(notes);
    } catch (err) {
      console.error('Error loading problem notes:', err);
    }
  };

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

  // Prepare data for ratings bar chart
  const ratingsChartData = {
    labels: Object.keys(ratingsData || {}).filter(key => key !== 'unknown'),
    datasets: [
      {
        label: 'Problems Solved',
        data: Object.entries(ratingsData || {})
          .filter(([key]) => key !== 'unknown')
          .map(([_, value]) => value),
        backgroundColor: '#60a5fa',
      },
    ],
  };

  // Find the maximum value for y-axis scaling
  const maxRatingValue = Math.max(
    1, // Minimum of 1 to avoid empty charts
    ...Object.entries(ratingsData || {})
      .filter(([key]) => key !== 'unknown')
      .map(([_, value]) => value)
  );

  // Get the platform account for the selected platform
  const platformAccount = platformAccounts.find(acc => acc.platform === selectedPlatform);

  return (
    <div className="space-y-8">
      {/* Platform Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Codeforces Analytics</h1>
          <div className="flex items-center space-x-4">
            {platformAccount && (
              <button 
                onClick={handleSync}
                disabled={isLoading}
                className="px-4 py-2 bg-white text-blue-700 rounded-md hover:bg-blue-50 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Syncing...' : 'Sync Now'}
              </button>
            )}
            
            {/* Add profile button here if needed */}
          </div>
        </div>
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
            <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
            <select
              id="platform"
              name="platform"
              value={selectedPlatform}
              onChange={handlePlatformChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              {platformAccounts.map(account => (
                <option key={account.platform} value={account.platform}>
                  {account.platform.charAt(0).toUpperCase() + account.platform.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
              className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
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
          <h3 className="text-sm font-medium text-gray-500">First Attempt Success Rate</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {summaryData?.firstAttemptSuccessRate ? `${summaryData.firstAttemptSuccessRate}%` : '0%'}
          </p>
          <p className="mt-1 text-xs text-gray-500">Problems solved on first try</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Avg Attempts per Problem</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {summaryData?.averageAttemptsPerProblem || '0'}
          </p>
          <p className="mt-1 text-xs text-gray-500">Submissions needed to solve</p>
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
      
      {/* Problems with Most Mistakes */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Problems with Most Mistakes</h2>
          <p className="text-sm text-gray-500 mt-1">Problems with wrong submissions in the selected date range</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Problem</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wrong Submissions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topics</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topicsMistakesData.length > 0 ? (
                topicsMistakesData.map((problem, problemIndex) => (
                  <tr key={problem.id} className={problemIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center bg-red-100 text-red-600 rounded-full">
                          <span className="text-sm font-medium">{problemIndex + 1}</span>
                        </div>
                        <div className="ml-4">
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
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        {problem.mistakeCount} wrong submissions
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {problem.topics && problem.topics.map((topic, i) => (
                          <span 
                            key={i} 
                            className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {editingNoteId === problem.id ? (
                        <div className="flex flex-col space-y-2">
                          <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            rows="3"
                            placeholder="Add notes, concepts, or hints..."
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleSaveNote(problem.id)}
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingNoteId(null)}
                              className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          <button
                            onClick={() => 
                              problemNotes[problem.id] 
                                ? handleViewNote(problem, problemNotes[problem.id]) 
                                : handleEditNote(problem.id, '')
                            }
                            className={`inline-flex items-center px-3 py-1.5 border text-xs font-medium rounded-md ${
                              problemNotes[problem.id] 
                                ? 'border-indigo-300 text-indigo-700 bg-indigo-50 hover:bg-indigo-100' 
                                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                          >
                            {problemNotes[problem.id] ? (
                              <>
                                <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                View Note
                              </>
                            ) : (
                              <>
                                <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Add Note
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    No mistake data available in the selected date range. Keep practicing to see your weak areas!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Note Viewing Modal */}
      {viewingNote && viewingProblem && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => {
                setViewingNote(null);
                setViewingProblem(null);
              }}></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Notes for {viewingProblem.title}
                    </h3>
                    <div className="mt-4">
                      <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap text-sm text-gray-900">
                        {viewingNote}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => {
                    handleEditNote(viewingProblem.id, viewingNote);
                    setViewingNote(null);
                    setViewingProblem(null);
                  }}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteNote(viewingProblem.id)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-red-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setViewingNote(null);
                    setViewingProblem(null);
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
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
      
      {/* Problem Ratings Breakdown */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Problem Ratings Breakdown</h2>
          <p className="text-sm text-gray-500 mt-1">
            Distribution of solved problems by difficulty rating
            {ratingsData && ratingsData.unknown > 0 && 
              ` (Additionally, ${ratingsData.unknown} problems with unknown rating)`
            }
          </p>
        </div>
        <div className="p-6">
          <div className="h-80">
            <Bar 
              data={ratingsChartData} 
              options={{
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0, // Force integer ticks
                      stepSize: 1,  // Minimum step size of 1
                    },
                    suggestedMax: Math.ceil(maxRatingValue * 1.1), // Add 10% padding to the max value
                    title: {
                      display: true,
                      text: 'Problems Solved'
                    }
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'Problem Rating'
                    }
                  }
                },
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return `Problems Solved: ${context.raw}`;
                      }
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