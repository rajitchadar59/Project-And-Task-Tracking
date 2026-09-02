import React from 'react';
import './DashboardStats.css';

const DashboardStats = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="stats-grid">
      <div className="stat-card stat-blue">
        <h3 className="stat-value">{stats.open}</h3>
        <p className="stat-label">Open Tasks</p>
      </div>
      <div className="stat-card stat-red">
        <h3 className="stat-value">{stats.overdue}</h3>
        <p className="stat-label">Overdue Tasks</p>
      </div>
      <div className="stat-card stat-yellow">
        <h3 className="stat-value">{stats.dueThisWeek}</h3>
        <p className="stat-label">Due This Week</p>
      </div>
      <div className="stat-card stat-green">
        <h3 className="stat-value">{stats.completedThisWeek}</h3>
        <p className="stat-label">Completed This Week</p>
      </div>
    </div>
  );
};

export default DashboardStats;