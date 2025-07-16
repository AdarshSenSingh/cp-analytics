import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Problems from './pages/Problems';
import Submissions from './pages/Submissions';
import Analytics from './pages/Analytics';
import Platforms from './pages/Platforms';
import SubmissionDetail from './pages/SubmissionDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Contest = React.lazy(() => import('./pages/Contest'));

function App() {
  const isAuthenticated = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  return (
    <>
      <React.Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={!isAuthenticated ? <Login /> : (role === 'admin' ? <Navigate to="/admin-dashboard" /> : <Navigate to="/dashboard" />)} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : (role === 'admin' ? <Navigate to="/admin-dashboard" /> : <Navigate to="/dashboard" />)} />
          {/* Admin Dashboard Route */}
          <Route path="/admin-dashboard" element={isAuthenticated && role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} />
          {/* Protected Routes with Layout */}
          <Route element={isAuthenticated && role === 'user' ? <Layout /> : <Navigate to="/login" />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/problems" element={<Problems />} />
            <Route path="/submissions" element={<Submissions />} />
            <Route path="/submissions/:id" element={<SubmissionDetail />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/platforms" element={<Platforms />} />
            <Route path="/contest" element={<Contest />} />
          </Route>
          {/* Redirect root to dashboard or login */}
          <Route path="/" element={<Navigate to={isAuthenticated ? (role === 'admin' ? "/admin-dashboard" : "/dashboard") : "/login"} />} />
        </Routes>
      </React.Suspense>
      <ToastContainer position="top-right" autoClose={5000} />
    </>
  );
}


export default App;
