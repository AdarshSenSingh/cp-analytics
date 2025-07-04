import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Problems from './pages/Problems';
import Submissions from './pages/Submissions';
import Analytics from './pages/Analytics';
import Platforms from './pages/Platforms';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  // Check if user is authenticated (simplified for example)
  const isAuthenticated = localStorage.getItem('token');

  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
      
      {/* Protected Routes with Layout */}
      <Route element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/problems" element={<Problems />} />
        <Route path="/submissions" element={<Submissions />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/platforms" element={<Platforms />} />
      </Route>
      
      {/* Redirect root to dashboard or login */}
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
    </Routes>
  );
  <ToastContainer position="top-right" autoClose={5000} />
}

export default App;
