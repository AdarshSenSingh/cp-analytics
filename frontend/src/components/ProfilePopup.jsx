import React, { useState, useRef } from 'react';
import { usersAPI } from '../services/api';

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
  const [profilePic, setProfilePic] = useState(user?.profilePicture || null);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfilePicUpload = async () => {
    if (!profilePicFile) return null;
    const formData = new FormData();
    formData.append('profilePicture', profilePicFile);
    try {
      const res = await usersAPI.uploadProfilePicture(formData);
      return res.data.profilePictureUrl;
    } catch (err) {
      alert('Failed to upload profile picture.');
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Upload profile picture if changed
      let profilePictureUrl = user?.profilePicture;
      if (profilePicFile) {
        profilePictureUrl = await handleProfilePicUpload();
      }
      // Create profile update object
      const updatedProfile = {
        name: formData.name,
        email: formData.email
      };
      if (profilePictureUrl) updatedProfile.profilePicture = profilePictureUrl;
      // Only add contactInfo if it's not empty
      if (formData.mobile || formData.city || formData.state || formData.pinCode || formData.country) {
        updatedProfile.contactInfo = {};
        if (formData.mobile) updatedProfile.contactInfo.mobile = formData.mobile;
        if (formData.city) updatedProfile.contactInfo.city = formData.city;
        if (formData.state) updatedProfile.contactInfo.state = formData.state;
        if (formData.pinCode) updatedProfile.contactInfo.pinCode = formData.pinCode;
        if (formData.country) updatedProfile.contactInfo.country = formData.country;
      }
      // Use the users API service with better error handling
      try {
        const response = await usersAPI.updateProfile(updatedProfile);
        // Create a merged user object for the UI update
        const updatedUser = {
          ...user,
          ...updatedProfile
        };
        if (profilePictureUrl) updatedUser.profilePicture = profilePictureUrl;
        onUpdate(updatedUser);
        // Persist updated user to localStorage for future popups
        localStorage.setItem('user', JSON.stringify(updatedUser));
        if (profilePictureUrl) setProfilePic(profilePictureUrl);
        setProfilePicFile(null);
        setIsEditing(false);
        alert("Profile updated successfully!");
      } catch (apiErr) {
        const errorMsg = apiErr.response?.data?.msg || 'Failed to update profile';
        alert(`Error: ${errorMsg}`);
      }
    } catch (err) {
      alert("Failed to update profile. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your profile? This action cannot be undone.')) return;
    setIsDeleting(true);
    try {
      await usersAPI.deleteProfile();
      alert('Profile deleted. Logging out...');
      localStorage.clear();
      window.location.href = '/';
    } catch (err) {
      alert('Failed to delete profile.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-400/40 via-blue-200/30 to-purple-200/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-indigo-100/80 via-blue-50/90 to-purple-100/80 rounded-2xl shadow-2xl border border-indigo-100 w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-indigo-100 bg-white/60">
          <div className="flex items-center gap-2">
            <span className="text-2xl text-indigo-400">👤</span>
            <h2 className="text-lg font-bold text-indigo-900 tracking-wide">User Profile</h2>
          </div>
          <button onClick={onClose} className="text-indigo-400 hover:text-indigo-600 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col items-center mb-4">
                <div className="relative w-24 h-24 mb-2">
                  <img
                    src={profilePic || '/default-avatar.png'}
                    alt="Profile"
                    className="w-24 h-24 object-cover rounded-full border-4 border-indigo-200 shadow"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="absolute bottom-0 right-0 bg-indigo-600 text-white rounded-full p-1 hover:bg-indigo-700 shadow"
                    title="Change picture"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 10-4-4l-8 8v3z" />
                    </svg>
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleProfilePicChange}
                    className="hidden"
                  />
                </div>
                <span className="text-xs text-gray-500">Click the camera to change</span>
              </div>
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
              <div className="flex justify-between space-x-2">
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
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Profile'}
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="flex flex-col items-center justify-center mb-4">
                <div className="relative w-24 h-24 mb-2 group">
                  <img
                    src={profilePic || user?.profilePicture || '/default-avatar.png'}
                    alt="Profile"
                    className="w-24 h-24 object-cover rounded-full border-4 border-indigo-200 shadow transition-all duration-200 group-hover:brightness-90"
                    onError={e => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="absolute bottom-0 right-0 bg-indigo-600 text-white rounded-full p-1.5 hover:bg-indigo-700 shadow-lg border-2 border-white transition-all duration-200 opacity-90 group-hover:opacity-100"
                    title="Change profile photo"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 10-4-4l-8 8v3z" />
                    </svg>
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleProfilePicChange}
                    className="hidden"
                  />
                </div>
                <span className="text-xs text-gray-500">Click the camera to change</span>
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
              <div className="mt-4 flex justify-between">
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded w-full"
                >
                  Edit Profile
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-full ml-2"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Profile'}
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