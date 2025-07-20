import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AIImprovementModal from '../components/AIImprovementModal';
import ProfilePopup from '../components/ProfilePopup';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, LineElement, BarElement, PointElement, Title, Tooltip, Legend, Filler, ArcElement } from 'chart.js';
import { analyticsAPI, platformsAPI } from '../services/api';

Chart.register(CategoryScale, LinearScale, LineElement, BarElement, PointElement, Title, Tooltip, Legend, Filler, ArcElement);

// --- Creative Dynamic Components ---
const Confetti = ({ show }) => show ? (
  <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
    {[...Array(60)].map((_, i) => (
      <div
        key={i}
        className="absolute rounded-full opacity-80 animate-confetti"
        style={{
          width: `${Math.random() * 8 + 4}px`,
          height: `${Math.random() * 8 + 4}px`,
          background: `hsl(${Math.random() * 360}, 90%, 60%)`,
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          animationDuration: `${Math.random() * 1.5 + 1}s`,
        }}
      />
    ))}
  </div>
) : null;

const AnimatedCounter = ({ value, duration = 1200, className = "" }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value || 0;
    if (start === end) return;
    let increment = end / (duration / 16);
    let raf;
    const animate = () => {
      start += increment;
      if ((increment > 0 && start >= end) || (increment < 0 && start <= end)) {
        setCount(end);
        return;
      }
      setCount(Math.round(start));
      raf = requestAnimationFrame(animate);
    };
    animate();
    return () => raf && cancelAnimationFrame(raf);
  }, [value, duration]);
  return <span className={className}>{count}</span>;
};

const ProgressRing = ({ percent, size = 80, stroke = 8, color = '#6366f1', bg = '#e0e7ef', label = '' }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <svg width={size} height={size} className="block mx-auto">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={bg} strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={c} strokeDashoffset={offset} style={{transition:'stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)'}} />
      <text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize={size/4} fill={color} fontWeight="bold">{label}</text>
    </svg>
  );
};

const style = document.createElement('style');
style.innerHTML = `
@keyframes confetti {
  0% { transform: translateY(0) scale(1); opacity: 1; }
  100% { transform: translateY(200px) scale(0.7); opacity: 0; }
}
.animate-confetti { animation: confetti linear forwards; }
@keyframes pop { 0% { transform: scale(0.7); } 60% { transform: scale(1.2); } 100% { transform: scale(1); } }
.animate-pop { animation: pop 0.5s cubic-bezier(.68,-0.55,.27,1.55); }
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
.animate-fade-in { animation: fade-in 0.3s; }
`;
document.head.appendChild(style);

