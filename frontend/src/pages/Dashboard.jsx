import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../axiosPatch';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { role, logout, user } = useAuth();
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]); // Database ke saare users
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]); // Jo users project me add karne hain

  useEffect(() => {
    fetchProjects();
    // Sirf manager ko users ki list chahiye assign karne ke liye
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

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/projects', { 
        name, 
        description, 
        members: selectedMembers 
      });
      setName('');
      setDescription('');
      setSelectedMembers([]);
      fetchProjects();
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

      {role === 'Manager' && (
        <form className="create-project-form" onSubmit={handleCreateProject} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <h3>Create New Project</h3>
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
          
          <button type="submit" style={{ alignSelf: 'flex-start' }}>Create Project</button>
        </form>
      )}

      <div className="projects-grid">
        {projects.map(project => (
          <div key={project._id} className="project-card">
            <h3>{project.name}</h3>
            <p>{project.description}</p>
            <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '10px' }}>
              <p><strong>Owner:</strong> {project.owner?.name}</p>
              <p><strong>Members ({project.members?.length || 0}):</strong> {project.members?.map(m => m.name).join(', ') || 'None'}</p>
            </div>
            <Link to={`/projects/${project._id}`} className="view-btn">View Tasks</Link>
          </div>
        ))}
        {projects.length === 0 && (
          <p>
            {role === 'Member' 
              ? "You haven't been assigned to any projects yet." 
              : "No active projects found."}
          </p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;