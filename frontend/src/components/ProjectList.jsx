import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ProjectList.css';

const ProjectList = ({ projects, role, onEdit, onArchive }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (projects.length === 0) {
    return (
      <div className="projects-empty">
        <p>{role === 'Member' ? "You haven't been assigned to any projects yet." : "No active projects found. Create one below."}</p>
      </div>
    );
  }

  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="project-list-container">
      <div className="project-search-wrapper">
        <input 
          type="text" 
          className="project-search-input" 
          placeholder="🔍 Search projects..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredProjects.length === 0 ? (
        <div className="projects-empty">
          <p>No projects match your search.</p>
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