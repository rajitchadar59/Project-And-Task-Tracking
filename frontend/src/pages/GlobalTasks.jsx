import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../axiosPatch';
import { useAuth } from '../context/AuthContext';
import './GlobalTasks.css';

const GlobalTasks = () => {
  const { role } = useAuth();
  const [tasks, setTasks] = useState([]);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [sortBy, setSortBy] = useState('createdAt'); 
  const [isOverdue, setIsOverdue] = useState(false); 

  const fetchTasks = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (status) params.status = status;
      if (priority) params.priority = priority;
      if (sortBy) params.sortBy = sortBy;
      if (isOverdue) params.isOverdue = true; 

      const { data } = await axios.get('/tasks/global', { params });
      setTasks(data);
    } catch (err) {
      console.error('Error fetching global tasks');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [status, priority, sortBy, isOverdue]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTasks();
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <Link to="/dashboard" className="back-link">&larr; Back to Dashboard</Link>
          <h2 style={{ marginTop: '10px' }}>Global Task Search</h2>
        </div>
        <span className="role-badge">{role}</span>
      </header>

      <div className="filters-container">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <input 
            type="text" 
            placeholder="Search tasks by title or description..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        <div className="dropdown-filters">
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>

          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="createdAt">Sort: Newest First</option>
            <option value="dueDate">Sort: Due Date</option>
          </select>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#FF385C', fontWeight: 'bold', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={isOverdue} 
              onChange={(e) => setIsOverdue(e.target.checked)} 
              style={{ cursor: 'pointer' }}
            />
            Show Overdue Tasks Only
          </label>
        </div>
      </div>

      <div className="projects-grid" style={{ marginTop: '20px' }}>
        {tasks.map(task => (
          <div key={task._id} className="project-card" style={{ borderLeft: `4px solid ${task.status === 'Done' ? 'green' : '#FF385C'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', color: '#888' }}>{task.project?.name}</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: task.priority === 'High' ? 'red' : '#555' }}>
                {task.priority} Priority
              </span>
            </div>
            <h4 style={{ margin: '10px 0' }}>{task.title}</h4>
            <p>{task.description}</p>
            
            <div style={{ fontSize: '0.85rem', marginTop: '15px' }}>
              <p><strong>Status:</strong> {task.status}</p>
              <p><strong>Assigned To:</strong> {task.assignedTo?.name || 'Unassigned'}</p>
              {task.dueDate && (
                <p><strong>Due Date:</strong> <span style={{color: new Date(task.dueDate) < new Date() && task.status !== 'Done' ? 'red' : 'inherit'}}>{new Date(task.dueDate).toLocaleDateString()}</span></p>
              )}
            </div>
          </div>
        ))}
        {tasks.length === 0 && <p>No tasks match your filters.</p>}
      </div>
    </div>
  );
};

export default GlobalTasks;