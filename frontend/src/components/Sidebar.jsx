import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon, 
  CodeBracketSquareIcon, 
  DocumentTextIcon, 
  ChartBarIcon, 
  GlobeAltIcon 
} from '@heroicons/react/24/outline';
import { useLocation } from 'react-router-dom';

const Sidebar = ({ onAIBuddyClick }) => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
    { name: 'Problems', path: '/problems', icon: CodeBracketSquareIcon },
    { name: 'Submissions', path: '/submissions', icon: DocumentTextIcon },
    { name: 'Analytics', path: '/analytics', icon: ChartBarIcon },
    { name: 'Platforms', path: '/platforms', icon: GlobeAltIcon },
    { name: 'Contest', path: '/contest', icon: ChartBarIcon }, // Reusing ChartBarIcon for Contest
  ];

  return (
    <div className="h-screen w-64 fixed left-0 top-0 z-30 bg-gradient-to-br from-indigo-500/70 via-blue-400/60 to-purple-400/60 backdrop-blur-xl border-r border-white/10 shadow-2xl flex flex-col">
      {/* Logo */}
      <div className="flex items-center justify-center h-20 border-b border-white/10 bg-gradient-to-r from-indigo-600/80 to-blue-500/80 shadow-lg">
        <span className="mr-2 text-3xl text-yellow-300 drop-shadow">⚡</span>
        <h1 className="text-2xl font-extrabold text-white tracking-wide drop-shadow">CodeTracker</h1>
      </div>
      {/* Navigation */}
      <nav className="mt-8 px-4 flex-1">
        <div className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-5 py-3 text-base font-semibold rounded-xl transition-all duration-200 shadow-sm border border-transparent ${
                  isActive
                    ? 'bg-white/90 text-indigo-700 border-indigo-400 shadow-lg scale-105'
                    : 'text-white/80 hover:bg-white/20 hover:text-white/100 hover:scale-105'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`h-6 w-6 transition-colors ${
                      isActive ? 'text-yellow-400' : 'text-indigo-200 group-hover:text-yellow-200'
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
      <div className="flex-1"></div>
      {/* AI Buddy above Log Out, only on /analytics */}
      {(() => {
        const location = useLocation();
        if (location.pathname.startsWith('/analytics')) {
          return (
            <div className="flex flex-col items-center mb-4">
              <button
                className="text-4xl animate-bounce mb-2 hover:scale-110 transition"
                title="Ask AI Buddy for help!"
                onClick={onAIBuddyClick}
                style={{ pointerEvents: 'auto' }}
              >
                🤖
              </button>
              <div className="text-xs text-indigo-700 font-bold text-center">AI Buddy</div>
            </div>
          );
        }
        return null;
      })()}
      <div className="px-4 pb-6">
        <button
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold shadow bg-gradient-to-r from-red-500 to-pink-500 text-white border-2 border-red-200 hover:scale-105 hover:bg-red-600 transition"
          onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" /></svg>
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
