import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../axiosPatch';
import { useAuth } from '../context/AuthContext';
import './ArchivedProjects.css';

const ArchivedProjects = () => {
  const { role } = useAuth();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchArchivedProjects();
  }, []);

  const fetchArchivedProjects = async () => {
    try {
      const { data } = await axios.get('/projects/archived');
      setProjects(data);
    } catch (err) {
      console.error("Failed to fetch archived projects");
    }
  };

  const handleRestore = async (projectId) => {
    try {
      await axios.patch(`/projects/${projectId}/restore`);
      fetchArchivedProjects(); 
    } catch (err) {
      alert('Failed to restore project');
    }
  };

  if (role !== 'Manager') {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Access Denied. Managers only.</div>;
  }

  return (
    <div className="dashboard-container archived-container">
      <header className="dashboard-header">
        <div>
          <Link to="/dashboard" className="back-link">&larr; Back to Dashboard</Link>
          <h2 style={{ marginTop: '10px' }}>Archived Projects</h2>
        </div>
        <span className="role-badge">{role}</span>
      </header>

      <div className="projects-grid" style={{ marginTop: '20px' }}>
        {projects.map(project => (
          <div key={project._id} className="project-card archived-card">
            <h3>{project.name}</h3>
            <p>{project.description}</p>
            <div className="archived-details">
              <p><strong>Owner:</strong> {project.owner?.name}</p>
              <p><strong>Members ({project.members?.length || 0}):</strong> {project.members?.map(m => m.name).join(', ') || 'None'}</p>
            </div>
            
            <button 
              onClick={() => handleRestore(project._id)} 
              className="restore-btn"
            >
              Restore Project
            </button>
          </div>
        ))}
        {projects.length === 0 && <p className="empty-msg">No archived projects found.</p>}
      </div>
    </div>
  );
};

export default ArchivedProjects;