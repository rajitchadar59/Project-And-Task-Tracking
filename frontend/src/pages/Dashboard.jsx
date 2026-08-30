import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { role } = useAuth();

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Overview</h1>
        <p>Welcome back. You are logged in as a <strong>{role}</strong>.</p>
      </header>

      {/* Placeholder grid for the required assignment metrics */}
      <section className="metrics-grid">
        <div className="metric-card">
          <h3>Open Tasks</h3>
          <span className="metric-value">--</span>
        </div>
        <div className="metric-card alert">
          <h3>Overdue Tasks</h3>
          <span className="metric-value">--</span>
        </div>
        <div className="metric-card">
          <h3>Due This Week</h3>
          <span className="metric-value">--</span>
        </div>
        <div className="metric-card">
          <h3>Completed This Week</h3>
          <span className="metric-value">--</span>
        </div>
      </section>

      <section className="dashboard-main">
        <div className="chart-container">
          <h3>Completions (Last 8 Weeks)</h3>
          <div className="chart-placeholder">
            <p>Chart data will render here</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;