import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function getContestHistory() {
  return JSON.parse(localStorage.getItem('contestHistory') || '[]');
}

const ContestMain = () => {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setHistory(getContestHistory());
  }, []);

  return (
    <div className="space-y-10 w-full py-8 px-0 md:px-8">
      <div className="bg-gradient-to-br from-indigo-100/70 via-blue-50/80 to-purple-100/70 rounded-2xl shadow-xl border border-indigo-100 backdrop-blur-lg p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl text-indigo-400">📜</span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-indigo-900 tracking-wide drop-shadow">My Contest History</h1>
          </div>
          <button
            className="px-6 py-2 rounded-xl font-bold shadow bg-gradient-to-r from-indigo-500 to-blue-500 text-white border-2 border-indigo-200 hover:scale-105 hover:bg-indigo-600 transition"
            onClick={() => navigate('/contest/new')}
          >
            Schedule New Contest
          </button>
        </div>
        {history.length === 0 ? (
          <div className="py-10 text-center text-gray-500">No contests yet.</div>
        ) : (
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
                {history.map(contest => {
                  // Calculate score for this contest
                  const getProblemScore = (difficulty) => {
                    if (difficulty === 'hard') return 100;
                    if (difficulty === 'medium') return 75;
                    return 50;
                  };
                  let totalScore = 0;
                  let score = 0;
                  if (contest && contest.problems) {
                    totalScore = contest.problems.reduce((acc, p) => acc + getProblemScore(p.difficulty), 0);
                    // Try to get verdicts from localStorage (by contest id)
                    let verdicts = {};
                    try {
                      const stored = JSON.parse(localStorage.getItem('contestVerdicts') || '{}');
                      verdicts = stored[contest.id] || {};
                    } catch {}
                    score = contest.problems.reduce((acc, p) => {
                      const verdict = verdicts[p.platformId];
                      if (verdict === 'OK') {
                        return acc + getProblemScore(p.difficulty);
                      }
                      return acc;
                    }, 0);
                  }
                  return (
                    <tr key={contest.id} className="hover:bg-indigo-50/60 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-indigo-900 font-bold">{contest.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-indigo-700 font-semibold">{contest.duration} min</td>
                      <td className="px-6 py-4 whitespace-nowrap text-indigo-700 font-semibold">{contest.problems.length}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-indigo-700 font-semibold">{contest.startTimeStr}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-indigo-700 font-bold">{score} / {totalScore}</td>
                      <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                        <button
                          className="px-4 py-2 rounded-lg font-bold shadow bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-700 border-2 border-indigo-100 hover:bg-indigo-200 transition text-xs"
                          onClick={() => navigate(`/contest/${contest.id}`)}
                        >
                          View
                        </button>
                        <button
                          className="px-4 py-2 rounded-lg font-bold shadow bg-gradient-to-r from-green-100 to-green-200 text-green-700 border-2 border-green-200 hover:bg-green-200 transition text-xs"
                          onClick={() => {
                            // Create a new virtual contest with the same questions
                            try {
                              const history = JSON.parse(localStorage.getItem('contestHistory') || '[]');
                              // Generate a new unique contest ID
                              const newId = Date.now();
                              const now = Date.now();
                              const durationMs = (contest.duration || 30) * 60 * 1000;
                              const newContest = {
                                ...contest,
                                id: newId,
                                startTime: now,
                                endTime: now + durationMs,
                                startTimeStr: new Date(now).toLocaleString(),
                                submitted: false,
                              };
                              history.push(newContest);
                              localStorage.setItem('contestHistory', JSON.stringify(history));
                              // Optionally clear verdicts for new contest
                              const verdicts = JSON.parse(localStorage.getItem('contestVerdicts') || '{}');
                              verdicts[newId] = {};
                              localStorage.setItem('contestVerdicts', JSON.stringify(verdicts));
                              navigate(`/contest/${newId}`);
                            } catch {
                              // fallback: just reload original
                              navigate(`/contest/${contest.id}`);
                            }
                          }}
                        >
                          Reattempt
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContestMain;
