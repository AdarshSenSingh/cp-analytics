import React, { useState, useEffect, useCallback } from 'react';
// Creative dynamic confetti and icons
const Confetti = ({ show }) => show ? (
  <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
    {[...Array(60)].map((_, i) => (
      <div
        key={i}
        className="absolute rounded-full opacity-80 animate-confetti"
        style={{
          width: `${Math.random() * 8 + 4}px`,
          height: `${Math.random() * 8 + 4}px`,
          background: `hsl(${Math.random() * 360}, 90%, 60%)`,
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          animationDuration: `${Math.random() * 1.5 + 1}s`,
        }}
      />
    ))}
  </div>
) : null;

const StatusIcon = ({ status }) => {
  if (status === 'accepted') {
    return <span className="inline-block animate-pop text-green-600">✔️</span>;
  } else if (status === 'pending') {
    return <span className="inline-block animate-spin text-blue-500">⏳</span>;
  } else if (status === 'wrong_answer' || status === 'rejected') {
    return <span className="inline-block animate-shake text-red-500">❌</span>;
  } else {
    return <span className="inline-block text-gray-400">•</span>;
  }
};

const ProgressBar = ({ percent }) => (
  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
    <div className="h-2 bg-gradient-to-r from-indigo-400 to-green-400 rounded-full animate-progress" style={{ width: `${percent}%` }} />
  </div>
);

// Add creative CSS animations
const style = document.createElement('style');
style.innerHTML = `
@keyframes confetti {
  0% { transform: translateY(0) scale(1); opacity: 1; }
  100% { transform: translateY(200px) scale(0.7); opacity: 0; }
}
.animate-confetti { animation: confetti linear forwards; }
@keyframes pop { 0% { transform: scale(0.7); } 60% { transform: scale(1.2); } 100% { transform: scale(1); } }
.animate-pop { animation: pop 0.5s cubic-bezier(.68,-0.55,.27,1.55); }
@keyframes shake { 0%,100%{transform:translateX(0);} 20%,60%{transform:translateX(-4px);} 40%,80%{transform:translateX(4px);} }
.animate-shake { animation: shake 0.6s; }
@keyframes progress { from { width: 0; } to { width: 100%; } }
.animate-progress { animation: progress 1.2s cubic-bezier(.4,0,.2,1) forwards; }
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
.animate-fade-in { animation: fade-in 0.3s; }
`;
document.head.appendChild(style);
import AIAssistantModal from '../components/AIAssistantModal';
import CodeViewModal from '../components/CodeViewModal';
import axios from 'axios';
import { fetchCodeforcesSubmissionCode } from '../services/codeforces';
import { Link } from 'react-router-dom';
// No navigation to /submissions/:id for code view, only modal is used

const Submissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [confetti, setConfetti] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({
    status: '',
    platform: ''
  });
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isSyncing, setIsSyncing] = useState(false);
  const itemsPerPage = 10;

  // Code View Modal state
  const [codeViewOpen, setCodeViewOpen] = useState(false);
  const [codeViewSubmission, setCodeViewSubmission] = useState(null);
  const [codeViewCode, setCodeViewCode] = useState('');
  const [codeViewLoading, setCodeViewLoading] = useState(false);
  const [codeViewError, setCodeViewError] = useState('');

  // AI Assistant Modal state
  const [aiModalOpen, setAIModalOpen] = useState(false);
  const [aiModalSubmission, setAIModalSubmission] = useState(null);
  const [aiModalCode, setAIModalCode] = useState('');
  const [aiModalLoading, setAIModalLoading] = useState(false);
  const [aiModalError, setAIModalError] = useState('');

  // Helper to determine if a submission is a Codeforces remote submission
  const isCodeforcesRemote = (submission) => {
  return (
    submission.platform === 'codeforces' &&
    (!submission.code || submission.code.trim() === '') &&
    submission.remote &&
    submission.remote.submissionId &&
    submission.remote.contestId &&
    submission.remote.handle
  );
};

  // Code View Modal logic
  const handleOpenCodeView = async (submission) => {
    // Confetti for accepted
    if (submission.status === 'accepted') {
      setConfetti(true);
      setTimeout(() => setConfetti(false), 1800);
    }
    // ...rest as before
    console.log('[DEBUG] handleOpenCodeView called with submission:', submission);
    const isRemote = isCodeforcesRemote(submission);
    console.log('[DEBUG] isCodeforcesRemote:', isRemote);
    if (submission.remote) {
      console.log('[DEBUG] submission.remote:', submission.remote);
    } else {
      console.log('[DEBUG] submission.remote is undefined or null');
    }
    console.log('[CodeView] Submission:', submission);
    setCodeViewSubmission(submission);
    setCodeViewOpen(true);
    setCodeViewError('');
    setCodeViewCode('');
    if (isCodeforcesRemote(submission)) {
      setCodeViewLoading(true);
      console.log('[DEBUG] setCodeViewLoading(true)');
      try {
        if (!submission.remote.handle || !submission.remote.contestId || !submission.remote.submissionId) {
          setCodeViewError('Cannot fetch code: missing contestId, submissionId, or handle. Please re-sync your account.');
          setCodeViewLoading(false);
      console.log('[DEBUG] setCodeViewLoading(false)');
          return;
        }
        const code = await fetchCodeforcesSubmissionCode(
          submission.remote.handle,
          submission.remote.contestId,
          submission.remote.submissionId
        );
        setCodeViewCode(code);
        console.log('[DEBUG] Code fetched from Codeforces:', code);
      } catch (err) {
        setCodeViewError('Failed to fetch code from Codeforces: ' + (err.message || err));
        console.error('[DEBUG] Error fetching code from Codeforces:', err);
      } finally {
        setCodeViewLoading(false);
      console.log('[DEBUG] setCodeViewLoading(false)');
      }
    } else {
      if (!submission.code || submission.code.trim() === '') {
        setCodeViewError('No code available in local submission.');
      }
      setCodeViewCode(submission.code || '');
    }
  };
  const handleCloseCodeView = () => {
    setCodeViewOpen(false);
    setCodeViewSubmission(null);
    setCodeViewCode('');
    setCodeViewError('');
    setCodeViewLoading(false);
      console.log('[DEBUG] setCodeViewLoading(false)');
  };

  // AI Assistant Modal logic
  const handleOpenAIModal = async (submission) => {
    setAIModalSubmission(submission);
    setAIModalOpen(true);
    setAIModalError('');
    setAIModalCode('');
    if (isCodeforcesRemote(submission)) {
      setAIModalLoading(true);
      try {
        if (!submission.remote.handle || !submission.remote.contestId || !submission.remote.submissionId) {
          setAIModalError('Cannot fetch code: missing contestId, submissionId, or handle. Please re-sync your account.');
          setAIModalLoading(false);
          return;
        }
        const code = await fetchCodeforcesSubmissionCode(
          submission.remote.handle,
          submission.remote.contestId,
          submission.remote.submissionId
        );
        if (!code || code.trim() === '') {
          setAIModalError('Failed to fetch code from Codeforces. Please check your account sync or try again later.');
        } else {
          setAIModalCode(code);
        }
      } catch (err) {
        setAIModalError('Failed to fetch code from Codeforces. Please check your account sync or try again later.');
      } finally {
        setAIModalLoading(false);
      }
    } else {
      setAIModalCode(submission.code || '');
    }
  };
  const handleCloseAIModal = () => {
    setAIModalOpen(false);
    setAIModalSubmission(null);
    setAIModalCode('');
    setAIModalError('');
    setAIModalLoading(false);
  };

  // Create a reusable fetch function with useCallback
  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = {
        page,
        limit: itemsPerPage
      };
      
      if (filter.status) params.status = filter.status;
      if (filter.platform) params.platform = filter.platform;
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;
      
      // Set the sort parameter based on the sort state
      if (sort === 'newest') {
        params.sort = '-submittedAt'; // Descending order (newest first)
      } else if (sort === 'oldest') {
        params.sort = 'submittedAt'; // Ascending order (oldest first)
      }
      
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/submissions', {
        params,
        headers: { 'x-auth-token': token }
      });
      
      console.log('API /api/submissions response:', response.data);
