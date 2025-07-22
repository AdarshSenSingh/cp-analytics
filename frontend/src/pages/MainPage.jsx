import { Link } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaUser, FaEnvelope, FaLock, FaUserPlus, FaSignInAlt, FaUserShield } from 'react-icons/fa';
import axios from 'axios';

// FloatingPanel component
function FloatingPanel({ title, color, children, className = '', style = {} }) {
  return (
    <div
      className={`bg-[#23272f] bg-opacity-95 rounded-2xl shadow-2xl border border-[#333] p-6 relative flex flex-col items-start min-w-[280px] max-w-[380px] w-full ${className}`}
      style={{ boxShadow: '0 8px 32px 0 rgba(0,0,0,0.45)', ...style }}
    >
      <span className="absolute left-4 top-4 text-gray-400">
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
        </svg>
      </span>
      <div className="mb-2 flex items-center gap-2 mt-2">
        <span className="text-xs font-bold tracking-widest" style={{ color }}>{title}</span>
      </div>
      <div className="w-full overflow-x-auto">{children}</div>
    </div>
  );
}

// DynamicTypeText component
function DynamicTypeText({ textArray }) {
  const [displayed, setDisplayed] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [textIdx, setTextIdx] = useState(0);
  const speed = isDeleting ? 40 : 80;
  const timeoutRef = useRef();

  useEffect(() => {
    const fullText = textArray[textIdx];
    if (!isDeleting && displayed.length < fullText.length) {
      timeoutRef.current = setTimeout(() => setDisplayed(fullText.slice(0, displayed.length + 1)), speed);
    } else if (isDeleting && displayed.length > 0) {
      timeoutRef.current = setTimeout(() => setDisplayed(fullText.slice(0, displayed.length - 1)), speed);
    } else if (!isDeleting && displayed.length === fullText.length) {
      timeoutRef.current = setTimeout(() => setIsDeleting(true), 1200);
    } else if (isDeleting && displayed.length === 0) {
      setIsDeleting(false);
      setTextIdx((textIdx + 1) % textArray.length);
    }
    return () => clearTimeout(timeoutRef.current);
  }, [displayed, isDeleting, textIdx, textArray]);

  return (
    <h2 className="text-lg md:text-xl font-bold text-[#ffb347] font-mono mb-2 min-h-[1.5em] flex items-center">
      {displayed}
      <span className="animate-pulse text-[#ffb347] ml-1">|</span>
    </h2>
  );
}

const valueProps = [
  {
    icon: '📊',
    title: 'All Your Coding Data, Unified',
    desc: 'Sync Codeforces, LeetCode, CodeChef, and more into one beautiful dashboard. View submissions, problems solved, streaks, and rating changes.'
  },
  {
    icon: '🤖',
    title: 'AI That Helps You Improve',
    desc: 'Personalized recommendations, weak topic detection, and targeted practice paths.'
  },
  {
    icon: '🏆',
    title: 'Simulate & Sharpen with Virtual Contests',
    desc: 'Run mock contests based on difficulty, topic, or past performance.'
  },
  {
    icon: '⚡',
    title: 'Your Coding Resume, Reinvented',
    desc: 'One profile to showcase all your progress with verifiable data.'
  }
];

const features = [
  { icon: '📊', title: 'Coding Analytics', desc: 'Track your progress with charts, rating graphs, and more.' },
  { icon: '📚', title: 'Topic-wise Progress', desc: 'See your strengths and weaknesses by topic.' },
  { icon: '🤖', title: 'CodeBot AI Mentor', desc: 'Get instant feedback and next-step suggestions.' },
  { icon: '🧪', title: 'Virtual Contests', desc: 'Practice with real contest formats and get instant analysis.' },
  { icon: '🎖️', title: 'Achievements & Badges', desc: 'Earn badges for streaks, milestones, and mastery.' },
  { icon: '📅', title: 'Practice Scheduler', desc: 'Set daily/weekly goals and stay consistent.' },
];

const testimonials = [
  { quote: 'Helped me organize my Codeforces & LeetCode grind!', user: 'User123' },
  { quote: 'The AI gave me insights I never realized about my weak points.', user: 'DevQueen99' },
];

const badges = [
  { icon: '🔥', label: '30-day streak' },
  { icon: '🧠', label: 'Dynamic Programming Master' },
  { icon: '🏁', label: 'Solved 100 problems' },
];

