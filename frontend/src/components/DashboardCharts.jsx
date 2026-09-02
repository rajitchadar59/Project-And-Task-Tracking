import React from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, 
  Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import './DashboardCharts.css';


ChartJS.register(
  CategoryScale, LinearScale, BarElement, 
  Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom', labels: { boxWidth: 12, font: { family: '-apple-system' } } }
  }
};

export const DashboardPieBar = ({ stats }) => {
  if (!stats) return null;

  const assigneeLabels = Object.keys(stats.byAssignee);
  
  const dynamicBarWidth = assigneeLabels.length > 5 ? `${assigneeLabels.length * 60}px` : '100%';

  const statusChartData = {
    labels: Object.keys(stats.byStatus),
    datasets: [{
      data: Object.values(stats.byStatus),
      backgroundColor: ['#d97706', '#2563eb', '#7c3aed', '#059669', '#d93a5c'],
      borderWidth: 0,
    }]
  };

  const assigneeChartData = {
    labels: assigneeLabels,
    datasets: [{
      label: 'Tasks',
      data: Object.values(stats.byAssignee),
      backgroundColor: '#2563eb',
      borderRadius: 4,
      barPercentage: 0.6, 
    }]
  };

  return (
    <div className="charts-top-grid">
      <div className="chart-card">
        <h4>Tasks by Status</h4>
        <div className="chart-wrapper pie-wrapper">
          <Doughnut data={statusChartData} options={chartOptions} />
        </div>
      </div>
      <div className="chart-card">
        <h4>Tasks by Assignee</h4>
        <div className="chart-scroll-wrapper">
          <div style={{ minWidth: dynamicBarWidth, height: '100%' }}>
            <Bar data={assigneeChartData} options={{ ...chartOptions, plugins: { legend: { display: false } } }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export const DashboardLine = ({ stats }) => {
  if (!stats) return null;

  const completionChartData = {
    labels: Object.keys(stats.completionsByWeek),
    datasets: [{
      label: 'Completed Tasks',
      data: Object.values(stats.completionsByWeek),
      borderColor: '#ff385c',
      backgroundColor: 'rgba(255, 56, 92, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#ff385c',
    }]
  };

  return (
    <div className="chart-card chart-full-width">
      <h4>Completions (Last 8 Weeks)</h4>
      <div className="chart-wrapper line-wrapper">
        <Line data={completionChartData} options={{ ...chartOptions, plugins: { legend: { display: false } } }} />
      </div>
    </div>
  );
};