setSubmissions(response.data.submissions);
      setTotalPages(Math.ceil(response.data.totalSubmissions / itemsPerPage));
      setError(null);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError('Failed to load submissions. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [page, itemsPerPage, sort, filter, dateRange]);

  // Add sync function with queue-like behavior
  const handleSync = async () => {
    try {
      setIsSyncing(true);
      const token = localStorage.getItem('token');
      
      // Use the platform from filter if available, otherwise default to 'codeforces'
      const platform = filter.platform || 'codeforces';
      
      // Request a larger number of submissions during sync
      await axios.post(`/api/platforms/sync/${platform}`, { maxCount: 1000 }, {
        headers: { 'x-auth-token': token }
      });
      
      // Refetch submissions after sync
      await fetchSubmissions();
      
    } catch (err) {
      console.error('Error syncing with platform:', err);
      setError(`Failed to sync with ${filter.platform || 'platform'}. Please try again later.`);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const handleSortChange = (e) => {
    setSort(e.target.value);
    // We don't need to call fetchSubmissions here as it will be triggered by the useEffect
    // that depends on the sort state via the fetchSubmissions dependency array
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleApplyFilters = () => {
    // Reset to page 1 when applying new filters
    setPage(1);
    fetchSubmissions();
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'wrong_answer':
        return 'bg-red-100 text-red-800';
      case 'time_limit_exceeded':
        return 'bg-yellow-100 text-yellow-800';
      case 'memory_limit_exceeded':
        return 'bg-orange-100 text-orange-800';
      case 'runtime_error':
        return 'bg-purple-100 text-purple-800';
      case 'compilation_error':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const formatStatus = (status) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Fix the pagination display
  const renderPaginationInfo = () => {
    const startItem = (page - 1) * itemsPerPage + 1;
    const endItem = Math.min(page * itemsPerPage, submissions.length + (page - 1) * itemsPerPage);
    const totalItems = (totalPages * itemsPerPage) || 0;
    
    return (
      <p className="text-sm text-gray-700">
        Showing <span className="font-medium">{startItem}</span> to{' '}
        <span className="font-medium">{endItem}</span> of{' '}
        <span className="font-medium">{totalItems}</span> results
      </p>
    );
  };

  return (
    <div className="space-y-6 relative">
      {/* Animated background shapes */}
      <div className="pointer-events-none fixed inset-0 z-0">
        {[...Array(12)].map((_,i) => (
          <div key={i} className="absolute rounded-full opacity-30 blur-2xl animate-float"
            style={{
              width: `${Math.random()*120+80}px`,
              height: `${Math.random()*120+80}px`,
              background: `linear-gradient(135deg, hsl(${Math.random()*360},80%,80%), hsl(${Math.random()*360},80%,90%))`,
              top: `${Math.random()*100}%`,
              left: `${Math.random()*100}%`,
              animationDuration: `${Math.random()*6+6}s`,
              animationDelay: `${Math.random()*2}s`,
            }}
          />
        ))}
      </div>
      <Confetti show={confetti} />
      {/* Celebrate button */}
      <button
        className="fixed bottom-8 right-8 z-50 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-full shadow-lg px-6 py-3 text-lg animate-bounce"
        onClick={() => { setConfetti(true); setTimeout(() => setConfetti(false), 1800); }}
        style={{boxShadow:'0 4px 32px 0 #f472b6'}}
      >
        🎉 Celebrate
      </button>
      <div className="relative bg-white/70 shadow-xl rounded-3xl p-8 mb-4 border border-indigo-200 backdrop-blur-lg" style={{boxShadow:'0 8px 32px 0 #6366f1cc'}}>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-block animate-pop text-3xl">📊</span>
            <h1 className="text-3xl font-extrabold text-indigo-900 tracking-tight drop-shadow">My Submissions</h1>
          </div>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-pink-500 text-white rounded-xl font-bold shadow-lg hover:scale-105 hover:from-indigo-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 border-2 border-white"
            style={{boxShadow:'0 2px 16px 0 #818cf8'}}
          >
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
        {/* Filters section */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          <div>
            <label htmlFor="platform" className="block text-sm font-bold text-indigo-700 mb-1">Platform</label>
            <select
              id="platform"
              name="platform"
              value={filter.platform}
              onChange={handleFilterChange}
              className="block w-full rounded-xl border-indigo-200 shadow focus:border-pink-400 focus:ring-pink-300 sm:text-sm bg-white/80 hover:bg-indigo-50 transition-all"
            >
              <option value="">All Platforms</option>
              <option value="codeforces">Codeforces</option>
              {/* Add other platforms as needed */}
            </select>
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-bold text-indigo-700 mb-1">Status</label>
            <select
              id="status"
              name="status"
              value={filter.status}
              onChange={handleFilterChange}
              className="block w-full rounded-xl border-indigo-200 shadow focus:border-pink-400 focus:ring-pink-300 sm:text-sm bg-white/80 hover:bg-indigo-50 transition-all"
            >
              <option value="">All Statuses</option>
              <option value="accepted">Accepted</option>
              <option value="wrong_answer">Wrong Answer</option>
              <option value="time_limit_exceeded">Time Limit Exceeded</option>
              <option value="memory_limit_exceeded">Memory Limit Exceeded</option>
              <option value="runtime_error">Runtime Error</option>
              <option value="compilation_error">Compilation Error</option>
            </select>
          </div>
          <div>
            <label htmlFor="startDate" className="block text-sm font-bold text-indigo-700 mb-1">Start Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
              className="block w-full rounded-xl border-indigo-200 shadow focus:border-pink-400 focus:ring-pink-300 sm:text-sm bg-white/80 hover:bg-indigo-50 transition-all"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-bold text-indigo-700 mb-1">End Date</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateChange}
              className="block w-full rounded-xl border-indigo-200 shadow focus:border-pink-400 focus:ring-pink-300 sm:text-sm bg-white/80 hover:bg-indigo-50 transition-all"
            />
          </div>
          <div>
            <label htmlFor="sort" className="block text-sm font-bold text-indigo-700 mb-1">Sort By</label>
            <select
              id="sort"
              name="sort"
              value={sort}
              onChange={handleSortChange}
              className="block w-full rounded-xl border-indigo-200 shadow focus:border-pink-400 focus:ring-pink-300 sm:text-sm bg-white/80 hover:bg-indigo-50 transition-all"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleApplyFilters}
            className="px-8 py-2 bg-gradient-to-r from-pink-500 to-indigo-500 text-white rounded-xl font-bold shadow-lg hover:scale-105 hover:from-pink-600 hover:to-indigo-600 transition-all duration-200 border-2 border-white"
            style={{boxShadow:'0 2px 16px 0 #f472b6'}}
          >
            Apply Filters
          </button>
        </div>
      </div>
      
      {/* Submissions List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Your Submissions</h2>
        </div>
        
        {loading ? (
          <div className="px-6 py-10 text-center">
            <p className="text-gray-500">Loading submissions...</p>
          </div>
        ) : error ? (
          <div className="px-6 py-10 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-gray-500">No submissions found matching your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Problem
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Platform
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Language
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted At
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    AI Assistant
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {submissions.map((submission, idx) => (
                  <tr key={submission._id} className="relative group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        <StatusIcon status={submission.status} />
                        <Link to={`/problems/${submission.problem._id}`} className="hover:text-indigo-600">
                          {submission.problem.title}
                        </Link>
                      </div>
                      <div className="text-sm text-gray-500">
                        {submission.problem.difficulty}
                      </div>
                      <div className="mt-2"><ProgressBar percent={100} /></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">{submission.platform}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(submission.status)}`}>
                        {formatStatus(submission.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {submission.language}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(submission.submittedAt)}
                    </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
  {submission.status?.toLowerCase() !== 'accepted' ? (
  <>
    <a
      href={`https://codeforces.com/contest/${submission.remote?.contestId || submission.problem?.contestId}/submission/${submission.remote?.submissionId || ''}`}
      className="text-indigo-600 hover:text-indigo-900 mr-3"
      target="_blank"
      rel="noopener noreferrer"
    >
      View
    </a>
    <button
      className="text-green-600 hover:text-green-900"
      type="button"
      onClick={() =>
        window.open(
          `https://codeforces.com/contest/${submission.problem.contestId}/problem/${submission.problem.index}`,
          '_blank',
          'noopener,noreferrer'
        )
      }
    >
      Retry
    </button>
  </>
) : (
  <a
    href={`https://codeforces.com/contest/${submission.remote?.contestId || submission.problem?.contestId}/submission/${submission.remote?.submissionId || ''}`}
    className="text-indigo-600 hover:text-indigo-900"
    target="_blank"
    rel="noopener noreferrer"
  >
    View
  </a>
)}

</td>

                    {/* AI Assistant Modal trigger and logic will be here */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
  className={`bg-indigo-100 text-indigo-700 px-3 py-1 rounded hover:bg-indigo-200 text-xs font-medium `}
  onClick={() => handleOpenAIModal(submission)}
  disabled={aiModalLoading && aiModalSubmission?._id === submission._id}
>
  {aiModalLoading && aiModalSubmission?._id === submission._id ? 'Loading...' : 'Help'}
</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {!loading && !error && submissions.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                {renderPaginationInfo()}
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                      page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((num) => (
                    <button
                      key={num}
                      onClick={() => handlePageChange(num)}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                        page === num ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                      page === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Code View Modal */}
      {codeViewSubmission && (
        <CodeViewModal
            open={codeViewOpen}
            onClose={handleCloseCodeView}
            code={codeViewCode}
            language={codeViewSubmission.language}
            problemTitle={codeViewSubmission.problem?.title || ''}
            loading={codeViewLoading}
            error={codeViewError}
          />
      )}
      {/* AI Assistant Modal */}
      {aiModalSubmission && (
        <AIAssistantModal
          open={aiModalOpen}
          onClose={handleCloseAIModal}
          code={aiModalCode}
          language={aiModalSubmission.language}
          problemTitle={aiModalSubmission.problem?.title || ''}
          loading={aiModalLoading}
          error={aiModalError}
        />
      )}
    </div>
  );
};

export default Submissions;
