import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { problemsAPI } from '../services/api';
import axios from 'axios';
import { fetchCodeforcesVerdict } from '../services/contest';

const POLL_INTERVAL = 10000; // 10 seconds
const DURATION_OPTIONS = [30, 60, 90, 120, 150, 180]; // in minutes

function getRandomUniqueProblems(problems, count) {
  const shuffled = [...problems].sort(() => 0.5 - Math.random());
  const unique = [];
  const seen = new Set();
  for (const p of shuffled) {
    if (!seen.has(p.contestId + '-' + p.index)) {
      unique.push(p);
      seen.add(p.contestId + '-' + p.index);
    }
    if (unique.length === count) break;
  }
  return unique;
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function ProblemStatement({ problem, duration, onBack, contestEnd }) {
  const [timeLeft, setTimeLeft] = useState(Math.max(0, Math.floor((contestEnd - Date.now()) / 1000)));
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(Math.max(0, Math.floor((contestEnd - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(timer);
  }, [contestEnd, timeLeft]);
  const min = Math.floor(timeLeft / 60);
  const sec = timeLeft % 60;
  return (
    <div className="max-w-2xl mx-auto bg-white shadow rounded-lg p-6 mt-8">
      <button onClick={onBack} className="mb-4 text-indigo-600 hover:underline">&larr; Back to Contest</button>
      <h2 className="text-xl font-bold mb-2">{problem.title}</h2>
      <div className="mb-2 text-sm text-gray-500">Difficulty: {problem.difficulty}</div>
      <div className="mb-4">
        <a href={problem.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900 underline">View Problem Statement on Codeforces</a>
      </div>
      <div className="mb-4">
        <span className="font-semibold">Time Left: </span>
        <span className="font-mono text-lg">{min}:{sec.toString().padStart(2, '0')}</span>
      </div>
      {/* Optionally add more problem details here */}
    </div>
  );
}

const Contest = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verdicts, setVerdicts] = useState({});
  const [duration, setDuration] = useState(60); // default 1hr
  const [startTime, setStartTime] = useState('');
  const [scheduled, setScheduled] = useState(false);
  const [contestStarted, setContestStarted] = useState(false);
  const [contestEnd, setContestEnd] = useState(null);
  const [showProblem, setShowProblem] = useState(null); // index of problem to show
  const pollRef = useRef();

  // Fetch unique random problems from user's solved problems
  const fetchProblems = async (numProblems) => {
    setLoading(true);
    setError('');
    try {
      const res = await problemsAPI.getSolvedProblems();
      const allProblems = res.data.problems || res.data || [];
      const uniqueProblems = getRandomUniqueProblems(allProblems, numProblems);
      setProblems(uniqueProblems);
    } catch (err) {
      setError('Failed to load contest problems.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch verdicts for all problems
  const fetchVerdicts = async (problemsList) => {
    if (!problemsList || problemsList.length === 0) return;
    try {
      const token = localStorage.getItem('token');
      const ids = problemsList.map((p) => p._id);
      const res = await axios.post(
        '/api/contest/verdicts',
        { problemIds: ids },
        { headers: { 'x-auth-token': token } }
      );
      setVerdicts(res.data.verdicts || {});
    } catch (err) {
      // Optionally handle error
    }
  };

  // Poll verdicts automatically
  useEffect(() => {
    if (problems.length === 0) return;
    fetchVerdicts(problems);
    pollRef.current = setInterval(() => {
      fetchVerdicts(problems);
    }, POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [problems]);

  // Contest scheduling logic
  const handleSchedule = () => {
    const now = new Date();
    let start;
    if (startTime) {
      start = new Date();
      const [h, m] = startTime.split(":");
      start.setHours(parseInt(h, 10));
      start.setMinutes(parseInt(m, 10));
      start.setSeconds(0);
      if (start < now) start.setDate(start.getDate() + 1); // next day if time passed
    } else {
      start = now;
    }
    const end = new Date(start.getTime() + duration * 60000);
    setContestEnd(end.getTime());
    setScheduled(true);
    setContestStarted(false);
    setShowProblem(null);
    fetchProblems(Math.ceil(duration / 30));
    // Start contest at the scheduled time
    const delay = start - now;
    setTimeout(() => {
      setContestStarted(true);
    }, delay > 0 ? delay : 0);
  };

  useEffect(() => {
    // Reset contest state if duration or startTime changes
    setScheduled(false);
    setContestStarted(false);
    setShowProblem(null);
  }, [duration, startTime]);

  const getStatusBadgeClass = (verdict) => {
    switch (verdict) {
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
    if (!status) return 'Pending';
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Main contest UI
  return (
    <div className="space-y-10 w-full py-8 px-0 md:px-8">
      {/* Contest History Section */}
      <div className="bg-gradient-to-br from-indigo-100/70 via-blue-50/80 to-purple-100/70 rounded-2xl shadow-xl border border-indigo-100 backdrop-blur-lg p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl text-indigo-400">📜</span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-indigo-900 tracking-wide drop-shadow">My Contest History</h1>
          </div>
          <button
            className="px-6 py-2 rounded-xl font-bold shadow bg-gradient-to-r from-indigo-500 to-blue-500 text-white border-2 border-indigo-200 hover:scale-105 hover:bg-indigo-600 transition"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Schedule New Contest
          </button>
        </div>
        {/* Contest History Table (replace with dynamic data) */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-indigo-100 bg-white/80 rounded-xl shadow">
            <thead className="bg-white/60">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Contest ID</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Problems</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Start Time</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white/80 divide-y divide-indigo-50">
              {/* Example static data, replace with dynamic mapping */}
              {[{
                id: 1, duration: '30 min', problems: 1, start: '7/18/2025, 9:54:03 AM', score: '0 / 50'
              }, {
                id: 3, duration: '30 min', problems: 1, start: '7/18/2025, 9:58:22 AM', score: '0 / 75'
              }, {
                id: 4, duration: '60 min', problems: 2, start: '7/18/2025, 10:30:42 AM', score: '0 / 175'
              }, {
                id: 5, duration: '60 min', problems: 2, start: '7/18/2025, 10:32:40 AM', score: '0 / 175'
              }, {
                id: 6, duration: '90 min', problems: 3, start: '7/18/2025, 12:59:56 PM', score: '0 / 225'
              }].map((row, idx) => (
                <tr key={row.id} className="hover:bg-indigo-50/60 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-indigo-900 font-bold">{row.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-indigo-700 font-semibold">{row.duration}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-indigo-700 font-semibold">{row.problems}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-indigo-700 font-semibold">{row.start}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-indigo-700 font-bold">{row.score}</td>
                  <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                    <button
                      className="px-4 py-2 rounded-lg font-bold shadow bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-700 border-2 border-indigo-100 hover:bg-indigo-200 transition text-xs"
                    >
                      View
                    </button>
                    <button
                      className="px-4 py-2 rounded-lg font-bold shadow bg-gradient-to-r from-green-100 to-green-200 text-green-700 border-2 border-green-200 hover:bg-green-200 transition text-xs"
                    >
                      Reattempt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Main Contest Section */}
      <div className="bg-gradient-to-br from-indigo-100/70 via-blue-50/80 to-purple-100/70 rounded-2xl shadow-xl border border-indigo-100 backdrop-blur-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl text-indigo-400">🏆</span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-indigo-900 tracking-wide drop-shadow">My Contest</h1>
        </div>
        {/* Scheduling UI */}
        {!scheduled && (
          <div className="mb-8 bg-white/80 rounded-xl p-6 shadow flex flex-col md:flex-row md:items-end gap-6 border border-indigo-100">
            <div>
              <label className="block text-sm font-bold text-indigo-700 mb-1">Select Duration</label>
              <select
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
                className="block w-48 rounded-xl border-indigo-200 bg-white/80 shadow focus:border-indigo-400 focus:ring-indigo-400 sm:text-sm px-3 py-2"
              >
                {DURATION_OPTIONS.map(mins => (
                  <option key={mins} value={mins}>{mins} min ({Math.ceil(mins/30)} problems)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-indigo-700 mb-1">Start Time (optional)</label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="block w-48 rounded-xl border-indigo-200 bg-white/80 shadow focus:border-indigo-400 focus:ring-indigo-400 sm:text-sm px-3 py-2"
              />
              <div className="text-xs text-gray-500 mt-1">Leave blank to start now</div>
            </div>
            <button
              onClick={handleSchedule}
              className="px-6 py-2 rounded-xl font-bold shadow bg-gradient-to-r from-indigo-500 to-blue-500 text-white border-2 border-indigo-200 hover:scale-105 hover:bg-indigo-600 transition mt-4 md:mt-0"
            >
              Schedule Contest
            </button>
          </div>
        )}
        {/* Waiting for contest to start */}
        {scheduled && !contestStarted && (
          <div className="py-10 text-center text-indigo-500 font-semibold text-lg">
            Contest scheduled. Waiting to start at {startTime ? startTime : formatTime(new Date())}...
          </div>
        )}
        {/* Contest in progress: show problems table or problem statement */}
        {contestStarted && showProblem === null && (
          loading ? (
            <div className="py-10 text-center text-gray-500">Loading problems...</div>
          ) : error ? (
            <div className="py-10 text-center text-red-500">{error}</div>
          ) : problems.length === 0 ? (
            <div className="py-10 text-center text-gray-500">No contest problems found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-indigo-100 bg-white/80 rounded-xl shadow">
                <thead className="bg-white/60">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Problem</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Difficulty</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Statement</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white/80 divide-y divide-indigo-50">
                  {problems.map((problem, idx) => (
                    <tr key={problem._id} className="hover:bg-indigo-50/60 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-indigo-900">{problem.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-3 py-1 rounded-full font-bold shadow text-xs ${
                          problem.difficulty === 'hard' ? 'bg-red-100 text-red-700' :
                          problem.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {problem.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-700 font-bold">
                        {problem.difficulty === 'hard' ? 100 : problem.difficulty === 'medium' ? 75 : 50}
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
                        <span className={`px-3 py-1 rounded-full font-bold shadow text-xs ${getStatusBadgeClass(verdicts[problem._id])}`}>
                          {formatStatus(verdicts[problem._id])}
                        </span>
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
          )
        )}
        {/* Problem statement page */}
        {contestStarted && showProblem !== null && problems[showProblem] && (
          <ProblemStatement
            problem={problems[showProblem]}
            duration={duration}
            contestEnd={contestEnd}
            onBack={() => setShowProblem(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Contest;
