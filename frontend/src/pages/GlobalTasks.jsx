import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../axiosPatch';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import './GlobalTasks.css';

const GlobalTasks = () => {
  const { role } = useAuth();
  const [tasks, setTasks] = useState([]);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [sortBy, setSortBy] = useState('createdAt'); 
  const [isOverdue, setIsOverdue] = useState(false); 

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
      toast.error('Error fetching global tasks');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [status, priority, sortBy, isOverdue]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTasks();
  };

  const handleExportCSV = () => {
    if (tasks.length === 0) {
      toast.error("No tasks to export.");
      return;
    }

    const headers = ['Project', 'Task Title', 'Description', 'Priority', 'Status', 'Assigned To', 'Due Date'];
    const csvRows = [headers.join(',')];

    tasks.forEach(t => {
      const row = [
        `"${t.project?.name || ''}"`,
        `"${t.title.replace(/"/g, '""')}"`, 
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
    toast.success("CSV Exported successfully");
  };

  const toggleBatchTask = (taskId) => {
    setSelectedBatchTasks(prev => 
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const handleBatchUpdate = async () => {
    if (selectedBatchTasks.length === 0) return;
    if (!batchStatus) return toast.error('Please select a new status to apply.');

    try {
      const { data } = await axios.patch('/tasks/batch', {
        taskIds: selectedBatchTasks,
        updates: { status: batchStatus }
      });

      if (data.failed.length > 0) {
        toast.error(`Updated: ${data.successful.length}, Failed: ${data.failed.length}`);
      } else {
        toast.success(`Successfully updated ${data.successful.length} tasks`);
      }
      
      setSelectedBatchTasks([]);
      setBatchStatus('');
      fetchTasks();
    } catch (err) {
      toast.error('Failed to process batch update.');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Done': return '#059669';
      case 'Blocked': return '#d93a5c';
      case 'In Progress': return '#2563eb';
      case 'In Review': return '#7c3aed';
      default: return '#6a6a6a';
    }
  };

  return (
    <div className="global-tasks-wrapper" style={{ paddingBottom: selectedBatchTasks.length > 0 ? '100px' : '40px' }}>
      <div className="global-tasks-content">
        
        <header className="global-header">
          <div>
            <h2 className="page-title">Global Task Search</h2>
            <p className="page-subtitle">Find, filter, and export tasks across all your projects.</p>
          </div>
        </header>

        <div className="filters-card">
          <form onSubmit={handleSearchSubmit} className="search-bar">
            <input 
              type="text" 
              placeholder="Search tasks by title or description..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="btn-search">Search</button>
          </form>

          <div className="filter-controls">
            <select className="filter-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="Backlog">Backlog</option>
              <option value="In Progress">In Progress</option>
              <option value="In Review">In Review</option>
              <option value="Done">Done</option>
              <option value="Blocked">Blocked</option>
            </select>

            <select className="filter-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>

            <select className="filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="createdAt">Sort: Newest First</option>
              <option value="dueDate">Sort: Due Date</option>
            </select>
            
            <label className="checkbox-toggle">
              <input 
                type="checkbox" 
                checked={isOverdue} 
                onChange={(e) => setIsOverdue(e.target.checked)} 
              />
              <span className="toggle-label">Overdue Only</span>
            </label>

            <button onClick={handleExportCSV} className="btn-export">
              Export CSV
            </button>
          </div>
        </div>

        <div className="global-tasks-grid">
          {tasks.map(task => {
            const isTaskOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done';
            const isSelected = selectedBatchTasks.includes(task._id);

            return (
              <div 
                key={task._id} 
                className={`global-task-card ${isSelected ? 'selected' : ''}`} 
                style={{ borderLeftColor: getStatusColor(task.status) }}
              >
                <div className="gtc-header">
                  <span className="gtc-project-name">{task.project?.name || 'Unknown Project'}</span>
                  <div className="gtc-actions">
                    <span className={`gtc-priority ${task.priority.toLowerCase()}`}>
                      {task.priority}
                    </span>
                    <input 
                      type="checkbox" 
                      className="gtc-checkbox"
                      checked={isSelected} 
                      onChange={() => toggleBatchTask(task._id)}
                      title="Select for batch update"
                    />
                  </div>
                </div>
                
                <h4 className="gtc-title">
                  <Link to={`/project/${task.project?._id || task.project}`}>{task.title}</Link>
                </h4>
                <p className="gtc-desc">{task.description}</p>
                
                <div className="gtc-meta">
                  <div className="gtc-meta-row">
                    <span className="gtc-meta-label">Status</span>
                    <span className="gtc-meta-value">{task.status}</span>
                  </div>
                  <div className="gtc-meta-row">
                    <span className="gtc-meta-label">Assigned</span>
                    <span className="gtc-meta-value">{task.assignedTo?.name || 'Unassigned'}</span>
                  </div>
                  {task.dueDate && (
                    <div className="gtc-meta-row">
                      <span className="gtc-meta-label">Due Date</span>
                      <span className={`gtc-meta-value ${isTaskOverdue ? 'text-danger font-bold' : ''}`}>
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          {tasks.length === 0 && (
            <div className="global-tasks-empty">
              <p>No tasks match your current filters.</p>
            </div>
          )}
        </div>

        {selectedBatchTasks.length > 0 && (
          <div className="batch-bar-overlay">
            <div className="batch-bar-content">
              <div className="batch-info">
                <span className="batch-count">{selectedBatchTasks.length}</span>
                <span className="batch-text">Tasks Selected</span>
              </div>
              
              <div className="batch-controls">
                <select className="batch-select" value={batchStatus} onChange={e => setBatchStatus(e.target.value)}>
                  <option value="">-- Set Status --</option>
                  <option value="Backlog">Backlog</option>
                  <option value="In Progress">In Progress</option>
                  <option value="In Review">In Review</option>
                  <option value="Done">Done</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>

              <div className="batch-actions">
                <button className="btn-batch-apply" onClick={handleBatchUpdate}>Apply Status</button>
                <button className="btn-batch-clear" onClick={() => { setSelectedBatchTasks([]); setBatchStatus(''); }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default GlobalTasks;