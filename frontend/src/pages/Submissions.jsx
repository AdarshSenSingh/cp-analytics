import React, { useState, useEffect, useCallback } from 'react';
import AIAssistantModal from '../components/AIAssistantModal';
import CodeViewModal from '../components/CodeViewModal';
import axios from 'axios';
import { fetchCodeforcesSubmissionCode } from '../services/codeforces';
import { Link } from 'react-router-dom';
// No navigation to /submissions/:id for code view, only modal is used

const Submissions = () => {
  const [submissions, setSubmissions] = useState([]);
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
        setAIModalCode(code);
      } catch (err) {
        setAIModalError('Failed to fetch code from Codeforces.');
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
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">My Submissions</h1>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
        
        {/* Filters section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
            <select
              id="platform"
              name="platform"
              value={filter.platform}
              onChange={handleFilterChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">All Platforms</option>
              <option value="codeforces">Codeforces</option>
              {/* Add other platforms as needed */}
            </select>
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              id="status"
              name="status"
              value={filter.status}
              onChange={handleFilterChange}
              className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
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
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateChange}
              className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
            />
          </div>
          
          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              id="sort"
              name="sort"
              value={sort}
              onChange={handleSortChange}
              className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
        
        <div className="md:self-end">
          <button
            onClick={handleApplyFilters}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
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
                {submissions.map((submission) => (
                  <tr key={submission._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        <Link to={`/problems/${submission.problem._id}`} className="hover:text-indigo-600">
                          {submission.problem.title}
                        </Link>
                      </div>
                      <div className="text-sm text-gray-500">
                        {submission.problem.difficulty}
                      </div>
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
  onClick={async () => {
    if (submission.platform === 'codeforces') {
      setAIModalSubmission(submission);
      setAIModalOpen(false);
      setAIModalError('');
      setAIModalCode('');
      setAIModalLoading(true);
      try {
        // Try to get handle from remote or fallback
        const handle = submission.remote?.handle || 'your_handle';
        const contestId = submission.remote?.contestId || submission.problem?.contestId;
        const submissionId = submission.remote?.submissionId || submission.platformSubmissionId;
        if (!contestId || !submissionId) {
          setAIModalError('Missing contestId or submissionId for this Codeforces submission.');
          setAIModalOpen(true);
          setAIModalLoading(false);
          return;
        }
        // Try to fetch code from new backend endpoint (greedy fetch)
        let code = '';
        try {
          const url = `https://codeforces.com/contest/${contestId}/submission/${submissionId}`;
          const resp = await axios.post('/api/codeforces/code', { url });
          code = resp.data.code || '';
        } catch (e) {
          code = '';
        }
        setAIModalCode(code || '//no code available');
        setAIModalOpen(true);
      } catch (err) {
        setAIModalError('Failed to fetch code from Codeforces.');
        setAIModalOpen(true);
      } finally {
        setAIModalLoading(false);
      }
    } else {
      handleOpenAIModal(submission);
    }
  }}
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
