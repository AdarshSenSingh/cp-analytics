import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Profile = () => {
  const { token, user } = useAuth();
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    joinedDate: '2023-01-15',
    preferences: {
      reminderFrequency: 'weekly',
      preferredDifficulty: 'medium',
      preferredTopics: ['arrays', 'dynamic programming', 'graphs'],
      darkMode: false
    },
    stats: {
      totalSolved: 127,
      totalSubmissions: 215,
      successRate: 78.5,
      points: 1250
    },
    platforms: [
      { name: 'LeetCode', username: 'johndoe_leet', problemsSolved: 85 },
      { name: 'Codeforces', username: 'johndoe_cf', problemsSolved: 42 }
    ],
    achievements: [
      { name: 'First Blood', description: 'Solved your first problem', earnedAt: '2023-01-16', icon: '🏆' },
      { name: 'Streak Master', description: 'Solved problems for 7 consecutive days', earnedAt: '2023-02-01', icon: '🔥' },
      { name: 'Algorithm Ace', description: 'Solved 50 algorithm problems', earnedAt: '2023-03-15', icon: '⭐' }
    ]
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  
  useEffect(() => {
    // In a real app, fetch user profile data from API
    // For now, we're using sample data
    setFormData({
      name: profile.name,
      email: profile.email,
      reminderFrequency: profile.preferences.reminderFrequency,
      preferredDifficulty: profile.preferences.preferredDifficulty,
      preferredTopics: profile.preferences.preferredTopics.join(', '),
      darkMode: profile.preferences.darkMode
    });
  }, [profile]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, send updated profile to API
    const updatedProfile = {
      ...profile,
      name: formData.name,
      email: formData.email,
      preferences: {
        ...profile.preferences,
        reminderFrequency: formData.reminderFrequency,
        preferredDifficulty: formData.preferredDifficulty,
        preferredTopics: formData.preferredTopics.split(',').map(topic => topic.trim()),
        darkMode: formData.darkMode
      }
    };
    setProfile(updatedProfile);
    setIsEditing(false);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">User Profile</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-primary-600 px-6 py-4">
              <div className="flex items-center justify-center">
                <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center text-4xl">
                  {profile.name.charAt(0)}
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4">
              <h2 className="text-2xl font-bold text-center mb-2">{profile.name}</h2>
              <p className="text-gray-500 text-center mb-4">{profile.email}</p>
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <p className="text-sm text-gray-500">Member since</p>
                <p className="font-medium">{new Date(profile.joinedDate).toLocaleDateString()}</p>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <p className="text-sm text-gray-500">Total points</p>
                <p className="text-3xl font-bold text-primary-600">{profile.stats.points}</p>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
          
          {/* Connected Platforms */}
          <div className="bg-white rounded-lg shadow overflow-hidden mt-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium">Connected Platforms</h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {profile.platforms.map((platform, index) => (
                <div key={index} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{platform.name}</h3>
                      <p className="text-sm text-gray-500">{platform.username}</p>
                    </div>
                    <div>
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {platform.problemsSolved} solved
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="px-6 py-4 bg-gray-50">
              <button className="text-sm font-medium text-primary-600 hover:text-primary-500">
                Connect new platform
              </button>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="lg:col-span-2">
          {isEditing ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium">Edit Profile</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="px-6 py-4">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="reminderFrequency" className="block text-sm font-medium text-gray-700">Reminder Frequency</label>
                    <select
                      id="reminderFrequency"
                      name="reminderFrequency"
                      value={formData.reminderFrequency}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="never">Never</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="preferredDifficulty" className="block text-sm font-medium text-gray-700">Preferred Difficulty</label>
                    <select
                      id="preferredDifficulty"
                      name="preferredDifficulty"
                      value={formData.preferredDifficulty}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                      <option value="all">All</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="preferredTopics" className="block text-sm font-medium text-gray-700">Preferred Topics (comma-separated)</label>
                    <input
                      type="text"
                      id="preferredTopics"
                      name="preferredTopics"
                      value={formData.preferredTopics}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="darkMode"
                      name="darkMode"
                      checked={formData.darkMode}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="darkMode" className="ml-2 block text-sm text-gray-700">Dark Mode</label>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium">Coding Stats</h2>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-200">
                  <div className="p-6 text-center">
                    <p className="text-sm text-gray-500">Problems Solved</p>
                    <p className="mt-2 text-3xl font-semibold">{profile.stats.totalSolved}</p>
                  </div>
                  
                  <div className="p-6 text-center">
                    <p className="text-sm text-gray-500">Total Submissions</p>
                    <p className="mt-2 text-3xl font-semibold">{profile.stats.totalSubmissions}</p>
                  </div>
                  
                  <div className="p-6 text-center">
                    <p className="text-sm text-gray-500">Success Rate</p>
                    <p className="mt-2 text-3xl font-semibold">{profile.stats.successRate}%</p>
                  </div>
                  
                  <div className="p-6 text-center">
                    <p className="text-sm text-gray-500">Points</p>
                    <p className="mt-2 text-3xl font-semibold">{profile.stats.points}</p>
                  </div>
                </div>
              </div>
              
              {/* Preferences */}
              <div className="bg-white rounded-lg shadow overflow-hidden mt-8">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium">Preferences</h2>
                </div>
                
                <div className="px-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Reminder Frequency</h3>
                      <p className="mt-1 capitalize">{profile.preferences.reminderFrequency}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Preferred Difficulty</h3>
                      <p className="mt-1 capitalize">{profile.preferences.preferredDifficulty}</p>
                    </div>
                    
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-medium text-gray-500">Preferred Topics</h3>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {profile.preferences.preferredTopics.map((topic, index) => (
                          <span key={index} className="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Dark Mode</h3>
                      <p className="mt-1">{profile.preferences.darkMode ? 'Enabled' : 'Disabled'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Achievements */}
              <div className="bg-white rounded-lg shadow overflow-hidden mt-8">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium">Achievements</h2>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {profile.achievements.map((achievement, index) => (
                    <div key={index} className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="text-3xl mr-4">{achievement.icon}</div>
                        <div>
                          <h3 className="font-medium">{achievement.name}</h3>
                          <p className="text-sm text-gray-500">{achievement.description}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Earned on {new Date(achievement.earnedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;