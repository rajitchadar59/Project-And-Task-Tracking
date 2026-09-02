import React from 'react';
import './DashboardStats.css';

const DashboardStats = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="stats-overview-card">
      <div className="stat-block">
        <p className="stat-label">Open Tasks</p>
        <h3 className="stat-value color-blue">{stats.open}</h3>
      </div>
      <div className="stat-divider"></div>
      <div className="stat-block">
        <p className="stat-label">Overdue</p>
        <h3 className="stat-value color-red">{stats.overdue}</h3>
      </div>
      <div className="stat-divider"></div>
      <div className="stat-block">
        <p className="stat-label">Due This Week</p>
        <h3 className="stat-value color-yellow">{stats.dueThisWeek}</h3>
      </div>
      <div className="stat-divider"></div>
      <div className="stat-block">
        <p className="stat-label">Completed</p>
        <h3 className="stat-value color-green">{stats.completedThisWeek}</h3>
      </div>
    </div>
  );
};

export default DashboardStats;