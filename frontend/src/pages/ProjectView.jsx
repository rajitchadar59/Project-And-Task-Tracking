import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../axiosPatch';
import { useAuth } from '../context/AuthContext';

const ProjectView = () => {
  const { id: projectId } = useParams();
  const { role } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const fetchTasks = async () => {
    try {
      const { data } = await axios.get(`/tasks/project/${projectId}`);
      setTasks(data);
    } catch (err) {
      console.error("Failed to fetch tasks");
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/tasks', { title, projectId });
      setTitle('');
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create task');
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await axios.patch(`/tasks/${taskId}/status`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.error || 'Status update failed (Check dependencies)');
    }
  };

  return (
    <div className="dashboard-container">
      <Link to="/dashboard" className="back-link">← Back to Projects</Link>
      
      {role === 'Manager' && (
        <form className="create-project-form" onSubmit={handleCreateTask}>
          <h3>Add New Task</h3>
          <input 
            type="text" placeholder="Task Title" 
            value={title} onChange={(e) => setTitle(e.target.value)} required 
          />
          <button type="submit">Add Task</button>
        </form>
      )}

      <div className="tasks-list">
        <h3>Project Tasks</h3>
        {tasks.map(task => (
          <div key={task._id} className="project-card" style={{ marginBottom: '10px' }}>
            <h4>{task.title}</h4>
            <p>Status: <strong>{task.status}</strong></p>
            
            <select 
              value={task.status} 
              onChange={(e) => updateTaskStatus(task._id, e.target.value)}
              style={{ marginTop: '10px', padding: '5px' }}
            >
              <option value="Backlog">Backlog</option>
              <option value="In Progress">In Progress</option>
              <option value="In Review">In Review</option>
              <option value="Done">Done</option>
            </select>
          </div>
        ))}
        {tasks.length === 0 && <p>No tasks created yet.</p>}
      </div>
    </div>
  );
};

export default ProjectView;