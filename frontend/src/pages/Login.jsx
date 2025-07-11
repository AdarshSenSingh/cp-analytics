import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', { email, password, role });
      const { token, role: userRole } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('role', userRole);
      if (userRole === 'admin') {
        window.location = '/admin-dashboard';
      } else {
        window.location = '/dashboard';
      }
    } catch (err) {
      setError(
        err.response?.data?.msg || 'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black font-sans relative overflow-hidden">
      {/* SVG geometric texture overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-20 z-0" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="400" cy="300" r="300" fill="url(#paint0_radial)" />
        <defs>
          <radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientTransform="translate(400 300) scale(300)" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fff" stopOpacity="0.08" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
      <div className="relative z-10 backdrop-blur-lg bg-white/20 shadow-2xl rounded-3xl p-10 w-full max-w-md mx-4 border border-white/20">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-tr from-indigo-600 to-pink-500 rounded-full p-4 mb-3 shadow-lg">
            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2m12-10a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </div>
          <h2 className="text-4xl font-extrabold text-gray-100 drop-shadow text-center tracking-tight font-sans">Sign in to your account</h2>
          <p className="mt-2 text-center text-base text-gray-300/80 font-medium">
            Or{' '}
            <Link to="/register" className="font-semibold text-indigo-200 hover:text-pink-200 underline underline-offset-2 transition-colors">
              create a new account
            </Link>
          </p>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <form className="space-y-7" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div className="relative">
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none block w-full px-4 py-3 rounded-lg border border-gray-700 placeholder-gray-500 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition shadow-sm bg-black/40 font-medium pl-12"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 12H8m8 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </span>
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none block w-full px-4 py-3 rounded-lg border border-gray-700 placeholder-gray-500 text-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition shadow-sm bg-black/40 font-medium pl-12"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m0-6v2m-6 4h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              </span>
            </div>
            <div className="flex items-center space-x-4 justify-center">
              <label className="text-gray-200 font-semibold">
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={role === 'user'}
                  onChange={() => setRole('user')}
                  className="mr-1 accent-indigo-600"
                />
                User
              </label>
              <label className="text-gray-200 font-semibold">
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={role === 'admin'}
                  onChange={() => setRole('admin')}
                  className="mr-1 accent-pink-600"
                />
                Admin
              </label>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-indigo-700 to-pink-700 hover:from-pink-800 hover:to-indigo-800 text-white font-bold shadow-lg transition focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-black/40 disabled:opacity-60 text-lg tracking-wide"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
