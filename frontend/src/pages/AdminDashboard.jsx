import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { usersAPI } from '../services/api';
import { FaUserShield, FaUsers } from 'react-icons/fa';

const AdminDashboard = () => {
  const token = localStorage.getItem('token');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await usersAPI.getAllUsers(token);
        setUsers(res.data.users || []);
      } catch (err) {
        if (err.response && err.response.data && err.response.data.msg) {
          setError(err.response.data.msg);
        } else {
          setError('Failed to fetch users.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token]);

  // Summary cards
  const totalUsers = users.length;
  // Active users: users with a Codeforces sync in the last 7 days
  const now = new Date();
  const activeUsers = users.filter(user => {
    const cf = user.platformAccounts?.find(acc => acc.platform === 'codeforces');
    if (cf && cf.lastSynced) {
      const lastSync = new Date(cf.lastSynced);
      const diffDays = (now - lastSync) / (1000 * 60 * 60 * 24);
      return diffDays <= 7;
    }
    return false;
  }).length;

  return (
    <>
      <Navbar />
      {/* Modern background with SVG overlay */}
      <div className="min-h-screen relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex flex-col items-center justify-start py-0 px-0">
        {/* SVG abstract background */}
        <svg className="absolute top-0 left-0 w-full h-96 opacity-30 z-0" viewBox="0 0 1440 320">
          <path fill="#fff" fillOpacity="0.2" d="M0,160L60,170.7C120,181,240,203,360,197.3C480,192,600,160,720,133.3C840,107,960,85,1080,101.3C1200,117,1320,171,1380,197.3L1440,224L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"></path>
        </svg>
        {/* Unified header and summary cards */}
        <div className="relative z-10 w-full max-w-5xl mx-auto mt-8 mb-8 px-4">
          <div className="bg-white/90 shadow-2xl rounded-2xl p-8 border border-white/40 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <FaUserShield className="text-indigo-700 text-3xl" />
              <h1 className="text-2xl md:text-3xl font-extrabold text-indigo-700 tracking-tight">Admin Dashboard</h1>
              <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-bold uppercase tracking-wider">Admin</span>
            </div>
            <div className="flex gap-4 w-full md:w-auto justify-center">
              <div className="bg-indigo-50 rounded-xl shadow p-4 flex flex-col items-center min-w-[120px] border border-indigo-100">
                <FaUsers className="text-indigo-600 text-xl mb-1" />
                <div className="text-xl font-bold">{totalUsers}</div>
                <div className="text-xs text-gray-500 mt-1">Total Users</div>
              </div>
              <div className="bg-indigo-50 rounded-xl shadow p-4 flex flex-col items-center min-w-[120px] border border-indigo-100">
                <FaUsers className="text-green-600 text-xl mb-1" />
                <div className="text-xl font-bold">{activeUsers}</div>
                <div className="text-xs text-gray-500 mt-1">Active Users</div>
              </div>
            </div>
          </div>
        </div>
        {/* Main content */}
        <main className="relative z-10 w-full max-w-5xl mx-auto bg-white/95 shadow-2xl rounded-2xl p-8 border border-white/40 mb-10">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaUsers className="text-indigo-500" /> User Status
          </h2>
          {loading ? (
            <div className="text-center py-10 text-gray-500">Loading users...</div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 rounded-xl overflow-hidden">
                <thead className="bg-indigo-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Codeforces Username</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Codeforces Rating</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">Last Synced</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-6 text-gray-400">No users found.</td>
                    </tr>
                  )}
                  {users.map((user, idx) => {
                    const cf = user.platformAccounts?.find(acc => acc.platform === 'codeforces');
                    return (
                      <tr key={user._id} className={idx % 2 === 0 ? 'bg-white' : 'bg-indigo-50/50 hover:bg-indigo-100/60'}>
                        <td className="px-4 py-2 font-semibold text-gray-800">{user.name}</td>
                        <td className="px-4 py-2">{cf?.username || <span className="text-gray-400">-</span>}</td>
                        <td className="px-4 py-2">{user.codeforcesRating !== null && user.codeforcesRating !== undefined ? user.codeforcesRating : <span className="text-gray-400">-</span>}</td>
                        <td className="px-4 py-2">{cf?.lastSynced ? new Date(cf.lastSynced).toLocaleString() : <span className="text-gray-400">-</span>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </main>
        {/* Footer */}
        <footer className="relative z-10 w-full text-center py-4 text-xs text-gray-400 bg-transparent mt-auto">
          &copy; {new Date().getFullYear()} Coding Platform Admin. All rights reserved.
        </footer>
      </div>
    </>
  );
};

export default AdminDashboard;
