import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import PublicNavbar from './components/PublicNavbar';
import PrivateNavbar from './components/PrivateNavbar';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import ProjectView from './pages/ProjectView';
import GlobalTasks from './pages/GlobalTasks';
import './App.css';

function AppLayout() {
  const { token } = useAuth();

  return (
    <div className="app-container">
      {token ? <PrivateNavbar /> : <PublicNavbar />}

      <Routes>

        <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Home />} />
        <Route path="/auth" element={token ? <Navigate to="/dashboard" /> : <Auth />} />


        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['Manager', 'Member']}>
            <Dashboard />
          </ProtectedRoute>
        } />


        <Route path="/projects/:id" element={
          <ProtectedRoute allowedRoles={['Manager', 'Member']}>
            <ProjectView />
          </ProtectedRoute>
        } />

        <Route path="/tasks/global" element={
          <ProtectedRoute>
            <GlobalTasks />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;