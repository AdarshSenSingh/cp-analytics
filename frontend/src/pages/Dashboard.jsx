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

// --- Professional Dynamic Components ---
// Celebration Animation: Child dancing with trophy and raining ribbons
const Celebration = ({ show, onEnd }) => {
  const [visible, setVisible] = React.useState(show);
  React.useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        if (onEnd) onEnd();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, onEnd]);
  if (!visible) return null;
  return (
    <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',pointerEvents:'none',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column'}}>
      {/* Celebration message */}
      <div style={{
        fontSize: '3vw',
        fontWeight: 'bold',
        color: '#fff',
        textShadow: '2px 2px 8px #000, 0 0 16px #fbbf24',
        marginBottom: '2vh',
        letterSpacing: '2px',
        zIndex: 20,
        textAlign: 'center',
        userSelect: 'none',
      }}>
        WoW! Target Completed
      </div>
      {/* Ribbons and papers */}
      <div style={{position:'absolute',top:0,left:0,width:'100vw',height:'100vh',overflow:'hidden'}}>
        {[...Array(80)].map((_,i) => {
          const size = 16 + Math.random() * 16;
          const rotate = Math.random() * 360;
          return (
            <div key={i} style={{
              position:'absolute',
              left:`${Math.random()*100}vw`,
              top:`-${Math.random()*20+5}vh`,
              animation:`fall${i%5} 5s linear forwards`,
              zIndex:2
            }}>
              <svg width={size} height={size*1.2} viewBox="0 0 24 32">
                <rect width={size/2} height={size} rx={size/8} fill={["#fbbf24","#34d399","#60a5fa","#f472b6","#f87171"][i%5]} transform={`rotate(${rotate})`} />
              </svg>
            </div>
          );
        })}
        <style>{`
          @keyframes fall0 { to { transform: translateY(110vh) rotate(180deg); } }
          @keyframes fall1 { to { transform: translateY(120vh) rotate(360deg); } }
          @keyframes fall2 { to { transform: translateY(115vh) rotate(270deg); } }
          @keyframes fall3 { to { transform: translateY(125vh) rotate(90deg); } }
          @keyframes fall4 { to { transform: translateY(130vh) rotate(300deg); } }
        `}</style>
      </div>
      {/* Dancing child with trophy (SVG illustration, full body, large) */}
      <div style={{zIndex:10,animation:'dance 1s infinite alternate',pointerEvents:'none',width:'50vw',height:'80vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <svg width="100%" height="100%" viewBox="0 0 600 900">
          {/* Trophy - more realistic, classic cup with handles and highlights */}
          <g>
            {/* Cup body with gold gradient */}
            <defs>
              <linearGradient id="trophyGold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fffbe6"/>
                <stop offset="40%" stopColor="#ffe066"/>
                <stop offset="100%" stopColor="#bfa100"/>
              </linearGradient>
            </defs>
            {/* Main cup */}
            <ellipse cx="420" cy="170" rx="60" ry="50" fill="url(#trophyGold)" stroke="#b45309" strokeWidth="8" />
            {/* Cup opening rim */}
            <ellipse cx="420" cy="140" rx="65" ry="18" fill="#fffbe6" stroke="#b45309" strokeWidth="5" />
            {/* Cup base */}
            <rect x="390" y="210" width="60" height="30" rx="15" fill="#bfa100" stroke="#b45309" strokeWidth="5" />
            <rect x="400" y="240" width="40" height="18" rx="8" fill="#bfa100" stroke="#b45309" strokeWidth="3" />
            {/* Handles */}
            <path d="M355 170 Q320 120 420 120" stroke="#b45309" strokeWidth="10" fill="none" />
            <path d="M485 170 Q520 120 420 120" stroke="#b45309" strokeWidth="10" fill="none" />
            {/* Shine highlight */}
            <ellipse cx="400" cy="155" rx="12" ry="22" fill="#fff" opacity="0.4" />
            {/* Trophy shadow */}
            <ellipse cx="420" cy="265" rx="30" ry="8" fill="#bfa100" opacity="0.3" />
          </g>
          {/* Child body */}
          <g>
            {/* Head */}
            <circle cx="300" cy="200" r="90" fill="#fde68a" stroke="#fbbf24" strokeWidth="8" />
            {/* Face features */}
            <ellipse cx="270" cy="210" rx="12" ry="18" fill="#fff" />
            <ellipse cx="330" cy="210" rx="12" ry="18" fill="#fff" />
            <circle cx="270" cy="215" r="6" fill="#222" />
            <circle cx="330" cy="215" r="6" fill="#222" />
            <path d="M270 250 Q300 280 330 250" stroke="#b45309" strokeWidth="7" fill="none" />
            {/* Smile blush */}
            <ellipse cx="250" cy="240" rx="10" ry="5" fill="#fbbf24" opacity="0.4" />
            <ellipse cx="350" cy="240" rx="10" ry="5" fill="#fbbf24" opacity="0.4" />
            {/* Body */}
            <rect x="210" y="290" width="180" height="260" rx="60" fill="#60a5fa" />
            {/* Left Arm (trophy hand) */}
            <rect x="340" y="220" width="50" height="180" rx="25" fill="#fde68a" transform="rotate(-20 365 310)" />
            {/* Right Arm */}
            <rect x="110" y="320" width="50" height="180" rx="25" fill="#fde68a" transform="rotate(20 135 410)" />
            {/* Left Hand (trophy) */}
            <ellipse cx="420" cy="180" rx="25" ry="18" fill="#fde68a" stroke="#b45309" strokeWidth="4" />
            {/* Right Hand */}
            <ellipse cx="160" cy="480" rx="25" ry="18" fill="#fde68a" stroke="#b45309" strokeWidth="4" />
            {/* Shorts */}
            <rect x="230" y="540" width="60" height="70" rx="20" fill="#3b82f6" />
            <rect x="310" y="540" width="60" height="70" rx="20" fill="#3b82f6" />
            {/* Left Leg */}
            <rect x="230" y="610" width="40" height="180" rx="20" fill="#b45309" transform="rotate(-10 250 700)" />
            {/* Right Leg */}
            <rect x="330" y="610" width="40" height="180" rx="20" fill="#b45309" transform="rotate(10 350 700)" />
            {/* Left Foot */}
            <ellipse cx="250" cy="800" rx="35" ry="18" fill="#fde68a" stroke="#b45309" strokeWidth="4" />
            {/* Right Foot */}
            <ellipse cx="350" cy="800" rx="35" ry="18" fill="#fde68a" stroke="#b45309" strokeWidth="4" />
          </g>
        </svg>
      </div>
      <style>{`
        @keyframes dance {
          0% { transform: translateY(0) rotate(-5deg) scale(1); }
          100% { transform: translateY(-30px) rotate(5deg) scale(1.05); }
        }
      `}</style>
    </div>
  );
};

