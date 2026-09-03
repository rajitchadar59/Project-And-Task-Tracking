import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../axiosPatch';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
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
      toast.error("Failed to fetch archived projects");
    }
  };

  const handleRestore = async (projectId) => {
    if (!window.confirm("Are you sure you want to restore this project?")) return;
    try {
      await axios.patch(`/projects/${projectId}/restore`);
      toast.success("Project restored successfully!");
      fetchArchivedProjects(); 
    } catch (err) {
      toast.error('Failed to restore project');
    }
  };

  if (role !== 'Manager') {
    return (
      <div className="archived-wrapper archived-access-denied">
        <h2 className="archived-title">Access Denied</h2>
        <p className="archived-subtitle">You must be a Manager to view archived projects.</p>
        <Link to="/dashboard" className="archived-back-link">&larr; Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="archived-wrapper">
      <header className="archived-header">
        <div>
          <h2 className="archived-title">Archived Projects</h2>
          <p className="archived-subtitle">View and restore previously archived projects to your portfolio.</p>
        </div>
        <span className="archived-role-badge">{role}</span>
      </header>

      <div className="archived-grid">
        {projects.map(project => {
          const memberNames = project.members?.length ? project.members.map(m => m.name).join(', ') : 'None';
          
          return (
            <div key={project._id} className="archived-card">
              <div className="archived-card-content">
                <h3 className="archived-card-title">{project.name}</h3>
                <p className="archived-desc">{project.description}</p>
                
                <div className="archived-meta-details">
                  <div className="archived-meta-row">
                    <span className="archived-meta-label">Owner</span>
                    <span className="archived-meta-value">{project.owner?.name}</span>
                  </div>
                  <div className="archived-meta-row">
                    <span className="archived-meta-label">Team ({project.members?.length || 0})</span>
                    <span className="archived-meta-value archived-text-truncate" title={memberNames}>{memberNames}</span>
                  </div>
                </div>
              </div>
              
              <button onClick={() => handleRestore(project._id)} className="archived-restore-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 14 4 9 9 4"></polyline>
                  <path d="M20 20v-7a4 4 0 0 0-4-4H4"></path>
                </svg>
                Restore Project
              </button>
            </div>
          );
        })}
        
        {projects.length === 0 && (
          <div className="archived-empty-msg">
            <span className="archived-empty-icon">🗃️</span>
            <p className="archived-empty-title">No archived projects found.</p>
            <span className="archived-empty-sub">When you archive projects, they will appear here.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArchivedProjects;