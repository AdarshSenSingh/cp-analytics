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
    <div className="max-w-2xl mx-auto bg-white shadow rounded-lg p-6 mt-8">
      <button onClick={() => navigate('/contest')} className="mb-4 text-indigo-600 hover:underline">&larr; Back to Contest</button>
      <h2 className="text-xl font-bold mb-2">{problem.title}</h2>
      <div className="mb-2 text-sm text-gray-500">Difficulty: {problem.difficulty}</div>
      <div className="mb-4">
        <a href={problem.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900 underline">View Problem Statement on Codeforces</a>
      </div>
      <div className="mb-4">
        <span className="font-semibold">Time Left: </span>
        <span className="font-mono text-lg">{formatTimeLeft(timeLeft)}</span>
      </div>
    </div>
  );
};

export default ContestProblem;
