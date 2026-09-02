import React, { useState, useEffect } from 'react';
import axios from '../axiosPatch';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

import DashboardStats from '../components/DashboardStats';
import DashboardCharts from '../components/DashboardCharts';
import ProjectList from '../components/ProjectList';
import ProjectForm from '../components/ProjectForm';
import './Dashboard.css';

const Dashboard = () => {
  const { role } = useAuth();
  
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
      toast.error("Failed to fetch dashboard stats");
    }
  };

  const fetchProjects = async () => {
    try {
      const { data } = await axios.get('/projects');
      setProjects(data);
    } catch (err) {
      toast.error("Failed to fetch projects");
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get('/users');
      setUsers(data);
    } catch (err) {
      toast.error("Failed to fetch users");
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
    setSelectedMembers(project.members ? project.members.map(m => m._id) : []);
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
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
        toast.success("Project updated successfully");
      } else {
        await axios.post('/projects', { name, description, members: selectedMembers });
        toast.success("Project created successfully");
      }
      resetForm();
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save project');
    }
  };

  const handleArchive = async (projectId) => {
    if (!window.confirm('Are you sure you want to archive this project?')) return;
    try {
      await axios.patch(`/projects/${projectId}/archive`);
      toast.success("Project archived");
      fetchProjects(); 
    } catch (err) {
      toast.error('Failed to archive project');
    }
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-content">
        
        <div className="section-title">
          <h2>Portfolio Overview</h2>
        </div>
        
        <DashboardStats stats={stats} />
        <DashboardCharts stats={stats} />

        <div className="section-title">
          <h2>Active Projects</h2>
        </div>

        <ProjectList 
          projects={projects} 
          role={role} 
          onEdit={handleEditClick} 
          onArchive={handleArchive} 
        />

        {role === 'Manager' && (
          <ProjectForm 
            onSubmit={handleSubmit}
            onCancel={resetForm}
            name={name}
            setName={setName}
            description={description}
            setDescription={setDescription}
            selectedMembers={selectedMembers}
            onMemberToggle={handleMemberToggle}
            users={users}
            isEditing={!!editingProjectId}
          />
        )}
        
      </div>
    </div>
  );
};

export default Dashboard;