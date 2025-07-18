import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

function getContestById(id) {
  const history = JSON.parse(localStorage.getItem('contestHistory') || '[]');
  return history.find(c => String(c.id) === String(id));
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatTimeLeft(timeLeft) {
  const min = Math.floor(timeLeft / 60);
  const sec = timeLeft % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

function getStatusBadgeClass(verdict) {
  switch (verdict) {
    case 'OK':
      return 'bg-green-100 text-green-800';
    case 'WRONG_ANSWER':
      return 'bg-red-100 text-red-800';
    case 'TIME_LIMIT_EXCEEDED':
      return 'bg-yellow-100 text-yellow-800';
    case 'MEMORY_LIMIT_EXCEEDED':
      return 'bg-orange-100 text-orange-800';
    case 'RUNTIME_ERROR':
      return 'bg-purple-100 text-purple-800';
    case 'COMPILATION_ERROR':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-blue-100 text-blue-800';
  }
}

function formatStatus(verdict) {
  if (!verdict) return 'Pending';
  if (verdict === 'OK') return 'Accepted';
  return verdict.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

const ContestInstance = () => {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [showProblem, setShowProblem] = useState(null);
  const [handle, setHandle] = useState('');
  const [verdicts, setVerdicts] = useState({});
  const [verdictLoading, setVerdictLoading] = useState({}); // {platformId: boolean}
  const [verdictError, setVerdictError] = useState({}); // {platformId: string}
  const timerRef = useRef();

  useEffect(() => {
    const c = getContestById(contestId);
    if (!c) {
      navigate('/contest');
      return;
    }
    setContest(c);
    timerRef.current = setInterval(() => setNow(Date.now()), 1000);
    // Fetch handle from user profile
    (async () => {
      try {
        const resp = await authAPI.getCurrentUser();
        if (resp.data && resp.data.platformAccounts) {
          const cf = resp.data.platformAccounts.find(acc => acc.platform === 'codeforces');
          if (cf && cf.username) {
            setHandle(cf.username);
          } else {
            setHandle('');
          }
        } else {
          setHandle('');
        }
      } catch (e) {
        setHandle('');
      }
    })();
    return () => clearInterval(timerRef.current);
  }, [contestId, navigate]);

  // Fetch verdict for a single problem
  const fetchVerdict = async (problem) => {
    if (!handle) return;
    setVerdictLoading(v => ({ ...v, [problem.platformId]: true }));
    setVerdictError(e => ({ ...e, [problem.platformId]: '' }));
    try {
      const resp = await fetch(`https://codeforces.com/api/user.status?handle=${handle}`);
      const data = await resp.json();
      if (data.status === 'OK') {
        // Only consider submissions after contest start time
        const contestStartSec = Math.floor(contest.startTime / 1000);
        const found = data.result.find(sub => {
          if (!sub.problem) return false;
          const pid = String(sub.problem.contestId) + sub.problem.index;
          // Only accept submissions after contest start
          return pid === problem.platformId && sub.creationTimeSeconds >= contestStartSec;
        });
        setVerdicts(v => ({ ...v, [problem.platformId]: found ? found.verdict : undefined }));
        if (!found) {
          setVerdictError(e => ({ ...e, [problem.platformId]: 'Please submit code first.' }));
        }
      } else {
        setVerdictError(e => ({ ...e, [problem.platformId]: 'Failed to fetch verdict.' }));
      }
    } catch (e) {
      setVerdictError(er => ({ ...er, [problem.platformId]: 'Failed to fetch verdict.' }));
    } finally {
      setVerdictLoading(v => ({ ...v, [problem.platformId]: false }));
    }
  };

  if (!contest) return null;

  const contestStarted = now >= contest.startTime;
  const contestEnded = now >= contest.endTime;
  const timeLeft = Math.max(0, Math.floor((contest.endTime - now) / 1000));

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Contest #{contest.id}</h1>
        <div className="mb-2">Duration: {contest.duration} min</div>
        <div className="mb-2">Start Time: {new Date(contest.startTime).toLocaleString()}</div>
        <div className="mb-2">End Time: {new Date(contest.endTime).toLocaleString()}</div>
        {!handle && (
          <div className="mb-4 text-red-600 font-semibold">No Codeforces handle found in your profile. Please add it in your profile page.</div>
        )}
        {!contestStarted && (
          <div className="py-10 text-center text-gray-500">
            Contest scheduled. Waiting to start at {formatTime(new Date(contest.startTime))}...
          </div>
        )}
        {contestStarted && !contestEnded && showProblem === null && (
          <div className="mb-4">
            <span className="font-semibold">Time Left: </span>
            <span className="font-mono text-lg">{formatTimeLeft(timeLeft)}</span>
          </div>
        )}
        {contestStarted && !contestEnded && showProblem === null && (
          <>
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Problem</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statement</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verdict</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contest.problems.map((problem, idx) => (
                    <tr key={problem._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{problem.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{problem.difficulty}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <a
                          href={problem.url}
                          className="text-indigo-600 hover:text-indigo-900 underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Problem Statement
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {verdictLoading[problem.platformId] ? (
                          <span className="text-xs text-gray-500">Fetching...</span>
                        ) : verdicts[problem.platformId] ? (
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(verdicts[problem.platformId])}`}>
                            {formatStatus(verdicts[problem.platformId])}
                          </span>
                        ) : verdictError[problem.platformId] ? (
                          <span className="text-xs text-red-600">{verdictError[problem.platformId]}</span>
                        ) : (
                          <span className="text-xs text-gray-400">Not fetched</span>
                        )}
                        <button
                          className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 text-xs font-medium"
                          onClick={() => fetchVerdict(problem)}
                          disabled={verdictLoading[problem.platformId] || !handle}
                        >
                          Fetch Verdict
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 text-xs font-medium"
                          onClick={() => setShowProblem(idx)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-4">
              <button
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                onClick={() => {
                  // Mark contest as submitted in history
                  const history = JSON.parse(localStorage.getItem('contestHistory') || '[]');
                  const idx = history.findIndex(c => String(c.id) === String(contest.id));
                  if (idx !== -1) {
                    history[idx].submitted = true;
                    localStorage.setItem('contestHistory', JSON.stringify(history));
                  }
                  // Optionally show a message or redirect
                  window.location.href = '/contest';
                }}
              >
                Submit Contest
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                onClick={() => {
                  // Remove contest from history (exit)
                  const history = JSON.parse(localStorage.getItem('contestHistory') || '[]');
                  const newHistory = history.filter(c => String(c.id) !== String(contest.id));
                  localStorage.setItem('contestHistory', JSON.stringify(newHistory));
                  window.location.href = '/contest';
                }}
              >
                Exit Contest
              </button>
            </div>
          </>
        )}
        {contestStarted && !contestEnded && showProblem !== null && contest.problems[showProblem] && (
          <div className="max-w-2xl mx-auto bg-white shadow rounded-lg p-6 mt-8">
            <button onClick={() => setShowProblem(null)} className="mb-4 text-indigo-600 hover:underline">&larr; Back to Contest</button>
            <h2 className="text-xl font-bold mb-2">{contest.problems[showProblem].title}</h2>
            <div className="mb-2 text-sm text-gray-500">Difficulty: {contest.problems[showProblem].difficulty}</div>
            <div className="mb-4">
              <a href={contest.problems[showProblem].url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900 underline">View Problem Statement on Codeforces</a>
            </div>
            <div className="mb-4">
              <span className="font-semibold">Time Left: </span>
              <span className="font-mono text-lg">{formatTimeLeft(timeLeft)}</span>
            </div>
          </div>
        )}
        {contestEnded && (
          <div className="py-10 text-center text-green-600 font-bold">Contest Ended!</div>
        )}
      </div>
    </div>
  );
};

export default ContestInstance;
