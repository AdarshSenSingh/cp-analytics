import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Profile = () => {
  const { token, user, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    username: '',
    contactInfo: {
      mobile: '',
      city: '',
      state: '',
      pinCode: '',
      country: ''
    },
    profilePicture: '',
    joinedDate: '',
    preferences: {
      reminderFrequency: 'weekly',
      preferredDifficulty: 'medium',
      preferredTopics: [],
      darkMode: false
    },
    platformAccounts: []
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/api/users/profile', {
          headers: { 'x-auth-token': token }
        });
        
        setProfile(response.data);
        setFormData({
          name: response.data.name,
          email: response.data.email,
          mobile: response.data.contactInfo?.mobile || '',
          city: response.data.contactInfo?.city || '',
          state: response.data.contactInfo?.state || '',
          pinCode: response.data.contactInfo?.pinCode || '',
          country: response.data.contactInfo?.country || '',
          reminderFrequency: response.data.preferences?.reminderFrequency || 'weekly',
          preferredDifficulty: response.data.preferences?.preferredDifficulty || 'medium',
          preferredTopics: response.data.preferences?.preferredTopics?.join(', ') || '',
          darkMode: response.data.preferences?.darkMode || false
        });
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };
    
    fetchProfile();
  }, [token]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedProfile = {
        name: formData.name,
        email: formData.email,
        contactInfo: {
          mobile: formData.mobile,
          city: formData.city,
          state: formData.state,
          pinCode: formData.pinCode,
          country: formData.country
        },
        preferences: {
          reminderFrequency: formData.reminderFrequency,
          preferredDifficulty: formData.preferredDifficulty,
          preferredTopics: formData.preferredTopics.split(',').map(topic => topic.trim()),
          darkMode: formData.darkMode
        }
      };
      
      const response = await axios.put('/api/users/profile', updatedProfile, {
        headers: { 'x-auth-token': token }
      });
      
      setProfile(response.data);
      updateUser(response.data);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };
  
  const handleProfilePictureClick = () => {
    fileInputRef.current.click();
  };
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    try {
      setIsUploading(true);
      const response = await axios.post('/api/users/profile/picture', formData, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setProfile(prev => ({
        ...prev,
        profilePicture: response.data.profilePicture
      }));
      
      updateUser({
        ...user,
        profilePicture: response.data.profilePicture
      });
    } catch (err) {
      console.error('Error uploading profile picture:', err);
    } finally {
      setIsUploading(false);
    }
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
                <div 
                  className="relative h-24 w-24 rounded-full bg-white flex items-center justify-center text-4xl cursor-pointer"
                  onClick={handleProfilePictureClick}
                >
                  {profile.profilePicture ? (
  <img
    src={profile.profilePicture}
    alt={profile.name}
    className="h-24 w-24 rounded-full object-cover"
    onError={e => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }}
  />
) : (
  <img
    src="/default-avatar.png"
    alt="Default Avatar"
    className="h-24 w-24 rounded-full object-cover"
  />
)}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                  />
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
              {profile.platformAccounts.map((platform, index) => (
                <div key={index} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{platform.platform}</h3>
                      <p className="text-sm text-gray-500">{platform.username}</p>
                    </div>
                    <div>
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {platform.stats?.problemsSolved || 0} solved
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="px-6 py-4 bg-gray-50">
              <Link to="/platforms" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                Connect new platform
              </Link>
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
              
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile Number
                    </label>
                    <input
                      type="text"
                      id="mobile"
                      name="mobile"
                      value={formData.mobile || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="pinCode" className="block text-sm font-medium text-gray-700 mb-1">
                      PIN Code
                    </label>
                    <input
                      type="text"
                      id="pinCode"
                      name="pinCode"
                      value={formData.pinCode || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={formData.country || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                
                {/* Preferences section */}
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Preferences</h3>
                  
                  {/* Existing preferences fields... */}
                </div>
                
                <div className="mt-8 flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Save Changes
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
              {/* Daily/Custom Target Section */}
              <div className="bg-white rounded-lg shadow overflow-hidden mt-8">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium flex items-center">🎯 Set Your Daily/Custom Target</h2>
                  <p className="text-sm text-gray-500 mt-1">Set a target and boost your consistency!</p>
                </div>
                <div className="px-6 py-4">
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const targetType = e.target.targetType.value;
                      const targetTime = e.target.targetTime.value;
                      const email = profile.email;
                      try {
                        await axios.post('/api/targets', {
                          targetType,
                          targetTime,
                          email
                        }, {
                          headers: { 'x-auth-token': token }
                        });
                        alert('Target set! You will receive an email reminder.');
                      } catch (err) {
                        alert('Failed to set target.');
                      }
                    }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Target Type</label>
                      <select name="targetType" className="w-full px-3 py-2 border border-gray-300 rounded-md">
                        <option value="solve">Solve Problems</option>
                        <option value="contest">Give a Contest</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                      <input type="time" name="targetTime" required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                      <button type="submit" className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition">Set Target</button>
                    </div>
                  </form>
                </div>
              </div>
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