// Dynamic tip text with continuous typewriter cycling effect
const DynamicTipText = ({ tips }) => {
  const [tipIndex, setTipIndex] = React.useState(0);
  const [displayed, setDisplayed] = React.useState('');
  const [typing, setTyping] = React.useState(true);

  // Defensive: filter out any undefined or empty tips
  const safeTips = Array.isArray(tips) ? tips.filter(t => typeof t === 'string' && t.trim().length > 0) : [];
  const currentTip = safeTips[tipIndex] || '';

  React.useEffect(() => {
    setDisplayed('');
    setTyping(true);
    if (!currentTip) return;
    let i = -1;
    const interval = setInterval(() => {
      // Only add if character exists
      if (i < currentTip.length-1) {
        setDisplayed(t => t + currentTip[i]);
        i++;
      } else {
        clearInterval(interval);
        setTyping(false);
      }
    }, 22);
    return () => clearInterval(interval);
  }, [tipIndex, currentTip]);

  React.useEffect(() => {
    if (!typing) {
      const timeout = setTimeout(() => {
        setTipIndex((prev) => (prev + 1) % safeTips.length);
      }, 1800);
      return () => clearTimeout(timeout);
    }
  }, [typing, safeTips.length]);

  return (
    <span className="italic text-base md:text-lg font-semibold tracking-wide text-[#7c4a03] whitespace-nowrap overflow-x-auto" style={{transition:'color 0.3s'}}>
      {currentTip && `“${displayed}”`}
    </span>
  );
};

// AnimatedCounter removed for simplicity and professionalism
const AnimatedCounter = ({ value, className = "" }) => <span className={className}>{value}</span>;

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

// Removed custom confetti and pop/fade-in animations for a cleaner, more professional look

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
  const [profile, setProfile] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [tip, setTip] = useState('');
  const tips = [
    "Practice makes perfect: solve at least one problem every day!",
    "Read problem statements carefully before coding.",
    "Did you know? You can optimize your code by reducing time complexity!",
    "Don't be afraid to ask for help when you need it.",
    "Don't forget to check out the community forums for help and support.",
    "Keep practicing and improving your skills!"
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

  // State for problem solved checkboxes and modal
  const [showProblemsModal, setShowProblemsModal] = useState(false);
  const [problemsStatus, setProblemsStatus] = useState(() => {
    // Try to load from localStorage for persistence
    const saved = localStorage.getItem('problemsStatus');
    return saved ? JSON.parse(saved) : [];
  });

  // Update localStorage when problemsStatus changes
  useEffect(() => {
    localStorage.setItem('problemsStatus', JSON.stringify(problemsStatus));
  }, [problemsStatus]);

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
        // Fetch profile info
        const profileRes = await axios.get('/api/users/profile', { headers: { 'x-auth-token': token } });
        setProfile(profileRes.data);

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
        <div className="bg-white text-gray-900 p-7 rounded-xl shadow flex flex-col md:flex-row justify-between items-center sticky top-0 z-20 border border-gray-200">
          <div className="flex items-center gap-5 w-full md:w-auto">
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center shadow border-2 border-gray-300 hover:bg-gray-200 transition overflow-hidden"
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
              <h1 className="text-3xl md:text-4xl font-bold">
                Welcome, {user?.name || 'Coder'}!
              </h1>
              {user?.platformAccounts && user.platformAccounts.length > 0 && (
                <div className="mt-2 text-base font-semibold text-gray-600 flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-200 text-xs font-bold uppercase tracking-wider">
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
              className="flex items-center gap-2 px-6 py-2 bg-gray-200 text-gray-800 rounded-lg shadow border border-gray-300 text-base font-semibold hover:bg-gray-300 transition"
            >
              <svg className="w-5 h-5 text-indigo-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Want to improve ratings?
            </button>
          </div>
        </div>
        {/* Tip and Motivational Tip & KPIs */}
        <div className="px-6 space-y-4 mb-4">
          <div className="flex justify-center">
            <div className="w-full md:w-2/3 bg-gray-50 rounded-lg shadow-sm px-4 py-2 flex items-center gap-2 border border-gray-200 min-h-[48px]">
              <span className="flex-shrink-0 text-xl md:text-2xl text-yellow-700">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M6.05 17.95l-1.414 1.414m12.728 0l-1.414-1.414M6.05 6.05L4.636 4.636" />
                </svg>
              </span>
              <DynamicTipText tips={tips} />
            </div>
          </div>
          {/* KPI Cards - Professional Style */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-white p-4 rounded-xl text-center shadow border border-gray-200">
              <div className="text-2xl font-bold text-indigo-700">{kpis.currentRating}</div>
              <div className="text-xs uppercase tracking-wider text-gray-500 mt-1">Current Rating</div>
            </div>
            <div className="bg-white p-4 rounded-xl text-center shadow border border-gray-200">
              <div className="text-2xl font-bold text-blue-700">{kpis.maxRating}</div>
              <div className="text-xs uppercase tracking-wider text-gray-500 mt-1">Max Rating</div>
            </div>
            <div className="bg-white p-4 rounded-xl text-center shadow border border-gray-200">
              <div className="text-2xl font-bold text-purple-700">{kpis.bestRank}</div>
              <div className="text-xs uppercase tracking-wider text-gray-500 mt-1">Best Rank</div>
            </div>
            <div className="bg-white p-4 rounded-xl text-center shadow border border-gray-200">
              <div className="text-2xl font-bold text-green-700">{kpis.streak} <span className="text-base font-semibold">days</span></div>
              <div className="text-xs uppercase tracking-wider text-gray-500 mt-1">Current Streak</div>
            </div>
            <div className="bg-white p-4 rounded-xl text-center shadow border border-gray-200">
              <div className="text-2xl font-bold text-pink-700">{kpis.avgSolveTime}</div>
              <div className="text-xs uppercase tracking-wider text-gray-500 mt-1">Avg Solve Time</div>
            </div>
            <div className="bg-white p-4 rounded-xl text-center shadow border border-gray-200">
              <div className="text-2xl font-bold text-red-700">{kpis.wrongRate}</div>
              <div className="text-xs uppercase tracking-wider text-gray-500 mt-1">Wrong Submission Rate</div>
            </div>
          </div>
        </div>

        {/* Target/Goal Section */}
        <div className="flex justify-center">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow p-10 mb-8 relative overflow-hidden mx-auto">
            <h2 className="text-3xl font-extrabold text-indigo-800 mb-2 text-center flex items-center justify-center gap-2">
              <span role="img" aria-label="target">🎯</span> Set Your Daily Target
            </h2>
            <div className="flex justify-center mb-4">
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-900 px-5 py-3 rounded-xl font-semibold shadow-sm animate-pulse hover:animate-none transition text-base">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>Set the time you want to give your contest. <span className='font-semibold text-primary-600'>You will receive a reminder 5 minutes before the contest.</span></span>
              </div>
            </div>
            <form
              className="flex flex-row flex-wrap gap-6 items-end w-full justify-center"
              onSubmit={async e => {
                e.preventDefault();
                const email = profile?.email;
                const targetTypeValue = e.target.targetType.value;
                try {
                  if (targetTypeValue === 'contest') {
                    const contestTime = e.target.contestTime.value;
                    await axios.post('/api/targets', {
                      targetType: 'contest',
                      contestTime,
                      email
                    }, {
                      headers: { 'x-auth-token': token }
                    });
                    alert('Contest target set! You will receive a reminder 5 minutes before the contest.');
                    // Do NOT reset form for contest
                  } else {
                    const problemsPerDay = e.target.problemsPerDay.value;
                    await axios.post('/api/targets', {
                      targetType: 'problems',
                      problemsPerDay,
                      email
                    }, {
                      headers: { 'x-auth-token': token }
                    });
                    alert('Problems per day target set!');
                    // Reset form to default after setting problems target
                    setTargetType('problems');
                    setTargetValue(3);
                    setProblemsStatus([]);
                    if (e.target.targetType) e.target.targetType.value = 'problems';
                    if (e.target.problemsPerDay) e.target.problemsPerDay.value = 3;
                  }
                } catch (err) {
                  alert('Failed to set target.');
                }
              }}
            >
              <div className="flex flex-col items-center min-w-[180px]">
                <label className="block text-sm font-medium text-gray-700 mb-1 text-center">Target Type</label>
                <select name="targetType" className="w-40 px-3 py-2 border border-gray-300 rounded-md text-center" defaultValue="problems" onChange={e => setTargetType(e.target.value)}>
                  <option value="problems">Problems</option>
                  <option value="contest">Contest</option>
                </select>
              </div>
              {targetType === 'problems' && (
                <>
                  <div className="flex flex-col items-center min-w-[180px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-center">Problems per day</label>
                    <input type="number" name="problemsPerDay" min="1" defaultValue={3} className="w-32 px-3 py-2 border border-gray-300 rounded-md text-center" />
                  </div>
                  <div className="flex flex-col items-center min-w-[180px]">
                    <button
                      type="button"
                      className="w-40 bg-blue-600 text-white py-2 px-4 rounded-md font-semibold shadow hover:bg-blue-700 transition whitespace-nowrap mb-1"
                      onClick={() => setShowProblemsModal(true)}
                    >
                      Mark 
                    </button>
                    {/* Remaining Problems Reminder */}
                    {(() => {
                      const total = Number(document.querySelector('input[name="problemsPerDay"]')?.value || targetValue);
                      const solved = problemsStatus.filter(Boolean).length;
                      const remaining = total - solved;
                      if (remaining > 0 && remaining < total) {
                        return (
                          <div className="text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-3 py-1 text-center font-semibold w-40 mt-1">
                            Solve remaining {remaining} problem{remaining > 1 ? 's' : ''} to get target complete.
                          </div>
                        );
                      }
                      return null;
                    })()}
                    {/* Target Done Badge & Celebration */}
                    {Array.from({ length: Number(document.querySelector('input[name="problemsPerDay"]')?.value || targetValue) }).every((_, idx) => problemsStatus[idx]) && (
                      <>
                        <div className="flex items-center gap-2 justify-center mt-1">
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 font-bold text-base border border-green-300 animate-bounce">
                            <svg className="w-5 h-5 mr-1 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            Target Done! Achievement Unlocked!
                          </span>
                        </div>
                        <Celebration show={true} />
                      </>
                    )}
                  </div>
                </>
              )}
              {targetType === 'contest' && (
                <>
                  <div className="flex flex-col items-center min-w-[180px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-center">Contest Time</label>
                    <input type="time" name="contestTime" required className="w-40 px-3 py-2 border border-gray-300 rounded-md text-center" defaultValue={''} />
                  </div>
                  {/* Mark as Done button appears only after contest target is set */}
                  {(() => {
                    // Show "Mark as Done" if contest target is set (i.e., contestGivenDate in localStorage is not today)
                    const today = new Date().toISOString().split('T')[0];
                    const stored = localStorage.getItem('contestGivenDate');
                    // If contestGiven is false, show the button
                    if (!contestGiven) {
                      return (
                        <button
                          type="button"
                          className="w-40 bg-green-600 text-white py-2 px-4 rounded-md font-semibold shadow hover:bg-green-700 transition whitespace-nowrap mb-1 mt-2"
                          onClick={() => {
                            setContestGiven(true);
                            setTargetCompleted(true);
                            setShowConfetti(true);
                            localStorage.setItem('contestGivenDate', today);
                          }}
                        >
                          Mark as Done
                        </button>
                      );
                    } else {
                      return (
                        <div className="flex items-center gap-2 justify-center mt-1">
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 font-bold text-base border border-green-300 animate-bounce">
                            <svg className="w-5 h-5 mr-1 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            Contest Done! Achievement Unlocked!
                          </span>
                        </div>
                      );
                    }
                  })()}
                </>
              )}
              <div className="flex flex-col items-center min-w-[180px]">
                <button type="submit" className="w-40 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition">Set Target</button>
              </div>
            </form>
            {/* Old target/goal UI below, can be removed if not needed */}
            {/*
            {showConfetti && <Confetti show={true} />}
            {!targetSet ? (
              ...
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
                        color="#2563eb"
                        bg="#e0e7ef"
                        label={`${Math.min(100, Math.round((problemsSolvedToday / targetValue) * 100))}%`}
                      />
                      <span className="text-gray-800 text-sm font-semibold">{problemsSolvedToday} / {targetValue} solved</span>
                      <span className="text-xs text-gray-500 italic">
                        {getMotivation(Math.min(100, Math.round((problemsSolvedToday / targetValue) * 100)))}
                      </span>
                    </div>
                  )}
                  {targetType === 'contest' && (
                    <button
                      className={`px-4 py-2 rounded-lg font-semibold text-lg shadow transition ${contestGiven ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-800'}`}
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
                    className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 font-semibold border border-gray-300 hover:bg-gray-200 transition"
                    onClick={() => { setTargetSet(false); setTargetCompleted(false); setShowConfetti(false); }}
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
            {/* Reminder */}
            {targetSet && !targetCompleted && (
              <div className="mt-6 p-4 bg-yellow-100 border-l-4 border-yellow-400 text-yellow-900 rounded-lg text-center text-lg font-semibold">
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

      {/* Celebration for problems or contest completion */}
      {(Array.from({ length: Number(document.querySelector('input[name="problemsPerDay"]')?.value || targetValue) }).every((_, idx) => problemsStatus[idx]) && targetType === 'problems') || (contestGiven && targetType === 'contest') ? (
        <Celebration show={true} />
      ) : null}

      {/* Problems Solved Modal */}
      {showProblemsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
            <h3 className="text-lg font-bold mb-4 text-center">Problems Progress</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {Array.from({ length: Number(document.querySelector('input[name="problemsPerDay"]')?.value || targetValue) }).map((_, idx) => (
                <label key={idx} className="flex items-center gap-3 py-1 px-2 rounded hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={!!problemsStatus[idx]}
                    onChange={e => {
                      setProblemsStatus(prev => {
                        const updated = [...prev];
                        updated[idx] = e.target.checked;
                        return updated;
                      });
                    }}
                  />
                  <span>Problem {idx + 1} {problemsStatus[idx] ? <span className="text-green-600">(Solved)</span> : <span className="text-red-500">(Not Solved)</span>}</span>
                </label>
              ))}
            </div>
            <button
              className="mt-6 w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 font-semibold"
              onClick={() => setShowProblemsModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )};
export default Dashboard;
