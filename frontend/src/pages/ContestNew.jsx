import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { problemsAPI } from '../services/api';

const DURATION_OPTIONS = [30, 60, 90, 120, 150, 180];

function getNextContestId() {
  // Always assign the next contest ID as one greater than the highest in history (no gaps)
  const history = JSON.parse(localStorage.getItem('contestHistory') || '[]');
  if (history.length === 0) return 1;
  const maxId = Math.max(...history.map(c => Number(c.id)));
  return maxId + 1;
}

function getContestHistory() {
  return JSON.parse(localStorage.getItem('contestHistory') || '[]');
}

function saveContestHistory(history) {
  localStorage.setItem('contestHistory', JSON.stringify(history));
}

const ContestNew = () => {
  const [duration, setDuration] = useState(60);
  const [startTime, setStartTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [availableProblems, setAvailableProblems] = useState(0);

  // Fetch available unique problems on mount
  React.useEffect(() => {
    (async () => {
      const res = await problemsAPI.getSolvedProblems();
      const allProblems = res.data.problems || res.data || [];
      console.log('[ContestNew] All problems from API:', allProblems);
      const seen = new Set();
      allProblems.forEach((p, i) => {
        const key = p.platformId;
        console.log(`[ContestNew] Problem #${i}:`, p, 'Unique key:', key);
        seen.add(key);
      });
      setAvailableProblems(seen.size);
      console.log('[ContestNew] Unique problem keys:', Array.from(seen));
      console.log('[ContestNew] Unique problem count:', seen.size);
    })();
  }, []);

  const handleSchedule = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await problemsAPI.getSolvedProblems();
      const allProblems = res.data.problems || res.data || [];
      const numProblems = Math.ceil(duration / 30);
      const shuffled = [...allProblems].sort(() => 0.5 - Math.random());
      const unique = [];
      const seen = new Set();
      for (const p of shuffled) {
        if (!seen.has(p.platformId)) {
          unique.push(p);
          seen.add(p.platformId);
        }
        if (unique.length === numProblems) break;
      }
      if (unique.length !== numProblems) {
        setError(`Not enough unique problems for the selected duration (${numProblems} needed, ${availableProblems} available).`);
        setLoading(false);
        return;
      }
      const contestId = getNextContestId();
      const now = new Date();
      let start;
      if (startTime) {
        start = new Date();
        const [h, m] = startTime.split(":");
        start.setHours(parseInt(h, 10));
        start.setMinutes(parseInt(m, 10));
        start.setSeconds(0);
        if (start < now) start.setDate(start.getDate() + 1);
      } else {
        start = now;
      }
      const end = new Date(start.getTime() + duration * 60000);
      const contest = {
        id: contestId,
        duration,
        startTime: start.getTime(),
        startTimeStr: start.toLocaleString(),
        endTime: end.getTime(),
        problems: unique
      };
      // Save to history
      const history = getContestHistory();
      history.push(contest);
      saveContestHistory(history);
      // Save current contest state for the contest page
      localStorage.setItem('currentContest', JSON.stringify(contest));
      navigate(`/contest/${contestId}`);
    } catch (err) {
      setError('Failed to schedule contest.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white shadow rounded-lg p-6 mt-8">
      <h2 className="text-xl font-bold mb-4">Schedule New Contest</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Duration</label>
        <select
          value={duration}
          onChange={e => setDuration(Number(e.target.value))}
          className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          {DURATION_OPTIONS.map(mins => (
            <option key={mins} value={mins} disabled={Math.ceil(mins/30) > availableProblems}>
              {mins} min ({Math.ceil(mins/30)} problems)
            </option>
          ))}
        </select>
        <div className="text-xs text-gray-500 mt-1">
          Unique problems available: {availableProblems}
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Start Time (optional)</label>
        <input
          type="time"
          value={startTime}
          onChange={e => setStartTime(e.target.value)}
          className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        <div className="text-xs text-gray-500 mt-1">Leave blank to start now</div>
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <button
        onClick={handleSchedule}
        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        disabled={loading}
      >
        {loading ? 'Scheduling...' : 'Schedule Contest'}
      </button>
    </div>
  );
};

export default ContestNew;
