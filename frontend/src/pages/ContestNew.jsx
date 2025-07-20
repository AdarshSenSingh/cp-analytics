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
    <div className="max-w-lg mx-auto bg-gradient-to-br from-indigo-100/70 via-blue-50/80 to-purple-100/70 rounded-2xl shadow-xl border border-indigo-100 backdrop-blur-lg p-8 mt-8">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl text-indigo-400">🗓️</span>
        <h2 className="text-2xl font-extrabold text-indigo-900 tracking-wide drop-shadow">Schedule New Contest</h2>
      </div>
      <div className="mb-6 bg-white/80 rounded-xl p-6 shadow flex flex-col gap-6 border border-indigo-100">
        <div>
          <label className="block text-sm font-bold text-indigo-700 mb-2">Select Duration</label>
          <div className="flex flex-wrap gap-3 mb-2">
            {DURATION_OPTIONS.map(mins => (
              <button
                key={mins}
                type="button"
                disabled={Math.ceil(mins/30) > availableProblems}
                onClick={() => setDuration(mins)}
                className={`px-4 py-2 rounded-xl font-bold shadow border-2 transition-all text-sm flex items-center gap-2
                  ${duration === mins
                    ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white border-indigo-400 scale-105'
                    : 'bg-white/80 text-indigo-700 border-indigo-200 hover:bg-indigo-100'}
                  ${Math.ceil(mins/30) > availableProblems ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {mins} min
                <span className="ml-2 px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs shadow border border-indigo-200">
                  {Math.ceil(mins/30)} problems
                </span>
              </button>
            ))}
          </div>
          <div className="text-xs mt-1">
            <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 font-bold shadow border border-green-200">
              Unique problems available: {availableProblems}
            </span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-indigo-700 mb-2">Start Time <span className="font-normal text-gray-400">(optional)</span></label>
          <input
            type="time"
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
            className="block w-48 rounded-xl border-indigo-200 bg-white/80 shadow focus:border-indigo-400 focus:ring-indigo-400 sm:text-sm px-3 py-2"
          />
          <div className="text-xs text-gray-500 mt-1">Leave blank to start now</div>
        </div>
        {error && <div className="text-red-500 mb-2 font-bold">{error}</div>}
        <button
          onClick={handleSchedule}
          className="px-6 py-2 rounded-xl font-bold shadow bg-gradient-to-r from-indigo-500 to-blue-500 text-white border-2 border-indigo-200 hover:scale-105 hover:bg-indigo-600 transition"
          disabled={loading}
        >
          {loading ? 'Scheduling...' : 'Schedule Contest'}
        </button>
      </div>
    </div>
  );
};

export default ContestNew;
