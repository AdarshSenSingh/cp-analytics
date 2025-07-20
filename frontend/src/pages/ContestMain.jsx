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
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">My Contest History</h1>
        <button
          className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          onClick={() => navigate('/contest/new')}
        >
          Schedule New Contest
        </button>
        {history.length === 0 ? (
          <div className="py-10 text-center text-gray-500">No contests yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contest ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Problems</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
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
                    <tr key={contest.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{contest.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{contest.duration} min</td>
                      <td className="px-6 py-4 whitespace-nowrap">{contest.problems.length}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{contest.startTimeStr}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{score} / {totalScore}</td>
                      <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                        <button
                          className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 text-xs font-medium"
                          onClick={() => navigate(`/contest/${contest.id}`)}
                        >
                          View
                        </button>
                        <button
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs font-medium"
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
