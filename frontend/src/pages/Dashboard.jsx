import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../axiosPatch';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { role, logout } = useAuth();
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]); 
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]); 
  const [editingProjectId, setEditingProjectId] = useState(null);

  useEffect(() => {
    fetchProjects();
    if (role === 'Manager') {
      fetchUsers();
    }
  }, [role]);

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
    window.scrollTo(0, 0);
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

  return (
    <div className="dashboard-container">
      {/* Updated Header with Global Tasks Link */}
      <header className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h2>Projects Dashboard</h2>
          <Link to="/tasks/global" className="view-btn" style={{ textDecoration: 'none', background: '#333' }}>
            Search All Tasks
          </Link>
        </div>
        <div className="header-actions">
          <span className="role-badge">{role}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

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

      <div className="projects-grid">
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
    </div>
  );
};

export default Dashboard;