import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../axiosPatch';
import { useAuth } from '../context/AuthContext';
import './ProjectView.css';

const ProjectView = () => {
  const { id: projectId } = useParams();
  const { role } = useAuth();
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState(''); 
  const [assignedTo, setAssignedTo] = useState('');
  const [selectedDependencies, setSelectedDependencies] = useState([]);

  useEffect(() => {
    fetchProjectDetails();
    fetchTasks();
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      const { data } = await axios.get(`/projects/${projectId}`);
      setProject(data);
    } catch (err) {
      console.error('Error fetching project');
    }
  };

  const fetchTasks = async () => {
    try {
      const { data } = await axios.get(`/tasks/project/${projectId}`);
      setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/tasks', {
        title,
        description,
        priority,
        dueDate: dueDate || null,
        project: projectId,
        assignedTo: assignedTo || null,
        dependencies: selectedDependencies
      });
      setTitle('');
      setDescription('');
      setDueDate('');
      setAssignedTo('');
      setSelectedDependencies([]);
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await axios.patch(`/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      if (err.response?.data?.blockingTasks) {
        alert(`Cannot mark as Done!\n\nBlocking Tasks: \n- ${err.response.data.blockingTasks.join('\n- ')}`);
      } else {
        alert(err.response?.data?.error || 'Failed to update status');
      }
      fetchTasks(); 
    }
  };

  const handleDependencyToggle = (taskId) => {
    setSelectedDependencies(prev => 
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const handleDeleteTask = async (taskId) => {
    if(!window.confirm('Delete this task?')) return;
    try {
      await axios.delete(`/tasks/${taskId}`);
      fetchTasks();
    } catch (err) {
      alert('Failed to delete task');
    }
  };

  if (!project) return <div>Loading project...</div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <Link to="/dashboard" className="back-link">&larr; Back to Dashboard</Link>
          <h2 style={{ marginTop: '10px' }}>Project: {project.name}</h2>
        </div>
        <span className="role-badge">{role}</span>
      </header>

      <form className="create-project-form" onSubmit={handleCreateTask} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
        <h3>Create New Task</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
          <input style={{flex: 1}} type="text" placeholder="Task Title" value={title} onChange={e => setTitle(e.target.value)} required />
          <input style={{flex: 2}} type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required />
          <select value={priority} onChange={e => setPriority(e.target.value)}>
            <option value="Low">Low Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="High">High Priority</option>
          </select>
          <input 
            type="date" 
            value={dueDate} 
            onChange={e => setDueDate(e.target.value)} 
            title="Due Date"
            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
          <div>
            <strong>Assign To:</strong>
            <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} style={{ marginLeft: '10px', padding: '5px' }}>
              <option value="">Unassigned</option>
              {project.members.map(m => (
                <option key={m._id} value={m._id}>{m.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <strong>Depends On (Blocking Tasks):</strong>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '5px' }}>
              {tasks.map(t => (
                <label key={t._id} style={{ fontSize: '0.85rem' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedDependencies.includes(t._id)}
                    onChange={() => handleDependencyToggle(t._id)}
                  /> {t.title}
                </label>
              ))}
            </div>
          </div>
        </div>

        <button type="submit" style={{ alignSelf: 'flex-start' }}>Add Task</button>
      </form>

      <h3>Project Tasks</h3>
      <div className="projects-grid">
        {tasks.map(task => (
          <div key={task._id} className="project-card" style={{ borderLeft: `4px solid ${task.status === 'Done' ? 'green' : '#FF385C'}` }}>
            <h4>{task.title}</h4>
            <p>{task.description}</p>
            
            <div style={{ fontSize: '0.85rem', margin: '10px 0' }}>
              <p><strong>Status:</strong> 
                <select 
                  value={task.status} 
                  onChange={(e) => handleStatusChange(task._id, e.target.value)}
                  style={{ marginLeft: '5px', padding: '2px' }}
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </p>
              <p><strong>Assigned:</strong> {task.assignedTo?.name || 'Unassigned'}</p>
              
              {task.dueDate && (
                <p><strong>Due Date:</strong> <span style={{color: new Date(task.dueDate) < new Date() && task.status !== 'Done' ? 'red' : 'inherit'}}>{new Date(task.dueDate).toLocaleDateString()}</span></p>
              )}

              {task.dependencies.length > 0 && (
                <p><strong>Blocked By:</strong> {task.dependencies.map(d => d.title).join(', ')}</p>
              )}
            </div>

            <button onClick={() => handleDeleteTask(task._id)} style={{ background: 'transparent', border: '1px solid #ccc', color: '#333', padding: '4px 8px', cursor: 'pointer' }}>Delete</button>
          </div>
        ))}
        {tasks.length === 0 && <p>No tasks yet.</p>}
      </div>
    </div>
  );
};

export default ProjectView;