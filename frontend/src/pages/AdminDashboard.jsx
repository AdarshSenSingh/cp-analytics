import React from 'react';
import Navbar from '../components/Navbar';

const AdminDashboard = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-700">
        <div className="bg-white/80 shadow-2xl rounded-2xl p-10 w-full max-w-2xl mx-4 border border-white/40">
          <h1 className="text-4xl font-extrabold text-indigo-700 mb-6 text-center">Admin Dashboard</h1>
          <p className="text-lg text-gray-700 text-center">Welcome, Admin! Here you can manage users, view analytics, and perform admin tasks.</p>
          {/* Add more admin features here as needed */}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