function LoginBox({ onSwitch }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', { email, password, role });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      toast.success('Login successful! Redirecting...');
      setTimeout(() => {
        if (res.data.role === 'admin') window.location.href = '/admin-dashboard';
        else window.location.href = '/dashboard';
      }, 1200);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.msg) {
        toast.error(err.response.data.msg);
      } else if (err.response && err.response.data && err.response.data.errors) {
        toast.error(err.response.data.errors[0].msg);
      } else {
        toast.error('Login failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-gradient-to-br from-white/90 via-indigo-100/90 to-blue-100/90 rounded-3xl shadow-2xl border-4 border-white/40 p-8 flex flex-col items-center font-sans animate-fade-in">
      <h2 className="text-3xl font-extrabold mb-4 text-indigo-900 tracking-wide flex items-center gap-2"><FaSignInAlt className="text-indigo-500" /> Login</h2>
      <form className="w-full flex flex-col gap-5" onSubmit={handleSubmit}>
        <div className="relative">
          <FaEnvelope className="absolute left-3 top-3 text-indigo-400" />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="pl-10 pr-4 py-2 rounded-xl border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full font-medium text-indigo-900" />
        </div>
        <div className="relative">
          <FaLock className="absolute left-3 top-3 text-indigo-400" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="pl-10 pr-4 py-2 rounded-xl border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full font-medium text-indigo-900" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-indigo-700 font-semibold flex items-center gap-2" htmlFor="login-role"><FaUserShield /> Select Role:</label>
          <select id="login-role" value={role} onChange={e => setRole(e.target.value)} className="rounded-xl border border-indigo-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium text-indigo-900">
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500 text-white font-extrabold text-lg shadow-lg hover:scale-105 hover:from-indigo-600 hover:to-purple-600 transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
          <FaSignInAlt /> {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p className="mt-6 text-base text-indigo-700 font-medium">Don't have an account? <button className="text-pink-600 font-bold hover:underline" onClick={onSwitch}>Sign up</button></p>
    </div>
  );
}

function SignupBox({ onSwitch }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/register', { username, email, password, role });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      toast.success('Signup successful! Redirecting...');
      setTimeout(() => {
        if (res.data.role === 'admin') window.location.href = '/admin-dashboard';
        else window.location.href = '/dashboard';
      }, 1200);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.msg) {
        toast.error(err.response.data.msg);
      } else if (err.response && err.response.data && err.response.data.errors) {
        toast.error(err.response.data.errors[0].msg);
      } else {
        toast.error('Signup failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-gradient-to-br from-white/90 via-pink-100/90 to-yellow-100/90 rounded-3xl shadow-2xl border-4 border-white/40 p-8 flex flex-col items-center font-sans animate-fade-in">
      <h2 className="text-3xl font-extrabold mb-4 text-pink-700 tracking-wide flex items-center gap-2"><FaUserPlus className="text-pink-500" /> Sign Up</h2>
      <form className="w-full flex flex-col gap-5" onSubmit={handleSubmit}>
        <div className="relative">
          <FaUser className="absolute left-3 top-3 text-pink-400" />
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" className="pl-10 pr-4 py-2 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 w-full font-medium text-pink-900" />
        </div>
        <div className="relative">
          <FaEnvelope className="absolute left-3 top-3 text-pink-400" />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="pl-10 pr-4 py-2 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 w-full font-medium text-pink-900" />
        </div>
        <div className="relative">
          <FaLock className="absolute left-3 top-3 text-pink-400" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="pl-10 pr-4 py-2 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 w-full font-medium text-pink-900" />
        </div>
        <div className="relative">
          <FaLock className="absolute left-3 top-3 text-pink-400" />
          <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm Password" className="pl-10 pr-4 py-2 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 w-full font-medium text-pink-900" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-pink-700 font-semibold flex items-center gap-2" htmlFor="signup-role"><FaUserShield /> Select Role:</label>
          <select id="signup-role" value={role} onChange={e => setRole(e.target.value)} className="rounded-xl border border-pink-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium text-pink-900">
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 via-yellow-400 to-pink-400 text-white font-extrabold text-lg shadow-lg hover:scale-105 hover:from-pink-600 hover:to-yellow-500 transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
          <FaUserPlus /> {loading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>
      <p className="mt-6 text-base text-pink-700 font-medium">Already have an account? <button className="text-indigo-600 font-bold hover:underline" onClick={onSwitch}>Login</button></p>
      <div className="mt-4 text-xs text-pink-500 bg-pink-50 rounded p-2">You can sign up as <b>User</b> or <b>Admin</b>. Choose your role above.</div>
    </div>
  );
}

const MainPage = () => {
  const year = new Date().getFullYear();
  const [showLogin, setShowLogin] = useState(true);

  // Redirect authenticated users away from main page
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role === 'admin') {
      window.location.replace('/admin-dashboard');
    } else if (token && role === 'user') {
      window.location.replace('/dashboard');
    }
  }, []);

  return (
    <>
      <ToastContainer position="top-center" autoClose={2500} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      <div className="min-h-screen w-full bg-gradient-to-br from-[#232526] via-[#1a1a1d] to-[#232526] flex flex-col items-center font-sans relative overflow-x-hidden">
        {/* Hero Section */}
        <div className="w-full flex flex-col md:flex-row items-center justify-between px-0 md:px-16 py-16 gap-10 relative z-10">
          <div className="flex-1 flex flex-col items-start justify-center px-6 md:px-0">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-5xl text-yellow-300 drop-shadow">⚡</span>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-wide drop-shadow" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>CodeTracker</h1>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-indigo-100 mb-4 max-w-xl" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>Supercharge Your Coding Journey</h2>
            <p className="text-lg text-indigo-200 mb-6 max-w-xl" style={{ fontFamily: 'Inter, sans-serif' }}>Track. Practice. Improve. — All in one platform.<br />
              <span className="block mt-2 text-base text-indigo-300">✅ Unified progress tracking across platforms<br />
              ✅ Personalized AI feedback & smart recommendations<br />
              ✅ Virtual contests & skill-based practice</span>
            </p>
            <div className="flex gap-4 mb-6 w-full md:w-auto">
              <button onClick={() => setShowLogin(true)} className={`px-8 py-4 rounded-xl font-bold shadow bg-gradient-to-r from-indigo-500 to-blue-500 text-white border-2 border-indigo-200 hover:scale-105 hover:bg-indigo-600 transition text-lg text-center flex items-center gap-2 ${showLogin ? 'opacity-100 scale-105 ring-2 ring-indigo-300' : 'opacity-70'}`}><FaSignInAlt /> Login</button>
              <button onClick={() => setShowLogin(false)} className={`px-8 py-4 rounded-xl font-bold shadow bg-gradient-to-r from-pink-500 to-yellow-400 text-white border-2 border-pink-200 hover:scale-105 hover:bg-pink-600 transition text-lg text-center flex items-center gap-2 ${!showLogin ? 'opacity-100 scale-105 ring-2 ring-pink-300' : 'opacity-70'}`}><FaUserPlus /> Sign Up</button>
            </div>
            <div className="flex gap-3 mt-2">
              <span className="inline-flex items-center px-4 py-1 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm shadow border border-indigo-200">Boost your coding profile</span>
              <span className="inline-flex items-center px-4 py-1 rounded-full bg-pink-100 text-pink-700 font-bold text-sm shadow border border-pink-200">AI-powered insights</span>
            </div>
          </div>
          {/* Login/Signup Box */}
          <div className="flex-1 flex items-center justify-center relative">
            {showLogin ? <LoginBox onSwitch={() => setShowLogin(false)} /> : <SignupBox onSwitch={() => setShowLogin(true)} />}
          </div>
        </div>
        {/* Modern Floating Code Panels - now below login/register */}
        <section className="w-full flex flex-col items-center justify-center py-12 relative z-20">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full max-w-6xl px-4">
            {/* HTML Panel with dynamic typing */}
            <FloatingPanel
              title="HTML"
              color="#ffb347"
              className="md:rotate-[-4deg] rotate-[-1deg] z-10"
            >
              <DynamicTypeText textArray={["Welcome back, Coder!", "Here’s a quick overview of your progress today."]} />
              <pre className="mt-4 text-[#ffb347] text-xs font-mono whitespace-pre break-words select-all bg-transparent border-none p-0 max-w-full overflow-x-auto">
{`<div class="tracker-summary">
  <h2>Welcome back, Coder!</h2>
  <p>Here’s a quick overview of your progress today.</p>
</div>`}
              </pre>
            </FloatingPanel>
            {/* JS Panel */}
            <FloatingPanel
              title="JS"
              color="#61dafb"
              className="md:rotate-[3deg] rotate-[1deg] z-20"
            >
              <pre className="text-[#61dafb] text-xs font-mono whitespace-pre break-words select-all bg-transparent border-none p-0 max-w-full overflow-x-auto">
{`const stats = {
  problemsSolved: 328,
  streak: "14 days",
  favoriteTopic: "Dynamic Programming"
};

function showSummary() {
  console.log("Keep the streak alive! 💪");
}`}
              </pre>
            </FloatingPanel>
            {/* SCSS Panel */}
            <FloatingPanel
              title="SCSS"
              color="#7ee787"
              className="md:rotate-[-2deg] rotate-[1deg] z-30"
            >
              <pre className="text-[#7ee787] text-xs font-mono whitespace-pre break-words select-all bg-transparent border-none p-0 max-w-full overflow-x-auto">
{`$gray: #e0e0e0;
$dark-gray: #232526;

.rect {
  width: 120px;
  height: 60px;
  border-radius: 12px;
  background: linear-gradient(135deg, $gray 0%, $dark-gray 100%);
}`}
              </pre>
            </FloatingPanel>
          </div>
        </section>
        {/* ...rest of your sections (valueProps, features, testimonials, etc.) ... */}
        {/* (Keep the rest of your page as in your previous code) */}
      </div>
    </>
  );
};

export default MainPage;