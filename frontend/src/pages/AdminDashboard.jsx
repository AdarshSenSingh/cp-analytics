import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { usersAPI } from '../services/api';

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
        // Adjust endpoint if your backend uses a different one
        const res = await usersAPI.getAllUsers(token);
        setUsers(res.data.users || []);
      } catch (err) {
        setError('Failed to fetch users.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-700 py-10 px-2">
        <div className="bg-white/90 shadow-2xl rounded-2xl p-8 w-full max-w-5xl mx-auto border border-white/40">
          <h1 className="text-3xl font-extrabold text-indigo-700 mb-6 text-center">Admin Dashboard</h1>
          <h2 className="text-xl font-bold text-gray-800 mb-4">User Status</h2>
          {loading ? (
            <div className="text-center py-10 text-gray-500">Loading users...</div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Codeforces Username</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Codeforces Rating</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Last Synced</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-6 text-gray-400">No users found.</td>
                    </tr>
                  )}
                  {users.map((user) => {
                    // Find codeforces account
                    const cf = user.platformAccounts?.find(acc => acc.platform === 'codeforces');
                    return (
                      <tr key={user._id}>
                        <td className="px-4 py-2 font-semibold text-gray-800">{user.name}</td>
                        <td className="px-4 py-2">{cf?.username || <span className="text-gray-400">-</span>}</td>
                        <td className="px-4 py-2">{cf?.stats?.rating ?? <span className="text-gray-400">-</span>}</td>
                        <td className="px-4 py-2">{cf?.lastSynced ? new Date(cf.lastSynced).toLocaleString() : <span className="text-gray-400">-</span>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
