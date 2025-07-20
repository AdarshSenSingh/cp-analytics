import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SparklesIcon, LightBulbIcon, BoltIcon } from "@heroicons/react/24/outline";

const tips = [
  'Break down problems into smaller subproblems.',
  'Practice consistently, not just occasionally.',
  'Debug with print statements or a debugger.',
  'Write pseudocode before jumping to code.',
  'Learn common data structures and algorithms.',
  'Don’t be afraid to look up hints after trying hard.',
  'Discuss with friends or online communities.',
  'Keep a notebook of mistakes and learnings.',
  'Time yourself to simulate real contests.',
  'Focus on understanding, not memorizing.'
];

const hacks = [
  'Use binary search for optimization problems.',
  'Hashmaps are great for quick lookups.',
  'Sliding window for subarray problems.',
  'Prefix sums for range queries.',
  'Greedy works when local optimum leads to global optimum.'
];

export default function Problems() {
  const navigate = useNavigate();

  const handleSheetChange = (e) => {
    const val = e.target.value;
    if (val) navigate(val);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-100 via-white to-green-100 py-12 px-2">
      <div className="w-full">
        {/* Hero Section */}
        <div className="relative bg-white/90 rounded-3xl shadow-2xl p-8 mb-10 flex flex-col items-center overflow-hidden">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-tr from-indigo-400 to-green-300 opacity-30 rounded-full blur-2xl animate-pulse" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-tr from-green-400 to-indigo-300 opacity-20 rounded-full blur-2xl animate-pulse" />
          <SparklesIcon className="w-12 h-12 text-indigo-500 mb-2 animate-bounce" />
          <h1 className="text-3xl md:text-4xl font-extrabold text-center text-indigo-800 mb-2 drop-shadow">🚀 Welcome to the Problem Solving Hub!</h1>
          <p className="mb-2 text-lg text-gray-700 text-center font-medium">
            Sharpen your skills, challenge yourself, and become a coding pro!
          </p>
          <p className="mb-0 text-base text-center font-semibold bg-gradient-to-r from-yellow-100 via-white to-green-100 border-2 border-indigo-200 rounded-lg px-4 py-2 shadow-md mt-2">
            <span>
              Choose a{' '}
              <a href="#sheet-select-section" className="text-indigo-700 underline font-bold cursor-pointer hover:text-green-600 transition-colors duration-150">
                problem sheet
              </a>
              {' '}below or get inspired by our tips and hacks.
            </span>
          </p>
        </div>
        {/* Railway Track Style Tips & Hacks */}
        <div className="mb-12 flex flex-col items-center w-full">
          {/* Tips Station */}
          <div className="flex items-center mb-4">
            <div className="flex flex-col items-center mr-4">
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg border-4 border-white z-10">
                <LightBulbIcon className="w-5 h-5 text-white" />
              </div>
              <div className="w-1 h-8 bg-yellow-300" />
            </div>
            <h2 className="font-bold text-xl text-indigo-700 bg-white px-4 py-2 rounded-lg shadow-md border-2 border-yellow-200">💡 Tips to Solve Problems</h2>
          </div>
          <div className="flex flex-row items-center w-full overflow-x-auto pb-6">
            <div className="flex flex-row items-center w-full relative">
              {/* Track */}
              <div className="absolute top-1/2 left-0 right-0 h-2 bg-gradient-to-r from-yellow-200 via-indigo-200 to-green-200 rounded-full z-0" style={{transform: 'translateY(-50%)'}} />
              {tips.map((tip, i) => (
                <div key={i} className="relative z-10 flex flex-col items-center mx-2 min-w-[220px]">
                  <div className="bg-white rounded-xl shadow-lg border-2 border-yellow-100 px-4 py-3 mb-2 flex items-center justify-center text-gray-700 font-medium text-base hover:scale-105 transition-transform duration-200">
                    {tip}
                  </div>
                  {/* Node on track */}
                  <div className="w-4 h-4 bg-yellow-400 border-4 border-white rounded-full -mt-2 shadow" />
                </div>
              ))}
            </div>
          </div>
          {/* Hacks Station */}
          <div className="flex items-center mb-4 mt-8">
            <div className="flex flex-col items-center mr-4">
              <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center shadow-lg border-4 border-white z-10">
                <BoltIcon className="w-5 h-5 text-white" />
              </div>
              <div className="w-1 h-8 bg-green-300" />
            </div>
            <h2 className="font-bold text-xl text-green-700 bg-white px-4 py-2 rounded-lg shadow-md border-2 border-green-200">🛠️ Quick Hacks</h2>
          </div>
          <div className="flex flex-row items-center w-full overflow-x-auto pb-6">
            <div className="flex flex-row items-center w-full relative">
              {/* Track */}
              <div className="absolute top-1/2 left-0 right-0 h-2 bg-gradient-to-r from-green-200 via-indigo-200 to-yellow-200 rounded-full z-0" style={{transform: 'translateY(-50%)'}} />
              {hacks.map((hack, i) => (
                <div key={i} className="relative z-10 flex flex-col items-center mx-2 min-w-[220px]">
                  <div className="bg-white rounded-xl shadow-lg border-2 border-green-100 px-4 py-3 mb-2 flex items-center justify-center text-gray-700 font-medium text-base hover:scale-105 transition-transform duration-200">
                    {hack}
                  </div>
                  {/* Node on track */}
                  <div className="w-4 h-4 bg-green-400 border-4 border-white rounded-full -mt-2 shadow" />
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Dropdown Card */}
        <div id="sheet-select-section" className="flex justify-center scroll-mt-32">
          <div className="bg-white/80 rounded-xl shadow-md px-6 py-4 flex flex-col items-center border border-indigo-100">
            <label htmlFor="sheet-select" className="mb-2 font-semibold text-indigo-700 text-lg">Open Sheet:</label>
            <select
              id="sheet-select"
              className="border-2 border-indigo-200 rounded-lg px-4 py-2 text-base focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all"
              defaultValue=""
              onChange={handleSheetChange}
            >
              <option value="" disabled>Select a sheet</option>
              <option value="/cses">CSES Problem set</option>
              <option value="/striver">Striver Sheet</option>
              <option value="/lovebabbar">Love Babber Sheet</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
