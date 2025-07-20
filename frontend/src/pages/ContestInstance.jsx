import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import AIAssistantModal from '../components/AIAssistantModal';

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

function getProblemScore(difficulty) {
  if (difficulty === 'hard') return 100;
  if (difficulty === 'medium') return 75;
  return 50;
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
  // AI Assistant Modal state
  const [aiModalOpen, setAIModalOpen] = useState(false);
  const [aiModalProblem, setAIModalProblem] = useState(null);
  // Local state to end contest without reload
  const [forceContestEnd, setForceContestEnd] = useState(false);

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
  const contestEnded = forceContestEnd || now >= contest.endTime;
  const timeLeft = Math.max(0, Math.floor((contest.endTime - now) / 1000));

  // Calculate score and percentage after contest ends
  let score = 0;
  let totalScore = 0;
  if (contest && contest.problems) {
    totalScore = contest.problems.reduce((acc, p) => acc + getProblemScore(p.difficulty), 0);
    score = contest.problems.reduce((acc, p) => {
      const verdict = verdicts[p.platformId];
      if (verdict === 'OK') {
        return acc + getProblemScore(p.difficulty);
      }
      return acc;
    }, 0);
  }
  const percentage = totalScore > 0 ? ((score / totalScore) * 100).toFixed(2) : '0.00';

  return (
    <div className="space-y-10 w-full py-8 px-0 md:px-8">
      <div className="bg-gradient-to-br from-indigo-100/70 via-blue-50/80 to-purple-100/70 rounded-2xl shadow-xl border border-indigo-100 backdrop-blur-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl text-indigo-400">🏆</span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-indigo-900 tracking-wide drop-shadow">Contest #{contest.id}</h1>
        </div>
        <div className="flex flex-wrap gap-4 mb-6">
          <span className="inline-flex items-center px-4 py-1 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm shadow border border-indigo-200">
            Duration: {contest.duration} min
          </span>
          <span className="inline-flex items-center px-4 py-1 rounded-full bg-blue-100 text-blue-700 font-bold text-sm shadow border border-blue-200">
            Start Time: {new Date(contest.startTime).toLocaleString()}
          </span>
          <span className="inline-flex items-center px-4 py-1 rounded-full bg-purple-100 text-purple-700 font-bold text-sm shadow border border-purple-200">
            End Time: {new Date(contest.endTime).toLocaleString()}
          </span>
        </div>
        {!handle && (
          <div className="mb-4 text-red-600 font-semibold">No Codeforces handle found in your profile. Please add it in your profile page.</div>
        )}
        {!contestStarted && (
          <div className="py-10 text-center text-indigo-500 font-semibold text-lg">
            Contest scheduled. Waiting to start at {formatTime(new Date(contest.startTime))}...
          </div>
        )}
        {contestStarted && !contestEnded && showProblem === null && (
          <div className="mb-6 flex flex-wrap gap-4 items-center">
            <span className="inline-flex items-center px-4 py-1 rounded-full bg-green-100 text-green-700 font-bold text-lg shadow border border-green-200">
              Time Left: <span className="ml-2 font-mono">{formatTimeLeft(timeLeft)}</span>
            </span>
            <span className="inline-flex items-center px-4 py-1 rounded-full bg-indigo-100 text-indigo-700 font-bold text-lg shadow border border-indigo-200">
              Total Score for this Contest: {totalScore}
            </span>
          </div>
        )}
        {contestStarted && !contestEnded && showProblem === null && (
          <>
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full divide-y divide-indigo-100 bg-white/80 rounded-xl shadow">
                <thead className="bg-white/60">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Problem</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Difficulty</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Statement</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Verdict</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white/80 divide-y divide-indigo-50">
                  {contest.problems.map((problem, idx) => (
                    <tr key={problem._id} className="hover:bg-indigo-50/60 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-indigo-900 font-bold">{problem.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-3 py-1 rounded-full font-bold shadow text-xs ${
                          problem.difficulty === 'hard' ? 'bg-red-100 text-red-700' :
                          problem.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {problem.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-indigo-700 font-bold">
                        {getProblemScore(problem.difficulty)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <a
                          href={problem.url}
                          className="text-indigo-600 hover:text-indigo-900 underline font-bold"
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
                          <span className={`px-3 py-1 rounded-full font-bold shadow text-xs ${getStatusBadgeClass(verdicts[problem.platformId])}`}>
                            {formatStatus(verdicts[problem.platformId])}
                          </span>
                        ) : verdictError[problem.platformId] ? (
                          <span className="text-xs text-red-600">{verdictError[problem.platformId]}</span>
                        ) : (
                          <span className="text-xs text-gray-400">Not fetched</span>
                        )}
                        <button
                          className="ml-2 px-3 py-1 rounded-lg font-bold shadow bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-700 border-2 border-indigo-100 hover:bg-indigo-200 transition text-xs"
                          onClick={() => fetchVerdict(problem)}
                          disabled={verdictLoading[problem.platformId] || !handle}
                        >
                          Fetch Verdict
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          className="px-4 py-2 rounded-lg font-bold shadow bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-700 border-2 border-indigo-100 hover:bg-indigo-200 transition text-xs"
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
            <div className="flex gap-4 mt-6">
              <button
                className="px-6 py-2 rounded-xl font-bold shadow bg-gradient-to-r from-green-500 to-green-400 text-white border-2 border-green-200 hover:scale-105 hover:bg-green-600 transition"
                onClick={() => {
                  // Mark contest as submitted in history
                  const history = JSON.parse(localStorage.getItem('contestHistory') || '[]');
                  const idx = history.findIndex(c => String(c.id) === String(contest.id));
                  if (idx !== -1) {
                    history[idx].submitted = true;
                    localStorage.setItem('contestHistory', JSON.stringify(history));
                  }
                  setForceContestEnd(true);
                }}
                disabled={forceContestEnd}
              >
                Submit Contest
              </button>
              <button
                className="px-6 py-2 rounded-xl font-bold shadow bg-gradient-to-r from-red-500 to-red-400 text-white border-2 border-red-200 hover:scale-105 hover:bg-red-600 transition"
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
          <div className="py-10 text-center text-green-600 font-bold">
            <div className="mb-4 text-2xl">Contest Ended!</div>
            <div className="mb-2 text-lg text-gray-900">Score: {score} / {totalScore}</div>
            <div className="mb-2 text-lg text-gray-900">Percentage: {percentage}%</div>
            <button
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              onClick={() => setAIModalOpen(true)}
            >
              Want to improve performance?
            </button>
            <button
              className="mt-4 ml-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              onClick={() => navigate('/contest')}
            >
              Return to Contest Home
            </button>
            {aiModalOpen && (
              <AIAssistantModal
                open={aiModalOpen}
                onClose={() => setAIModalOpen(false)}
                code={''}
                language={''}
                problemTitle={'Contest Performance'}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContestInstance;
