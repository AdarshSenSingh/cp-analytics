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
import ContestMain from './pages/ContestMain';
import ContestInstance from './pages/ContestInstance';
import ContestNew from './pages/ContestNew';
import CSESProblemset from './pages/CSESProblemset';
import StriverSheet from './pages/StriverSheet';
import LoveBabbarSheet from './pages/LoveBabbarSheet';
import MainPage from './pages/MainPage';

const Contest = React.lazy(() => import('./pages/Contest'));
const ContestProblem = React.lazy(() => import('./pages/ContestProblem'));

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
            <Route path="/contest" element={<ContestMain />} />
            <Route path="/contest/new" element={<ContestNew />} />
            <Route path="/contest/:contestId" element={<ContestInstance />} />
            <Route path="/cses" element={<CSESProblemset />} />
            <Route path="/striver" element={<StriverSheet />} />
            <Route path="/lovebabbar" element={<LoveBabbarSheet />} />
          </Route>
          {/* Main landing page */}
          <Route path="/" element={<MainPage />} />
        </Routes>
      </React.Suspense>
      <ToastContainer position="top-right" autoClose={5000} />
    </>
  );
}


export default App;
