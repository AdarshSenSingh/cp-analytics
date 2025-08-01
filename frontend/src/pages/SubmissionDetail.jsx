import { useState, useEffect } from 'react';
import { fetchCodeforcesSubmissionCode } from '../services/codeforces';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { getAIResponse } from '../services/ai';

const SubmissionDetail = () => {
  const { id } = useParams();
  const { token, userId, currentUser } = useAuth();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState('');
  const [timeComplexity, setTimeComplexity] = useState('');
  const [spaceComplexity, setSpaceComplexity] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // AI analysis for wrong submissions
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState('');
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    fetchSubmission();
  }, [id, token]);

  const fetchSubmission = async () => {
    try {
      setLoading(true);
      console.log(`Fetching submission with ID: `);
      console.log(`Current user ID: `);
      const response = await axios.get(`/api/submissions/`, {
        headers: { 'x-auth-token': token }
      });
      console.log('Submission data:', response.data);
      // Convert both to strings for proper comparison
      const submissionUserId = response.data.user.toString();
      const currentUserId = userId.toString();
      console.log(`Comparing submission user:  with current user: `);
      if (submissionUserId !== currentUserId) {
        console.error('Authorization error: Submission belongs to another user');
        setError('You are not authorized to view this submission');
        setSubmission(null);
        return;
      }
      let sub = response.data;
      console.log('[DEBUG] SubmissionDetail fetched submission:', sub);
      // If code is missing, try to fetch from Codeforces
      if (
  sub.platform === 'codeforces' &&
  !sub.code &&
  sub.platformSubmissionId &&
  sub.problem && sub.problem.contestId
) {
  // Try to get handle from user profile
  let handle = null;
if (currentUser && Array.isArray(currentUser.platformAccounts)) {
  const cfAcc = currentUser.platformAccounts.find(acc => acc.platform === 'codeforces');
  if (cfAcc && cfAcc.username) handle = cfAcc.username;
}
if (!handle || !sub.problem.contestId || !sub.platformSubmissionId) {
        console.log('[DEBUG] Missing handle, contestId, or platformSubmissionId:', { handle, contestId: sub.problem.contestId, platformSubmissionId: sub.platformSubmissionId });
  sub.code = '// Cannot fetch code: missing contestId, submissionId, or handle. Please re-sync your account.';
} else {
  try {
    console.log('[DEBUG] Fetching code from Codeforces with:', { handle, contestId: sub.problem.contestId, platformSubmissionId: sub.platformSubmissionId });
        const code = await fetchCodeforcesSubmissionCode(handle, sub.problem.contestId, sub.platformSubmissionId);
    sub.code = code;
        console.log('[DEBUG] Code fetched from Codeforces:', code);
  } catch (err) {
    sub.code = '// Could not fetch code from Codeforces.';
        console.error('[DEBUG] Error fetching code from Codeforces:', err);
  }
}
}       
      } 
      catch (err) {
      setSubmission(sub);
      setNotes(sub.notes || '');
      setTimeComplexity(sub.timeComplexity || '');
      setSpaceComplexity(sub.spaceComplexity || '');
       console.error('Error fetching submission:', err);
      setError(err.response?.data?.msg || 'Failed to load submission details');
     
    } finally {
      setLoading(false);
    }
  }

  const handleSaveNotes = async () => {
    try {
      const response = await axios.put(`/api/submissions/${id}`, {
        notes,
        timeComplexity,
        spaceComplexity
      }, {
        headers: { 'x-auth-token': token }
      });
      
      setSubmission(response.data);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating submission:', err);
      setError('Failed to update submission');
    }
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
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getLanguageForHighlighter = (language) => {
    const languageMap = {
      'cpp': 'cpp',
      'c++': 'cpp',
      'c': 'c',
      'java': 'java',
      'python': 'python',
      'python3': 'python',
      'javascript': 'javascript',
      'js': 'javascript',
      'typescript': 'typescript',
      'ts': 'typescript',
      'go': 'go',
      'ruby': 'ruby',
      'rust': 'rust',
      'kotlin': 'kotlin',
      'swift': 'swift',
      'csharp': 'csharp',
      'c#': 'csharp'
    };
    
    return languageMap[language.toLowerCase()] || 'text';
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

  if (!submission) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-gray-900">Submission not found</h2>
        <p className="mt-2 text-gray-600">The submission you're looking for doesn't exist or you don't have permission to view it.</p>
        <button
          onClick={() => navigate('/submissions')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Back to Submissions
        </button>
      </div>
    );
  }

  // AI analysis handler
  const handleAICheck = async () => {
    setAiLoading(true);
    setAiError('');
    setAiFeedback('');
    try {
      const prompt = `Analyze the following code for the problem \"${submission.problem.title}\". The verdict was \"${submission.status}\".\n\nCode:\n${submission.code}\n\nExplain what is likely wrong, suggest improvements, and recommend 2-3 online resources (with links) to help fix the issue.`;
      const response = await getAIResponse(prompt, { max_tokens: 350 });
      setAiFeedback(response);
    } catch (err) {
      setAiError('Failed to get AI feedback. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Submission Details</h1>
        <button
          onClick={() => navigate('/submissions')}
          className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
        >
          Back to Submissions
        </button>
      </div>
      
      {/* Problem Info */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Problem: {submission.problem.title}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {submission.problem.platform} - {submission.problem.difficulty}
            </p>
          </div>
          <div className="flex gap-2">
  {submission.platform === 'codeforces' && submission.remote && submission.remote.contestId && submission.remote.submissionId && submission.problem ? (
    <>
      <a
        href={`https://codeforces.com/contest/${submission.remote.contestId}/submission/${submission.remote.submissionId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
      >
        View Submission
      </a>
      {submission.problem.contestId && submission.problem.index && (
        <a
          href={`https://codeforces.com/contest/${submission.problem.contestId}/problem/${submission.problem.index}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
        >
          View Problem
        </a>
      )}
    </>
  ) : (
    <span className="text-gray-400">No remote info</span>
  )}
</div>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(submission.status)}`}>
                  {formatStatus(submission.status)}
                </span>
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Language</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{submission.language}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Submitted At</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {new Date(submission.submittedAt).toLocaleString()}
              </dd>
            </div>
            {submission.timeTaken && (
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Time Taken</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{submission.timeTaken} ms</dd>
              </div>
            )}
            {submission.memoryUsed && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Memory Used</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{submission.memoryUsed} KB</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
      
      {/* Code */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Solution Code
          </h3>
          {/* AI check for wrong submissions */}
          {submission.status !== 'accepted' && (
            <button
              onClick={handleAICheck}
              className="ml-4 px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
              disabled={aiLoading}
            >
              {aiLoading ? 'Analyzing...' : 'Check what is wrong (AI)'}
            </button>
          )}
        </div>
        <div className="border-t border-gray-200 overflow-hidden">
          <SyntaxHighlighter 
            language={getLanguageForHighlighter(submission.language)} 
            style={vs2015}
            customStyle={{
              margin: 0,
              padding: '1rem',
              borderRadius: '0 0 0.375rem 0.375rem',
              fontSize: '0.875rem',
              lineHeight: '1.25rem'
            }}
          >
            {submission.code || '// No code available for this submission'}
{submission.platform === 'codeforces' && submission.remote && submission.remote.contestId && submission.remote.submissionId && submission.problem && (
  <div className="mt-2 text-xs text-gray-500">
    <a
      href={`https://codeforces.com/contest/${submission.remote.contestId}/submission/${submission.remote.submissionId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 underline mr-2"
    >
      View Submission
    </a>
    {submission.problem.contestId && submission.problem.index && (
      <a
        href={`https://codeforces.com/contest/${submission.problem.contestId}/problem/${submission.problem.index}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-green-600 underline"
      >
        View Problem
      </a>
    )}
  </div>
)}
          </SyntaxHighlighter>
        </div>
        {/* AI feedback section */}
        {submission.status !== 'accepted' && (
          <div className="p-4 border-t border-gray-100">
            {aiError && <div className="text-red-500 text-sm mb-2">{aiError}</div>}
            {aiFeedback && (
              <div className="bg-indigo-50 p-3 rounded text-sm whitespace-pre-wrap">
                <strong className="block text-indigo-700 mb-1">AI Feedback & Resources:</strong>
                {aiFeedback.split(/\n(?=https?:\/\/)/g).map((part, idx) => {
                  // If part starts with a link, render as link
                  const urlMatch = part.match(/(https?:\/\/[^\s]+)/);
                  if (urlMatch) {
                    return <div key={idx}><a href={urlMatch[1]} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">{urlMatch[1]}</a>{part.replace(urlMatch[1], '')}</div>;
                  }
                  return <div key={idx}>{part}</div>;
                })}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Notes and Analysis */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Notes and Analysis
          </h3>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Edit
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSaveNotes}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setNotes(submission.notes || '');
                  setTimeComplexity(submission.timeComplexity || '');
                  setSpaceComplexity(submission.spaceComplexity || '');
                }}
                className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Time Complexity</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={timeComplexity}
                    onChange={(e) => setTimeComplexity(e.target.value)}
                    placeholder="e.g., O(n), O(n log n)"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                ) : (
                  timeComplexity || 'Not specified'
                )}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Space Complexity</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={spaceComplexity}
                    onChange={(e) => setSpaceComplexity(e.target.value)}
                    placeholder="e.g., O(1), O(n)"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                ) : (
                  spaceComplexity || 'Not specified'
                )}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {isEditing ? (
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add your notes about this solution..."
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                ) : (
                  notes || 'No notes added'
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      
      {/* AI Analysis */}
      {submission.aiAnalysis && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              AI Analysis
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              {submission.aiAnalysis.strengths && submission.aiAnalysis.strengths.length > 0 && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Strengths</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <ul className="list-disc pl-5 space-y-1">
                      {submission.aiAnalysis.strengths.map((strength, index) => (
                        <li key={index}>{strength}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
              
              {submission.aiAnalysis.weaknesses && submission.aiAnalysis.weaknesses.length > 0 && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Areas for Improvement</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <ul className="list-disc pl-5 space-y-1">
                      {submission.aiAnalysis.weaknesses.map((weakness, index) => (
                        <li key={index}>{weakness}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
              
              {submission.aiAnalysis.optimizationTips && submission.aiAnalysis.optimizationTips.length > 0 && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Optimization Tips</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <ul className="list-disc pl-5 space-y-1">
                      {submission.aiAnalysis.optimizationTips.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
              
              {submission.aiAnalysis.conceptsUsed && submission.aiAnalysis.conceptsUsed.length > 0 && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Concepts Used</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div className="flex flex-wrap gap-2">
                      {submission.aiAnalysis.conceptsUsed.map((concept, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {concept}
                        </span>
                      ))}
                    </div>
                  </dd>
                </div>
              )}
              
              {submission.aiAnalysis.suggestedResources && submission.aiAnalysis.suggestedResources.length > 0 && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Suggested Resources</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <ul className="divide-y divide-gray-200">
                      {submission.aiAnalysis.suggestedResources.map((resource, index) => (
                        <li key={index} className="py-2">
                          <a 
                            href={resource.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            {resource.title}
                          </a>
                          <p className="text-xs text-gray-500 mt-1">
                            {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionDetail;