const Dashboard = () => {

  useEffect(() => {
    setTip(tips[Math.floor(Math.random() * tips.length)]);
  }, []);

  const [kpis, setKpis] = useState({
    currentRating: 'N/A',
    maxRating: 'N/A',
    bestRank: 'N/A',
    streak: 0,
    avgSolveTime: 'N/A',
    wrongRate: 'N/A',
  });
 
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [tip, setTip] = useState('');
  const tips = [
    "Tip of the day: Practice makes perfect: solve at least one problem every day!",
    "Tip of the day: Read problem statements carefully before coding.",
    "Tip of the day: Did you know? You can optimize your code by reducing time complexity!",
    "Tip of the day: Don't be afraid to ask for help when you need it.",
    "Tip of the day: Don't forget to check out the community forums for help and support.",
    "Tip of the day: Keep practicing and improving your skills!",
    "Tip of the day: Don't be afraid to ask for help"
  ];
  const [stats, setStats] = useState(null);
  const [submissionActivity, setSubmissionActivity] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [showProfilePopup,setShowProfilePopup]=useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [showAIImprovement, setShowAIImprovement] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activityDateRange, setActivityDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Target/Goal Section State
  const [targetType, setTargetType] = useState('problems'); // 'problems' or 'contest'
  const [targetValue, setTargetValue] = useState(3); // default 3 problems
  const [targetSet, setTargetSet] = useState(false);
  const [targetCompleted, setTargetCompleted] = useState(false);
  const [problemsSolvedToday, setProblemsSolvedToday] = useState(0);
  const [contestGiven, setContestGiven] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Dynamic motivational messages
  const motivationalMessages = [
    "Keep pushing! You're almost there!",
    "Great job! Stay consistent.",
    "Every step counts. Finish strong!",
    "You can do it!",
    "Amazing effort!"
  ];
  function getMotivation(percent) {
    if (percent >= 100) return "Target achieved! 🎉";
    if (percent >= 80) return motivationalMessages[1];
    if (percent >= 50) return motivationalMessages[0];
    if (percent > 0) return motivationalMessages[2];
    return motivationalMessages[3];
  }

  // Track problems solved today from stats
  useEffect(() => {
    if (stats && targetType === 'problems') {
      setProblemsSolvedToday(stats.solvedToday || 0);
    }
  }, [stats, targetType]);

  // Mark contest as given (for demo, resets daily)
  useEffect(() => {
    if (targetType === 'contest') {
      const today = new Date().toISOString().split('T')[0];
      const stored = localStorage.getItem('contestGivenDate');
      if (stored === today) setContestGiven(true);
      else setContestGiven(false);
    }
  }, [targetType]);

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch user info
        const userRes = await axios.get('/api/auth/me', { headers: { 'x-auth-token': token } });
        setUser(userRes.data);

        // Fetch summary and activity data from analyticsAPI
        const params = new URLSearchParams();
        if (activityDateRange.startDate) params.append('startDate', activityDateRange.startDate);
        if (activityDateRange.endDate) params.append('endDate', activityDateRange.endDate);
        params.append('platform', 'codeforces');

        // Summary (KPI) data
        const summaryRes = await analyticsAPI.getSummary(token, params);
        const summaryData = summaryRes.data;

        // Fetch Codeforces rating, max rating, and rank directly from Codeforces API
        let currentRating = 'N/A', maxRating = 'N/A', bestRank = 'N/A';
        const cfAccount = userRes.data.platformAccounts?.find(acc => acc.platform === 'codeforces');
        if (cfAccount && cfAccount.username) {
          try {
            const cfInfoRes = await axios.get('https://codeforces.com/api/user.info', { params: { handles: cfAccount.username } });
            if (cfInfoRes.data.status === 'OK') {
              const cfUser = cfInfoRes.data.result[0];
              currentRating = cfUser.rating || 'N/A';
              maxRating = cfUser.maxRating || 'N/A';
              bestRank = cfUser.rank || 'N/A';
            }
          } catch (e) {
            // fallback to N/A
          }
        }

        setKpis({
          currentRating,
          maxRating,
          bestRank,
          streak: summaryData.streak || 0,
          avgSolveTime: summaryData.averageAttemptsPerProblem?.toFixed(2) || 'N/A',
          wrongRate: summaryData.wrongSubmissionRate != null ? `${summaryData.wrongSubmissionRate}%` : 'N/A',
        });
        setStats({
          totalProblems: summaryData.totalSolvedProblems || 0,
          solvedToday: summaryData.solvedToday || 0,
          solvedThisWeek: summaryData.solvedThisWeek || 0,
          solvedThisMonth: summaryData.solvedThisMonth || 0,
        });

        // Activity data for graph
        const activityRes = await analyticsAPI.getActivity(token, params);
        setSubmissionActivity(activityRes.data || []);

        // Recent submissions
        const submissionsRes = await axios.get('/api/submissions?limit=5', { headers: { 'x-auth-token': token } });
        setRecentActivity(submissionsRes.data?.submissions || []);

        // Recommendations
        try {
          const recRes = await axios.get('/api/recommendations', { headers: { 'x-auth-token': token } });
          setRecommendations(recRes.data?.recommendations || []);
        } catch {
          setRecommendations([]);
        }
      } catch (err) {
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
    // eslint-disable-next-line
  }, [token, activityDateRange.startDate, activityDateRange.endDate]);

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setActivityDateRange(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  // Chart data
  const submissionActivityData = {
    labels: submissionActivity.map(item => item.date),
    datasets: [
      {
        label: 'Accepted Submissions',
        data: submissionActivity.map(item => item.accepted),
        borderColor: '#4ade80',
        backgroundColor: 'rgba(74, 222, 128, 0.2)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  return (
    <>
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-indigo-600/80 via-blue-500/80 to-purple-500/80 text-white p-7 rounded-2xl shadow-2xl flex flex-col md:flex-row justify-between items-center sticky top-0 z-20 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center gap-5 w-full md:w-auto">
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="h-14 w-14 rounded-full bg-white flex items-center justify-center shadow-lg border-4 border-indigo-300 hover:scale-105 transition-transform overflow-hidden"
              >
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt="Profile" className="h-14 w-14 rounded-full object-cover" onError={e => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }} />
                ) : (
                  <span className="text-indigo-600 font-bold text-2xl">
                    {user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                  </span>
                )}
              </button>
              {showMenu && (
                <div className="absolute left-0 mt-2 w-44 bg-white rounded-xl shadow-xl py-2 ring-1 ring-black ring-opacity-5 z-30">
                  <button
                    onClick={() => { setShowProfilePopup(true); setShowMenu(false); }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('username'); localStorage.removeItem('role'); window.location = '/' }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold drop-shadow-sm">
                Welcome, {user?.name || 'Coder'}!
              </h1>
              {user?.platformAccounts && user.platformAccounts.length > 0 && (
                <div className="mt-2 text-base font-semibold text-indigo-100 flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-indigo-700/60 text-xs font-bold uppercase tracking-wider">
                    <svg className="w-4 h-4 mr-1 text-yellow-300" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" /></svg>
                    Connected Platforms: {user.platformAccounts.map(acc => acc.platform).join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 mt-6 md:mt-0 w-full md:w-auto">
            <button
              onClick={() => setShowAIImprovement(true)}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 text-indigo-900 rounded-xl shadow-lg border-2 border-yellow-200 text-base font-bold hover:scale-105 hover:bg-yellow-400/90 transition"
            >
              <svg className="w-5 h-5 text-indigo-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Want to improve ratings?
            </button>
          </div>
        </div>
        {/* Tip and Motivational Tip & KPIs */}
        <div className="px-6 space-y-4 mb-4">
          {/* Enhanced Tip of the Day */}
          <div className="relative flex items-center justify-center">
            <div className="w-full md:w-2/3 bg-gradient-to-r from-indigo-500/80 to-blue-400/80 backdrop-blur-lg rounded-2xl shadow-xl p-5 flex items-center gap-4 border border-white/20">
              <span className="flex-shrink-0 text-3xl md:text-4xl text-yellow-300 drop-shadow mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M6.05 17.95l-1.414 1.414m12.728 0l-1.414-1.414M6.05 6.05L4.636 4.636" />
                </svg>
              </span>
              <span className="italic text-lg md:text-xl text-white font-medium tracking-wide drop-shadow-sm">“{tip}”</span>
            </div>
          </div>
          {/* Modern KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl text-center shadow-lg border border-gray-100 hover:scale-105 transition-transform">
              <div className="text-2xl font-extrabold text-indigo-700 animate-pop">{kpis.currentRating}</div>
              <div className="text-xs uppercase tracking-wider text-gray-500 mt-1">Current Rating</div>
            </div>
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl text-center shadow-lg border border-gray-100 hover:scale-105 transition-transform">
              <div className="text-2xl font-extrabold text-blue-700 animate-pop">{kpis.maxRating}</div>
              <div className="text-xs uppercase tracking-wider text-gray-500 mt-1">Max Rating</div>
            </div>
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl text-center shadow-lg border border-gray-100 hover:scale-105 transition-transform">
              <div className="text-2xl font-extrabold text-purple-700 animate-pop">{kpis.bestRank}</div>
              <div className="text-xs uppercase tracking-wider text-gray-500 mt-1">Best Rank</div>
            </div>
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl text-center shadow-lg border border-gray-100 hover:scale-105 transition-transform">
              <div className="text-2xl font-extrabold text-green-700 animate-pop">{kpis.streak} <span className="text-base font-bold">days</span></div>
              <div className="text-xs uppercase tracking-wider text-gray-500 mt-1">Current Streak</div>
            </div>
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl text-center shadow-lg border border-gray-100 hover:scale-105 transition-transform">
              <div className="text-2xl font-extrabold text-pink-700 animate-pop">{kpis.avgSolveTime}</div>
              <div className="text-xs uppercase tracking-wider text-gray-500 mt-1">Avg Solve Time</div>
            </div>
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl text-center shadow-lg border border-gray-100 hover:scale-105 transition-transform">
              <div className="text-2xl font-extrabold text-red-700 animate-pop">{kpis.wrongRate}</div>
              <div className="text-xs uppercase tracking-wider text-gray-500 mt-1">Wrong Submission Rate</div>
            </div>
          </div>
        </div>

        {/* Target/Goal Section */}
        <div className="flex justify-center">
          <div className="w-full md:w-2/3 lg:w-1/2 bg-gradient-to-br from-indigo-500 via-blue-400 to-purple-400 rounded-2xl shadow-xl p-8 mb-8 relative overflow-hidden animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-4 text-center drop-shadow">🎯 Set Your Daily/Custom Target</h2>
            {showConfetti && <Confetti show={true} />}
            {!targetSet ? (
              <form
                className="flex flex-col md:flex-row md:items-end gap-4 justify-center"
                onSubmit={e => {
                  e.preventDefault();
                  setTargetSet(true);
                  setTargetCompleted(false);
                  setShowConfetti(false);
                  if (targetType === 'contest') setContestGiven(false);
                }}
              >
                <div>
                  <label className="block text-sm font-medium text-white">Target Type</label>
                  <select
                    className="mt-1 block w-full rounded-md border-2 border-white bg-white bg-opacity-80 shadow focus:border-purple-400 focus:ring-purple-400 sm:text-sm px-2 py-1"
                    value={targetType}
                    onChange={e => setTargetType(e.target.value)}
                  >
                    <option value="problems">Solve Problems</option>
                    <option value="contest">Give a Contest</option>
                  </select>
                </div>
                {targetType === 'problems' && (
                  <div>
                    <label className="block text-sm font-medium text-white">Problems per day</label>
                    <input
                      type="number"
                      min="1"
                      className="mt-1 block w-full rounded-md border-2 border-white bg-white bg-opacity-80 shadow focus:border-purple-400 focus:ring-purple-400 sm:text-sm px-2 py-1"
                      value={targetValue}
                      onChange={e => setTargetValue(Number(e.target.value))}
                    />
                  </div>
                )}
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg shadow-lg hover:scale-105 transition font-bold text-lg"
                >
                  Set Target
                </button>
              </form>
            ) : (
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="text-white text-lg font-semibold flex flex-col items-center md:items-start">
                  <span>Today's Target:</span>
                  <span className="mt-1 text-xl font-bold drop-shadow">
                    {targetType === 'problems'
                      ? `Solve ${targetValue} problems`
                      : 'Give a contest'}
                  </span>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-4">
                  {targetType === 'problems' && (
                    <div className="flex flex-col items-center gap-2">
                      <ProgressRing
                        percent={Math.min(100, Math.round((problemsSolvedToday / targetValue) * 100))}
                        size={64}
                        stroke={8}
                        color="#facc15"
                        bg="#e0e7ef"
                        label={`${Math.min(100, Math.round((problemsSolvedToday / targetValue) * 100))}%`}
                      />
                      <span className="text-white text-sm font-semibold">{problemsSolvedToday} / {targetValue} solved</span>
                      <span className="text-xs text-yellow-100 italic animate-fade-in">
                        {getMotivation(Math.min(100, Math.round((problemsSolvedToday / targetValue) * 100)))}
                      </span>
                    </div>
                  )}
                  {targetType === 'contest' && (
                    <button
                      className={`px-4 py-2 rounded-lg font-bold text-lg shadow-lg transition transform hover:scale-105 ${contestGiven ? 'bg-green-400 text-white' : 'bg-yellow-300 text-yellow-900 animate-pulse'}`}
                      onClick={() => {
                        setContestGiven(true);
                        setTargetCompleted(true);
                        setShowConfetti(true);
                        localStorage.setItem('contestGivenDate', new Date().toISOString().split('T')[0]);
                      }}
                      disabled={contestGiven}
                    >
                      {contestGiven ? 'Contest Completed 🎉' : 'Mark as Done'}
                    </button>
                  )}
                  <button
                    className="px-3 py-1 rounded-md bg-white bg-opacity-80 text-gray-700 font-semibold border border-gray-200 hover:bg-purple-100 transition"
                    onClick={() => { setTargetSet(false); setTargetCompleted(false); setShowConfetti(false); }}
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
            {/* Reminder */}
            {targetSet && !targetCompleted && (
              <div className="mt-6 p-4 bg-yellow-200 bg-opacity-80 border-l-4 border-yellow-500 text-yellow-900 rounded-lg text-center text-lg font-semibold animate-pulse">
                Reminder: Don't forget to complete your target today!
              </div>
            )}
          </div>
        </div>
        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Loading dashboard data...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Total Problems Solved */}
                <div className="relative bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 flex flex-col items-center border border-gray-100 hover:scale-105 transition-transform">
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-tr from-indigo-500 to-blue-400 p-2 rounded-full shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                  </span>
                  <h2 className="text-xs font-semibold text-gray-500 mt-6 uppercase tracking-wider">Total Problems Solved</h2>
                  <p className="mt-2 text-3xl font-extrabold text-indigo-700 animate-pop">{stats.totalProblems}</p>
                </div>
                {/* Solved Today */}
                <div className="relative bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 flex flex-col items-center border border-gray-100 hover:scale-105 transition-transform">
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-tr from-green-400 to-blue-400 p-2 rounded-full shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </span>
                  <h2 className="text-xs font-semibold text-gray-500 mt-6 uppercase tracking-wider">Solved Today</h2>
                  <p className="mt-2 text-3xl font-extrabold text-green-600 animate-pop">{stats.solvedToday}</p>
                </div>
                {/* Solved This Week */}
                <div className="relative bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 flex flex-col items-center border border-gray-100 hover:scale-105 transition-transform">
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-tr from-purple-400 to-blue-400 p-2 rounded-full shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 17v-2a4 4 0 014-4h10a4 4 0 014 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  </span>
                  <h2 className="text-xs font-semibold text-gray-500 mt-6 uppercase tracking-wider">Solved This Week</h2>
                  <p className="mt-2 text-3xl font-extrabold text-purple-600 animate-pop">{stats.solvedThisWeek}</p>
                </div>
                {/* Solved This Month */}
                <div className="relative bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 flex flex-col items-center border border-gray-100 hover:scale-105 transition-transform">
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-tr from-pink-400 to-purple-400 p-2 rounded-full shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" /></svg>
                  </span>
                  <h2 className="text-xs font-semibold text-gray-500 mt-6 uppercase tracking-wider">Solved This Month</h2>
                  <p className="mt-2 text-3xl font-extrabold text-pink-600 animate-pop">{stats.solvedThisMonth}</p>
                </div>
              </div>
            )}

            {/* Submission Activity Chart */}
            <div className="relative bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 mt-8 border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <span className="bg-gradient-to-tr from-indigo-500 to-blue-400 p-2 rounded-full">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" /></svg>
                  </span>
                  <h2 className="text-lg font-bold text-gray-900 tracking-wide">Submission Activity</h2>
                </div>
                <div className="flex space-x-4">
                  <div>
                    <label htmlFor="startDate" className="block text-xs font-semibold text-gray-700">From</label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={activityDateRange.startDate}
                      onChange={handleDateRangeChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="endDate" className="block text-xs font-semibold text-gray-700">To</label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={activityDateRange.endDate}
                      onChange={handleDateRangeChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="h-64 bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-xl p-2">
                <Line
                  data={submissionActivityData}
                  options={{
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Accepted Submissions'
                        },
                        ticks: {
                          precision: 0
                        }
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Date'
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden mt-8 border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
                <span className="bg-gradient-to-tr from-indigo-500 to-blue-400 p-2 rounded-full">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                </span>
                <h2 className="text-lg font-bold text-gray-900 tracking-wide">Recent Activity</h2>
              </div>
              {recentActivity.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {recentActivity.map((submission) => (
                    <div key={submission._id} className="px-4 py-3">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <span className={`flex items-center justify-center w-8 h-8 rounded-full shadow ${
                            submission.status === 'accepted'
                              ? 'bg-green-100 text-green-600'
                              : 'bg-red-100 text-red-600'
                          }`}>
                            {submission.status === 'accepted' ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            )}
                          </span>
                          <div>
                            <Link to={`/problems/${submission.problem?._id}`} className="text-base font-semibold text-indigo-700 hover:underline">
                              {submission.problem?.title || 'Unknown Problem'}
                            </Link>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                submission.status === 'accepted'
                                  ? 'bg-green-50 text-green-700 border border-green-200'
                                  : 'bg-red-50 text-red-700 border border-red-200'
                              }`}>
                                {submission.status === 'accepted' ? 'Accepted' : 'Failed'}
                              </span>
                              <span className="text-xs text-gray-500 font-mono">
                                {new Date(submission.submittedAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0 mt-2 md:mt-0">
                          <Link
                            to={`/submissions/${submission._id}`}
                            className="inline-flex items-center px-4 py-1.5 border border-indigo-200 text-sm font-semibold rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 shadow transition"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-4 text-center text-gray-500">
                  No recent activity found.
                </div>
              )}
              <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-blue-50 flex justify-end">
                <Link to="/submissions" className="inline-flex items-center px-5 py-2 rounded-lg bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition">
                  View all submissions
                </Link>
              </div>
            </div>

            {/* Recommendations (if available) */}
            {recommendations.length > 0 && (
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden mt-8 border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
                  <span className="bg-gradient-to-tr from-indigo-500 to-blue-400 p-2 rounded-full">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.75 5.75v12.5l6.25-4.5 6.25 4.5V5.75A2.25 2.25 0 0016 3.5H8A2.25 2.25 0 005.75 5.75z" /></svg>
                  </span>
                  <h2 className="text-lg font-bold text-gray-900 tracking-wide">Recommended Problems</h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendations.map((rec) => (
                    <a
                      key={rec._id}
                      href={rec.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block bg-gradient-to-br from-blue-50 via-white to-purple-50 p-5 rounded-2xl shadow-lg border border-blue-100 hover:scale-105 hover:shadow-xl transition relative overflow-hidden"
                    >
                      <span className="absolute top-3 right-3 text-yellow-400 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" /></svg>
                      </span>
                      <div className="font-bold text-blue-800 text-lg mb-1 truncate pr-8">{rec.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 uppercase tracking-wide">{rec.platform}</span>
                        <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded ${rec.difficulty === 'easy' ? 'bg-green-100 text-green-700' : rec.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{rec.difficulty}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <AIImprovementModal open={showAIImprovement} onClose={() => setShowAIImprovement(false)} />
      {showProfilePopup && user && (
        <ProfilePopup
          user={user}
          onClose={() => setShowProfilePopup(false)}
          onUpdate={handleProfileUpdate}
        />
      )}
    </>
  )};
export default Dashboard;
