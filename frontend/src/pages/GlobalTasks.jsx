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

  // Batch Update State
  const [selectedBatchTasks, setSelectedBatchTasks] = useState([]);
  const [batchStatus, setBatchStatus] = useState('');

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

  // --- CSV Export Logic ---
  const handleExportCSV = () => {
    if (tasks.length === 0) {
      alert("No tasks to export.");
      return;
    }

    const headers = ['Project', 'Task Title', 'Description', 'Priority', 'Status', 'Assigned To', 'Due Date'];
    const csvRows = [headers.join(',')];

    tasks.forEach(t => {
      const row = [
        `"${t.project?.name || ''}"`,
        `"${t.title.replace(/"/g, '""')}"`, // Escape quotes
        `"${t.description.replace(/"/g, '""')}"`,
        `"${t.priority}"`,
        `"${t.status}"`,
        `"${t.assignedTo?.name || 'Unassigned'}"`,
        `"${t.dueDate ? new Date(t.dueDate).toLocaleDateString() : ''}"`
      ];
      csvRows.push(row.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'Tasks_Export.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // --- Batch Update Logic ---
  const toggleBatchTask = (taskId) => {
    setSelectedBatchTasks(prev => 
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const handleBatchUpdate = async () => {
    if (selectedBatchTasks.length === 0) return;
    if (!batchStatus) return alert('Please select a new status to apply.');

    try {
      const { data } = await axios.patch('/tasks/batch', {
        taskIds: selectedBatchTasks,
        updates: { status: batchStatus }
      });

      let alertMsg = `Batch Update Complete!\n\nSuccessful: ${data.successful.length}\nFailed: ${data.failed.length}`;
      if (data.failed.length > 0) {
        alertMsg += `\n\nFailures:\n` + data.failed.map(f => `- ${f.title}: ${f.reason}`).join('\n');
      }
      
      alert(alertMsg);
      setSelectedBatchTasks([]);
      setBatchStatus('');
      fetchTasks();
    } catch (err) {
      alert('Failed to process batch update.');
    }
  };

  return (
    <div className="dashboard-container" style={{ paddingBottom: selectedBatchTasks.length > 0 ? '80px' : '20px' }}>
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

          <button onClick={handleExportCSV} style={{ background: '#333', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Export CSV
          </button>
        </div>
      </div>

      <div className="projects-grid" style={{ marginTop: '20px' }}>
        {tasks.map(task => (
          <div key={task._id} className="project-card" style={{ borderLeft: `4px solid ${task.status === 'Done' ? 'green' : '#FF385C'}`, backgroundColor: selectedBatchTasks.includes(task._id) ? '#f0f8ff' : '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: '#888' }}>{task.project?.name}</span>
              
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: task.priority === 'High' ? 'red' : '#555' }}>
                  {task.priority} Priority
                </span>
                <input 
                  type="checkbox" 
                  checked={selectedBatchTasks.includes(task._id)} 
                  onChange={() => toggleBatchTask(task._id)}
                  style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                  title="Select for batch update"
                />
              </div>
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

      {/* Floating Batch Update Panel */}
      {selectedBatchTasks.length > 0 && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, 
          background: '#ffffff', padding: '15px 20px', 
          boxShadow: '0 -4px 12px rgba(0,0,0,0.1)', 
          display: 'flex', gap: '20px', alignItems: 'center', 
          justifyContent: 'center', zIndex: 1000,
          borderTop: '2px solid #007bff'
        }}>
          <strong style={{ fontSize: '1.1rem' }}>Batch Update ({selectedBatchTasks.length})</strong>
          
          <select value={batchStatus} onChange={e => setBatchStatus(e.target.value)} style={{ padding: '8px' }}>
            <option value="">-- Set Status --</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>

          <button onClick={handleBatchUpdate} style={{ background: '#28a745', color: 'white', padding: '8px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Apply Status
          </button>
          
          <button onClick={() => setSelectedBatchTasks([])} style={{ background: 'transparent', color: '#dc3545', padding: '8px 20px', border: '1px solid #dc3545', borderRadius: '4px', cursor: 'pointer' }}>
            Clear Selection
          </button>
        </div>
      )}
    </div>
  );
};

export default GlobalTasks;