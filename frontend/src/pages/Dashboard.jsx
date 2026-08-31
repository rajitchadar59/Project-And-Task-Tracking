import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../axiosPatch';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';


import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, 
  Title, Tooltip, Legend, ArcElement, PointElement, LineElement
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';


ChartJS.register(
  CategoryScale, LinearScale, BarElement, 
  Title, Tooltip, Legend, ArcElement, PointElement, LineElement
);

const Dashboard = () => {
  const { role, logout } = useAuth();
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]); 
  const [stats, setStats] = useState(null);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]); 
  const [editingProjectId, setEditingProjectId] = useState(null);

  useEffect(() => {
    fetchStats();
    fetchProjects();
    if (role === 'Manager') fetchUsers();
  }, [role]);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get('/tasks/stats');
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats");
    }
  };

  const fetchProjects = async () => {
    try {
      const { data } = await axios.get('/projects');
      setProjects(data);
    } catch (err) {
      console.error("Failed to fetch projects");
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get('/users');
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users");
    }
  };

  const handleMemberToggle = (userId) => {
    setSelectedMembers(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleEditClick = (project) => {
    setEditingProjectId(project._id);
    setName(project.name);
    setDescription(project.description);
    setSelectedMembers(project.members.map(m => m._id));
    window.scrollTo(0, document.body.scrollHeight);
  };

  const resetForm = () => {
    setEditingProjectId(null);
    setName('');
    setDescription('');
    setSelectedMembers([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProjectId) {
        await axios.patch(`/projects/${editingProjectId}`, { name, description, members: selectedMembers });
      } else {
        await axios.post('/projects', { name, description, members: selectedMembers });
      }
      resetForm();
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save project');
    }
  };

  const handleArchive = async (projectId) => {
    if (!window.confirm('Are you sure you want to archive this project?')) return;
    try {
      await axios.patch(`/projects/${projectId}/archive`);
      fetchProjects(); 
    } catch (err) {
      alert('Failed to archive project');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

 
  const statusChartData = {
    labels: stats ? Object.keys(stats.byStatus) : [],
    datasets: [{
      label: 'Tasks by Status',
      data: stats ? Object.values(stats.byStatus) : [],
      backgroundColor: ['#ffc107', '#17a2b8', '#28a745', '#dc3545'],
    }]
  };

  const assigneeChartData = {
    labels: stats ? Object.keys(stats.byAssignee) : [],
    datasets: [{
      label: 'Tasks by Assignee',
      data: stats ? Object.values(stats.byAssignee) : [],
      backgroundColor: '#007bff',
    }]
  };

  const completionChartData = {
    labels: stats ? Object.keys(stats.completionsByWeek) : [],
    datasets: [{
      label: 'Completions (Last 8 Weeks)',
      data: stats ? Object.values(stats.completionsByWeek) : [],
      borderColor: '#FF385C',
      backgroundColor: 'rgba(255, 56, 92, 0.2)',
      fill: true,
      tension: 0.3
    }]
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <h2>Main Dashboard</h2>
          <Link to="/tasks/global" className="view-btn" style={{ textDecoration: 'none', background: '#333' }}>
            Search All Tasks
          </Link>
          {role === 'Manager' && (
            <Link to="/projects/archived" className="view-btn" style={{ textDecoration: 'none', background: '#dc3545' }}>
              View Archived
            </Link>
          )}
        </div>
        <div className="header-actions">
          <span className="role-badge">{role}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      {/* --- Point 8: Headline Numbers --- */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
          <div className="project-card" style={{ textAlign: 'center', background: '#f8f9fa' }}>
            <h3 style={{ fontSize: '2rem', color: '#007bff', margin: '0' }}>{stats.open}</h3>
            <p style={{ margin: '5px 0 0 0', fontWeight: 'bold' }}>Open Tasks</p>
          </div>
          <div className="project-card" style={{ textAlign: 'center', background: '#fff3f3' }}>
            <h3 style={{ fontSize: '2rem', color: '#dc3545', margin: '0' }}>{stats.overdue}</h3>
            <p style={{ margin: '5px 0 0 0', fontWeight: 'bold', color: '#dc3545' }}>Overdue Tasks</p>
          </div>
          <div className="project-card" style={{ textAlign: 'center', background: '#fff9e6' }}>
            <h3 style={{ fontSize: '2rem', color: '#ffc107', margin: '0' }}>{stats.dueThisWeek}</h3>
            <p style={{ margin: '5px 0 0 0', fontWeight: 'bold' }}>Due This Week</p>
          </div>
          <div className="project-card" style={{ textAlign: 'center', background: '#f0fdf4' }}>
            <h3 style={{ fontSize: '2rem', color: '#28a745', margin: '0' }}>{stats.completedThisWeek}</h3>
            <p style={{ margin: '5px 0 0 0', fontWeight: 'bold', color: '#28a745' }}>Completed This Week</p>
          </div>
        </div>
      )}

      {/* --- Point 8: Charts --- */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <div className="project-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h4 style={{ marginBottom: '15px' }}>Tasks by Status</h4>
            <div style={{ width: '200px', height: '200px' }}>
              <Doughnut data={statusChartData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
          <div className="project-card">
            <h4 style={{ marginBottom: '15px' }}>Tasks by Assignee</h4>
            <div style={{ height: '200px' }}>
              <Bar data={assigneeChartData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
          <div className="project-card" style={{ gridColumn: '1 / -1' }}>
            <h4 style={{ marginBottom: '15px' }}>Completions (Last 8 Weeks)</h4>
            <div style={{ height: '250px' }}>
              <Line data={completionChartData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
      )}

      <hr style={{ margin: '40px 0', borderTop: '2px solid #eee' }} />

      {/* --- Existing Projects UI --- */}
      <h3>Active Projects</h3>
      <div className="projects-grid" style={{ marginBottom: '30px' }}>
        {projects.map(project => (
          <div key={project._id} className="project-card">
            <h3>{project.name}</h3>
            <p>{project.description}</p>
            <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '10px', marginBottom: '15px' }}>
              <p><strong>Owner:</strong> {project.owner?.name}</p>
              <p><strong>Members ({project.members?.length || 0}):</strong> {project.members?.map(m => m.name).join(', ') || 'None'}</p>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Link to={`/projects/${project._id}`} className="view-btn">View Tasks</Link>
              {role === 'Manager' && (
                <>
                  <button onClick={() => handleEditClick(project)} className="logout-btn" style={{ borderColor: '#333', color: '#333', padding: '4px 10px' }}>Edit</button>
                  <button onClick={() => handleArchive(project._id)} className="logout-btn" style={{ padding: '4px 10px' }}>Archive</button>
                </>
              )}
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <p>{role === 'Member' ? "You haven't been assigned to any projects yet." : "No active projects found."}</p>
        )}
      </div>

      {role === 'Manager' && (
        <form className="create-project-form" onSubmit={handleSubmit} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <h3>{editingProjectId ? 'Edit Project' : 'Create New Project'}</h3>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <input 
              type="text" placeholder="Project Name" 
              value={name} onChange={(e) => setName(e.target.value)} required 
            />
            <input 
              type="text" placeholder="Description" 
              value={description} onChange={(e) => setDescription(e.target.value)} required 
            />
          </div>
          
          <div className="member-selection" style={{ marginBottom: '15px' }}>
            <strong>Assign Members:</strong>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '10px' }}>
              {users.filter(u => u.role === 'Member').map(u => (
                <label key={u._id} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedMembers.includes(u._id)}
                    onChange={() => handleMemberToggle(u._id)}
                  />
                  {u.name}
                </label>
              ))}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit">{editingProjectId ? 'Update Project' : 'Create Project'}</button>
            {editingProjectId && (
              <button type="button" onClick={resetForm} style={{ background: '#ccc', color: '#333' }}>Cancel</button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default Dashboard;