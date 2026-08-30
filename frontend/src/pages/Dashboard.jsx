import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../axiosPatch';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { role, logout, user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await axios.get('/projects');
      setProjects(data);
    } catch (err) {
      console.error("Failed to fetch projects");
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/projects', { name, description });
      setName('');
      setDescription('');
      fetchProjects(); // Refresh list after creation
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create project');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>Projects Dashboard</h2>
        <div className="header-actions">
          <span className="role-badge">{role}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      {/* Sirf Manager ko Project create karne ka option dikhega */}
      {role === 'Manager' && (
        <form className="create-project-form" onSubmit={handleCreateProject}>
          <h3>Create New Project</h3>
          <input 
            type="text" placeholder="Project Name" 
            value={name} onChange={(e) => setName(e.target.value)} required 
          />
          <input 
            type="text" placeholder="Description" 
            value={description} onChange={(e) => setDescription(e.target.value)} required 
          />
          <button type="submit">Create Project</button>
        </form>
      )}

      <div className="projects-grid">
        {projects.map(project => (
          <div key={project._id} className="project-card">
            <h3>{project.name}</h3>
            <p>{project.description}</p>
            <small>Owner: {project.owner?.name}</small>
            <Link to={`/projects/${project._id}`} className="view-btn">View Tasks</Link>
          </div>
        ))}
        {projects.length === 0 && <p>No active projects found.</p>}
      </div>
    </div>
  );
};

export default Dashboard;