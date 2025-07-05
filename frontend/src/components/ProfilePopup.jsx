import React, { useState } from 'react';
import { usersAPI } from '../services/api'; // Import the users API service

const ProfilePopup = ({ user, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    username: user?.username || '',
    mobile: user?.contactInfo?.mobile || '',
    city: user?.contactInfo?.city || '',
    state: user?.contactInfo?.state || '',
    pinCode: user?.contactInfo?.pinCode || '',
    country: user?.contactInfo?.country || ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create profile update object
      const updatedProfile = {
        name: formData.name,
        email: formData.email
      };
      
      // Only add contactInfo if it's not empty
      if (formData.mobile || formData.city || formData.state || formData.pinCode || formData.country) {
        updatedProfile.contactInfo = {};
        if (formData.mobile) updatedProfile.contactInfo.mobile = formData.mobile;
        if (formData.city) updatedProfile.contactInfo.city = formData.city;
        if (formData.state) updatedProfile.contactInfo.state = formData.state;
        if (formData.pinCode) updatedProfile.contactInfo.pinCode = formData.pinCode;
        if (formData.country) updatedProfile.contactInfo.country = formData.country;
      }
      
      console.log('Sending profile update:', updatedProfile);
      
      // Use the users API service with better error handling
      try {
        const response = await usersAPI.updateProfile(updatedProfile);
        console.log('Profile update response:', response.data);
        
        // Create a merged user object for the UI update
        const updatedUser = {
          ...user,
          ...updatedProfile
        };
        
        onUpdate(updatedUser);
        setIsEditing(false);
        alert("Profile updated successfully!");
      } catch (apiErr) {
        console.error('API error:', apiErr);
        const errorMsg = apiErr.response?.data?.msg || 'Failed to update profile';
        alert(`Error: ${errorMsg}`);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      alert("Failed to update profile. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
        <div className="bg-indigo-600 px-4 py-3 flex justify-between items-center">
          <h2 className="text-white font-medium">User Profile</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4">
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Mobile</label>
                <input
                  type="text"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">PIN Code</label>
                  <input
                    type="text"
                    name="pinCode"
                    value={formData.pinCode}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
                >
                  Save
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="flex items-center justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-2xl text-indigo-800 font-medium">
                  {user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                </div>
              </div>
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold">{user?.name}</h3>
                <p className="text-gray-600">{user?.email}</p>
                <p className="text-sm text-gray-500 mt-1">Member since {new Date(user?.createdAt).toLocaleDateString()}</p>
              </div>
              
              {/* Display contact info */}
              <div className="border-t border-gray-200 pt-4 mb-4">
                <h4 className="font-medium mb-2">Contact Information</h4>
                <div className="space-y-1 text-sm">
                  {user?.contactInfo?.mobile && <p><span className="font-medium">Mobile:</span> {user.contactInfo.mobile}</p>}
                  {(user?.contactInfo?.city || user?.contactInfo?.state) && (
                    <p>
                      <span className="font-medium">Location:</span> 
                      {[
                        user.contactInfo.city, 
                        user.contactInfo.state, 
                        user.contactInfo.pinCode, 
                        user.contactInfo.country
                      ].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-medium mb-2">Connected Platforms</h4>
                <div className="space-y-2">
                  {user?.platformAccounts?.map(account => (
                    <div key={account.platform} className="flex items-center justify-between">
                      <span className="capitalize">{account.platform}</span>
                      <span className="text-indigo-600">{account.username}</span>
                    </div>
                  ))}
                  {!user?.platformAccounts?.length && (
                    <p className="text-gray-500 text-sm">No platforms connected</p>
                  )}
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePopup;