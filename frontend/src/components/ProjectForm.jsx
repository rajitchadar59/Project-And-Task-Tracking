import React from 'react';
import './ProjectForm.css';

const ProjectForm = ({ 
  onSubmit, 
  onCancel, 
  name, setName, 
  description, setDescription, 
  selectedMembers, onMemberToggle, 
  users, 
  isEditing 
}) => {
  return (
    <div className="project-form-container">
      <div className="project-form-card">
        <h3>{isEditing ? 'Edit Project Details' : 'Create New Project'}</h3>
        <p className="form-subtitle">Set up the workspace and assign team members.</p>
        
        <form onSubmit={onSubmit} className="project-form">
          <div className="form-row">
            <div className="form-group">
              <label>Project Name</label>
              <input 
                type="text" 
                placeholder="e.g. Website Redesign" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input 
                type="text" 
                placeholder="Brief overview of goals" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                required 
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Assign Members</label>
            <div className="member-checkbox-grid">
              {users.filter(u => u.role === 'Member').map(u => (
                <label key={u._id} className="member-checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={selectedMembers.includes(u._id)}
                    onChange={() => onMemberToggle(u._id)}
                  />
                  <span>{u.name}</span>
                </label>
              ))}
              {users.filter(u => u.role === 'Member').length === 0 && (
                <span className="no-members">No members available to assign.</span>
              )}
            </div>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn-submit">
              {isEditing ? 'Save Changes' : 'Create Project'}
            </button>
            {isEditing && (
              <button type="button" onClick={onCancel} className="btn-cancel">
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;