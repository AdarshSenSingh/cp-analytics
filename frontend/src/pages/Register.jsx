import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.username || !formData.email || !formData.password) {
      return setError('Please fill in all required fields');
    }
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/register', {
        ...formData,
        role
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', role);
      // Use window.location for instant reload and redirect
      if (role === 'admin') {
        window.location = '/admin-dashboard';
      } else {
        window.location = '/dashboard';
      }
    } catch (err) {
      setError(
        err.response?.data?.msg || 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="backdrop-blur-md bg-white/30 shadow-2xl rounded-2xl p-10 w-full max-w-md mx-4 border border-white/40">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-indigo-600 rounded-full p-3 mb-3 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2m12-10a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </div>
          <h2 className="text-3xl font-extrabold text-white drop-shadow text-center">Create your account</h2>
          <p className="mt-2 text-center text-sm text-white/80">
            Or{' '}
            <Link to="/login" className="font-medium text-indigo-100 hover:text-white underline underline-offset-2">
              sign in to your existing account
            </Link>
          </p>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              id="username"
              name="username"
              type="text"
              required
              className="appearance-none block w-full px-4 py-3 rounded-lg border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition shadow-sm bg-white/80"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
            />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none block w-full px-4 py-3 rounded-lg border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition shadow-sm bg-white/80"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
            />
            <input
              id="name"
              name="name"
              type="text"
              className="appearance-none block w-full px-4 py-3 rounded-lg border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition shadow-sm bg-white/80"
              placeholder="Full Name (optional)"
              value={formData.name}
              onChange={handleChange}
            />
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="appearance-none block w-full px-4 py-3 rounded-lg border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition shadow-sm bg-white/80"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              className="appearance-none block w-full px-4 py-3 rounded-lg border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition shadow-sm bg-white/80"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <div className="flex items-center space-x-4">
              <label className="text-white font-medium">
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={role === 'user'}
                  onChange={() => setRole('user')}
                  className="mr-1"
                />
                User
              </label>
              <label className="text-white font-medium">
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={role === 'admin'}
                  onChange={() => setRole('admin')}
                  className="mr-1"
                />
                Admin
              </label>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg transition focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-white/40 disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
