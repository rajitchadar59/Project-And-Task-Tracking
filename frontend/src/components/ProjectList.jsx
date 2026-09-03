import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ProjectList.css';

const ProjectList = ({ projects, onEdit, onArchive }) => {
  const { role, userId } = useAuth(); // ✅ Automatically pull role and userId from AuthContext
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyMyProjects, setShowOnlyMyProjects] = useState(false);

  if (projects.length === 0) {
    return (
      <div className="projects-empty">
        <p>{role === 'Member' ? "You haven't been assigned to any projects yet." : "No active projects found. Create one below."}</p>
      </div>
    );
  }

  
  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      project.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (showOnlyMyProjects) {
      const ownerValue = project.owner;
      const ownerId = typeof ownerValue === 'object' && ownerValue !== null 
        ? (ownerValue._id || ownerValue.id) 
        : ownerValue;

      const isMyProject = String(ownerId).trim() === String(userId).trim();
      return matchesSearch && isMyProject;
    }

    return matchesSearch;
  });

  return (
    <div className="project-list-container">
    
      <div className="project-search-wrapper" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <input 
          type="text" 
          className="project-search-input" 
          placeholder="🔍 Search projects..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flexGrow: 1 }}
        />
        
        
        {role === 'Manager' && (
          <button 
            type="button"
            className={`btn-filter-toggle ${showOnlyMyProjects ? 'active' : ''}`}
            onClick={() => setShowOnlyMyProjects(prev => !prev)}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid #d1d1d1',
              background: showOnlyMyProjects ? '#222222' : '#ffffff',
              color: showOnlyMyProjects ? '#ffffff' : '#222222',
              fontWeight: '600',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease'
            }}
          >
            {showOnlyMyProjects ? 'Show All Projects' : 'My Projects'}
          </button>
        )}
      </div>

      {filteredProjects.length === 0 ? (
        <div className="projects-empty">
          <p>No projects match your criteria.</p>
        </div>
      ) : (
        <div className="projects-grid">
          {filteredProjects.map(project => (
            <div key={project._id} className="project-card">
              <div className="project-card-header">
                <h3>{project.name}</h3>
                <p className="project-desc">{project.description}</p>
              </div>
              
              <div className="project-meta">
                <div className="meta-row">
                  <span className="meta-label">Owner</span>
                  <span className="meta-value">{project.owner?.name}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">Team ({project.members?.length || 0})</span>
                  <span className="meta-value text-truncate" title={project.members?.map(m => m.name).join(', ')}>
                    {project.members?.map(m => m.name).join(', ') || 'None'}
                  </span>
                </div>
              </div>
              
              <div className="project-actions">
                <Link to={`/projects/${project._id}`} className="btn-view">Open Project</Link>
                {role === 'Manager' && (
                  <div className="manager-actions">
                    <button onClick={() => onEdit(project)} className="btn-action">Edit</button>
                    <button onClick={() => onArchive(project._id)} className="btn-action text-danger">Archive</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;