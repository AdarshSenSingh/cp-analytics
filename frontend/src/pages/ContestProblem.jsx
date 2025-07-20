import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { problemsAPI } from '../services/api';

function formatTimeLeft(timeLeft) {
  const min = Math.floor(timeLeft / 60);
  const sec = timeLeft % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

const ContestProblem = () => {
  const { contestId, problemIdx } = useParams();
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [problem, setProblem] = useState(null);
  const [contestEnd, setContestEnd] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  // Load contest state from localStorage
  useEffect(() => {
    const contestData = JSON.parse(localStorage.getItem('contestState'));
    if (!contestData || !contestData.problems || !contestData.contestEnd) {
      navigate('/contest');
      return;
    }
    setProblems(contestData.problems);
    setContestEnd(contestData.contestEnd);
    const idx = parseInt(problemIdx, 10);
    if (contestData.problems[idx]) {
      setProblem(contestData.problems[idx]);
    } else {
      navigate('/contest');
    }
  }, [problemIdx, navigate]);

  // Countdown timer
  useEffect(() => {
    if (!contestEnd) return;
    const update = () => {
      const left = Math.max(0, Math.floor((contestEnd - Date.now()) / 1000));
      setTimeLeft(left);
      if (left <= 0) {
        // Optionally auto-redirect when contest ends
      }
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [contestEnd]);

  if (!problem) return null;

  return (
    <div className="max-w-2xl mx-auto bg-gradient-to-br from-indigo-100/70 via-blue-50/80 to-purple-100/70 rounded-2xl shadow-xl border border-indigo-100 backdrop-blur-lg p-8 mt-8">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate('/contest')} className="text-indigo-600 hover:underline font-bold text-lg flex items-center gap-1">
          <span className="text-2xl">←</span> Back to Contest
        </button>
      </div>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl text-indigo-400">📄</span>
        <h2 className="text-xl md:text-2xl font-extrabold text-indigo-900 tracking-wide drop-shadow">{problem.title}</h2>
      </div>
      <div className="mb-4 flex flex-wrap gap-3 items-center">
        <span className={`px-4 py-1 rounded-full font-bold shadow text-sm border ${
          problem.difficulty === 'hard' ? 'bg-red-100 text-red-700 border-red-200' :
          problem.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
          'bg-green-100 text-green-700 border-green-200'
        }`}>
          Difficulty: {problem.difficulty}
        </span>
        <a
          href={problem.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-1 rounded-full font-bold shadow bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-700 border-2 border-indigo-200 hover:bg-indigo-200 transition text-sm"
        >
          View Problem Statement on Codeforces
        </a>
      </div>
      <div className="mb-2 flex items-center gap-2">
        <span className="inline-flex items-center px-4 py-1 rounded-full bg-green-100 text-green-700 font-bold text-lg shadow border border-green-200">
          Time Left: <span className="ml-2 font-mono">{formatTimeLeft(timeLeft)}</span>
        </span>
      </div>
    </div>
  );
};

export default ContestProblem;
