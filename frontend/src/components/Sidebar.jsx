import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon, 
  CodeBracketSquareIcon, 
  DocumentTextIcon, 
  ChartBarIcon, 
  GlobeAltIcon 
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
    { name: 'Problems', path: '/problems', icon: CodeBracketSquareIcon },
    { name: 'Submissions', path: '/submissions', icon: DocumentTextIcon },
    { name: 'Analytics', path: '/analytics', icon: ChartBarIcon },
    { name: 'Platforms', path: '/platforms', icon: GlobeAltIcon },
    { name: 'Contest', path: '/contest', icon: ChartBarIcon }, // Reusing ChartBarIcon for Contest
  ];

  return (
    <div className="h-screen bg-white border-r border-gray-200 w-64 fixed left-0 top-0 shadow-sm">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <h1 className="text-xl font-bold text-indigo-600">CodeTracker</h1>
      </div>
      
      {/* Navigation */}
      <nav className="mt-5 px-2">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => 
                `group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon 
                    className={`mr-3 h-5 w-5 transition-colors ${
                      isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'
                    }`} 
                  />
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
      
      {/* User Section - Removed */}
    </div>
  );
};

export default Sidebar;
