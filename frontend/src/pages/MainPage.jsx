import { Link } from 'react-router-dom';

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

const MainPage = () => {
  const year = new Date().getFullYear();
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 flex flex-col items-center font-sans relative overflow-x-hidden">
    {/* Hero Section */}
    <div className="w-full flex flex-col md:flex-row items-center justify-between px-0 md:px-16 py-16 gap-10 relative z-10">
      <div className="flex-1 flex flex-col items-start justify-center px-6 md:px-0">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-5xl text-yellow-300 drop-shadow">⚡</span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-wide drop-shadow">CodeTracker</h1>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-indigo-100 mb-4 max-w-xl">Supercharge Your Coding Journey</h2>
        <p className="text-lg text-indigo-200 mb-6 max-w-xl">Track. Practice. Improve. — All in one platform.<br />
          <span className="block mt-2 text-base text-indigo-300">✅ Unified progress tracking across platforms<br />
          ✅ Personalized AI feedback & smart recommendations<br />
          ✅ Virtual contests & skill-based practice</span>
        </p>
        <div className="flex gap-4 mb-6 w-full md:w-auto">
          <Link to="/login" className="px-8 py-4 rounded-xl font-bold shadow bg-gradient-to-r from-indigo-500 to-blue-500 text-white border-2 border-indigo-200 hover:scale-105 hover:bg-indigo-600 transition text-lg text-center">Get Started</Link>
          <Link to="/register" className="px-8 py-4 rounded-xl font-bold shadow bg-gradient-to-r from-pink-500 to-yellow-400 text-white border-2 border-pink-200 hover:scale-105 hover:bg-pink-600 transition text-lg text-center">Create Account</Link>
        </div>
        <div className="flex gap-3 mt-2">
          <span className="inline-flex items-center px-4 py-1 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm shadow border border-indigo-200">Boost your coding profile</span>
          <span className="inline-flex items-center px-4 py-1 rounded-full bg-pink-100 text-pink-700 font-bold text-sm shadow border border-pink-200">AI-powered insights</span>
        </div>
      </div>
      {/* Dashboard GIF/Preview */}
      <div className="flex-1 flex items-center justify-center relative">
        <div className="w-full max-w-lg rounded-2xl shadow-2xl border-4 border-white/20 overflow-hidden bg-white/10 backdrop-blur-lg">
          <img src="/dashboard-demo.gif" alt="Dashboard Preview" className="w-full h-80 object-cover object-top animate-pulse" style={{ filter: 'blur(1.5px) brightness(0.95)' }} />
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <Link to="/login" className="px-6 py-2 rounded-xl font-bold shadow bg-gradient-to-r from-indigo-500 to-blue-500 text-white border-2 border-indigo-200 hover:scale-105 hover:bg-indigo-600 transition text-base">See Demo</Link>
        </div>
      </div>
    </div>

    {/* Value Proposition Section */}
    <div className="w-full px-0 md:px-16 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {valueProps.map((f, i) => (
        <div key={i} className="bg-white/10 rounded-2xl shadow-lg p-6 flex flex-col items-start gap-3 border border-white/20 hover:scale-105 transition-transform">
          <span className="text-3xl md:text-4xl">{f.icon}</span>
          <h3 className="text-lg font-bold text-indigo-100 mb-1">{f.title}</h3>
          <p className="text-indigo-200 text-sm">{f.desc}</p>
        </div>
      ))}
    </div>

    {/* Features Section */}
    <div className="w-full px-0 md:px-16 py-12">
      <h3 className="text-2xl font-bold text-indigo-100 text-center mb-8">Features</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <div key={i} className="bg-white/10 rounded-2xl shadow-lg p-6 flex flex-col items-center gap-3 border border-white/20 hover:scale-105 transition-transform">
            <span className="text-3xl md:text-4xl">{f.icon}</span>
            <h4 className="text-lg font-bold text-indigo-100 mb-1">{f.title}</h4>
            <p className="text-indigo-200 text-sm text-center">{f.desc}</p>
            {f.title === 'CodeBot AI Mentor' && <span className="text-xs text-pink-300 font-bold animate-bounce mt-1">Try me in Analytics!</span>}
            {f.title === 'Practice Scheduler' && <span className="text-xs text-yellow-300 font-bold animate-pulse mt-1">Coming Soon</span>}
          </div>
        ))}
      </div>
    </div>

    {/* Live Preview / Demo Section */}
    <div className="w-full px-0 md:px-16 py-12 flex flex-col items-center">
      <h3 className="text-2xl font-bold text-indigo-100 mb-4">Live Preview</h3>
      <div className="w-full max-w-3xl rounded-2xl shadow-2xl border-4 border-white/20 overflow-hidden bg-white/10 backdrop-blur-lg mb-6">
        <img src="/dashboard-demo.gif" alt="Dashboard Preview" className="w-full h-72 object-cover object-top animate-pulse" style={{ filter: 'blur(2px) brightness(0.95)' }} />
      </div>
      <Link to="/login" className="px-8 py-3 rounded-xl font-bold shadow bg-gradient-to-r from-indigo-500 to-blue-500 text-white border-2 border-indigo-200 hover:scale-105 hover:bg-indigo-600 transition text-lg text-center">Try Interactive Demo</Link>
    </div>

    {/* Testimonials / Social Proof */}
    <div className="w-full px-0 md:px-16 py-12">
      <h3 className="text-2xl font-bold text-indigo-100 text-center mb-8">What Coders Say</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {testimonials.map((t, i) => (
          <div key={i} className="bg-white/10 rounded-2xl shadow-lg p-6 border border-white/20 flex flex-col gap-2">
            <p className="text-indigo-100 text-lg italic">“{t.quote}”</p>
            <span className="text-indigo-300 font-bold text-sm mt-2">— {t.user}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Community & Support */}
    <div className="w-full px-0 md:px-16 py-12 flex flex-col items-center">
      <h3 className="text-2xl font-bold text-indigo-100 mb-4">Join the Community</h3>
      <div className="flex flex-wrap gap-4 mb-6">
        <a href="#" className="px-6 py-2 rounded-xl font-bold shadow bg-gradient-to-r from-indigo-400 to-blue-400 text-white border-2 border-indigo-200 hover:scale-105 hover:bg-indigo-600 transition text-base">💬 Discord</a>
        <a href="#" className="px-6 py-2 rounded-xl font-bold shadow bg-gradient-to-r from-pink-400 to-yellow-400 text-white border-2 border-pink-200 hover:scale-105 hover:bg-pink-600 transition text-base">🛠️ Feature Requests</a>
        <a href="#" className="px-6 py-2 rounded-xl font-bold shadow bg-gradient-to-r from-green-400 to-blue-400 text-white border-2 border-green-200 hover:scale-105 hover:bg-green-600 transition text-base">📢 Blog</a>
      </div>
      <div className="flex gap-3 mt-2">
        {badges.map((b, i) => (
          <span key={i} className="inline-flex items-center px-4 py-1 rounded-full bg-white/20 text-indigo-100 font-bold text-sm shadow border border-white/20">
            {b.icon} {b.label}
          </span>
        ))}
      </div>
    </div>

    {/* Call to Action Section */}
    <div className="w-full px-0 md:px-16 py-12 flex flex-col items-center">
      <h3 className="text-2xl font-bold text-indigo-100 mb-4">Start tracking smarter.<br />Take control of your coding future.</h3>
      <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
        <Link to="/register" className="w-full md:w-auto px-8 py-4 rounded-xl font-bold shadow bg-gradient-to-r from-pink-500 to-yellow-400 text-white border-2 border-pink-200 hover:scale-105 hover:bg-pink-600 transition text-lg text-center">Create Account</Link>
        <Link to="/platforms" className="w-full md:w-auto px-8 py-4 rounded-xl font-bold shadow bg-gradient-to-r from-indigo-500 to-blue-500 text-white border-2 border-indigo-200 hover:scale-105 hover:bg-indigo-600 transition text-lg text-center">Connect Platforms</Link>
        <Link to="/analytics" className="w-full md:w-auto px-8 py-4 rounded-xl font-bold shadow bg-gradient-to-r from-green-500 to-blue-400 text-white border-2 border-green-200 hover:scale-105 hover:bg-green-600 transition text-lg text-center">Explore Features</Link>
      </div>
    </div>
  
    <footer className="w-full bg-gradient-to-r from-indigo-900/80 via-blue-900/80 to-purple-900/80 border-t border-white/10 mt-12 py-8 px-0 md:px-16 flex flex-col md:flex-row items-center justify-between gap-6 text-indigo-200 z-20">
      <div className="flex items-center gap-2">
        <span className="text-2xl text-yellow-300">⚡</span>
        <span className="font-bold text-lg text-white tracking-wide">CodeTracker</span>
      </div>
      <div className="flex flex-wrap gap-6 text-sm font-semibold">
        <Link to="/" className="hover:text-white transition">Home</Link>
        <Link to="/analytics" className="hover:text-white transition">Features</Link>
        <a href="#" className="hover:text-white transition">Community</a>
        <a href="mailto:support@codetracker.com" className="hover:text-white transition">Contact</a>
      </div>
      <div className="flex gap-4 items-center">
        <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition" title="GitHub"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.338 4.695-4.566 4.944.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.749 0 .267.18.577.688.479C19.138 20.2 22 16.448 22 12.021 22 6.484 17.523 2 12 2z" /></svg></a>
        <a href="#" className="hover:text-white transition" title="Discord"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.369A19.791 19.791 0 0016.885 3.2a.486.486 0 00-.522.243c-.211.375-.444.864-.608 1.249-1.844-.276-3.68-.276-5.486 0-.164-.385-.397-.874-.608-1.249a.486.486 0 00-.522-.243c-1.432.36-2.814.877-4.132 1.669a.48.48 0 00-.217.211C.533 9.043-.32 13.579.099 18.057a.48.48 0 00.18.334c1.8 1.32 3.548 2.132 5.304 2.646a.48.48 0 00.522-.211c.403-.664.76-1.36 1.056-2.08a17.978 17.978 0 005.486 0c.296.72.653 1.416 1.056 2.08a.48.48 0 00.522.211c1.756-.514 3.504-1.326 5.304-2.646a.48.48 0 00.18-.334c.5-5.02-.838-9.557-3.583-13.477a.48.48 0 00-.217-.211zM8.02 15.331c-1.105 0-2.004-.993-2.004-2.219 0-1.225.89-2.218 2.004-2.218 1.105 0 2.004.993 2.004 2.218 0 1.226-.89 2.219-2.004 2.219zm7.96 0c-1.105 0-2.004-.993-2.004-2.219 0-1.225.89-2.218 2.004-2.218 1.105 0 2.004.993 2.004 2.218 0 1.226-.89 2.219-2.004 2.219z" /></svg></a>
        <a href="#" className="hover:text-white transition" title="LinkedIn"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm15.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.967v5.7h-3v-10h2.881v1.367h.041c.401-.761 1.379-1.563 2.841-1.563 3.039 0 3.6 2.001 3.6 4.601v5.595z" /></svg></a>
      </div>
      <div className="text-xs text-indigo-300 mt-2">© {year} CodeTracker. All rights reserved. | support@codetracker.com</div>
      <div className="text-xs text-indigo-400 mt-1">Made with ❤️ for coders by coders.</div>
    </footer>
  </div>
  );
};

export default MainPage;
