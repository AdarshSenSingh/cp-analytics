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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.map(contest => (
                  <tr key={contest.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{contest.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{contest.duration} min</td>
                    <td className="px-6 py-4 whitespace-nowrap">{contest.problems.length}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{contest.startTimeStr}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 text-xs font-medium"
                        onClick={() => navigate(`/contest/${contest.id}`)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContestMain;
