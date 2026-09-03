import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../axiosPatch';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import BatchUpdateBar from '../components/BatchUpdateBar';
import SearchableDropdown from '../components/SearchableDropdown';
import './GlobalTasks.css';

const GlobalTasks = () => {
  const { role } = useAuth();
  
  // Data States
  const [tasks, setTasks] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [projectsList, setProjectsList] = useState([]);
  const [usersList, setUsersList] = useState([]);

  // Filter States
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [sortBy, setSortBy] = useState('createdAt'); 
  const [isOverdue, setIsOverdue] = useState(false); 
  const [filterProject, setFilterProject] = useState('');   
  const [filterAssignee, setFilterAssignee] = useState(''); 

  // Pagination State
  const [page, setPage] = useState(1);
  const limit = 10; 

  const [selectedBatchTasks, setSelectedBatchTasks] = useState([]);
  const [batchStatus, setBatchStatus] = useState('');
  const [batchAssignees, setBatchAssignees] = useState([]); 
  const [batchDueDate, setBatchDueDate] = useState('');

  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [projRes, usersRes] = await Promise.all([
          axios.get('/projects'),
          axios.get('/users') 
        ]);
        setProjectsList(projRes.data);
        setUsersList(usersRes.data);
      } catch (error) {
        console.error("Failed to load filter dropdowns");
      }
    };
    loadDropdownData();
  }, []);

  const fetchTasks = async () => {
    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (status) params.status = status;
      if (priority) params.priority = priority;
      if (sortBy) params.sortBy = sortBy;
      if (isOverdue) params.isOverdue = true; 
      if (filterProject) params.project = filterProject;     
      if (filterAssignee) params.assignedTo = filterAssignee; 

      const { data } = await axios.get('/tasks/global', { params });
      
      setTasks(data.tasks || []); 
      setTotalCount(data.totalCount || 0);
    } catch (err) {
      toast.error('Error fetching global tasks');
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, status, priority, sortBy, isOverdue, filterProject, filterAssignee]);

  useEffect(() => {
    fetchTasks();
  }, [page, search, status, priority, sortBy, isOverdue, filterProject, filterAssignee]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput); 
  };

  const handleExportCSV = () => {
    if (tasks.length === 0) {
      toast.error("No tasks to export.");
      return;
    }

    const headers = ['Project', 'Task Title', 'Description', 'Priority', 'Status', 'Assigned To', 'Due Date'];
    const csvRows = [headers.join(',')];

    tasks.forEach(t => {
      const assignedNames = t.assignedTo?.length ? t.assignedTo.map(u => u.name).join(', ') : 'Unassigned';
      
      const row = [
        `"${t.project?.name || ''}"`,
        `"${t.title.replace(/"/g, '""')}"`, 
        `"${t.description.replace(/"/g, '""')}"`,
        `"${t.priority}"`,
        `"${t.status}"`,
        `"${assignedNames}"`,
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
    
    const updates = {};
    let updateLabel = "";

    if (batchStatus) {
      updates.status = batchStatus;
      updateLabel = `Status changed to ➔ ${batchStatus}`;
    } else if (batchDueDate) {
      updates.dueDate = batchDueDate;
      updateLabel = `Due Date changed to ➔ ${new Date(batchDueDate).toLocaleDateString()}`;
    }

    if (Object.keys(updates).length === 0) {
      toast.error("Please choose an update type and value first.");
      return;
    }

    try {
      const { data } = await axios.patch('/tasks/batch', { taskIds: selectedBatchTasks, updates });
      
      const successCount = data.successful ? data.successful.length : 0;
      const failCount = data.failed ? data.failed.length : 0;
      
      toast((t) => (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '12px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e4e4e4', paddingBottom: '8px' }}>
            <strong style={{ fontSize: '15px', color: '#111827' }}>Global Batch Update Summary</strong>
            <button 
              onClick={() => toast.dismiss(t.id)}
              style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#6b7280', padding: '0 4px', lineHeight: '1' }}
            >
              ✕
            </button>
          </div>
          
          <div style={{ maxHeight: '260px', overflowY: 'auto', paddingRight: '4px' }}>
            {successCount > 0 && (
              <div style={{ marginBottom: failCount > 0 ? '16px' : '0' }}>
                <span style={{ color: '#059669', fontSize: '13.5px', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                  ✓ Successfully Updated ({successCount})
                </span>
                {data.successful.map((s, i) => (
                  <div key={`s-${i}`} style={{ background: '#f0fdf4', borderLeft: '3px solid #059669', padding: '8px 10px', marginBottom: '6px', borderRadius: '4px' }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#1f2937' }}>{s.title}</div>
                    <div style={{ fontSize: '12.5px', color: '#047857', marginTop: '2px' }}>{updateLabel}</div>
                  </div>
                ))}
              </div>
            )}

            {failCount > 0 && (
              <div>
                <span style={{ color: '#e11d48', fontSize: '13.5px', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                  ✗ Failed / Rejected ({failCount})
                </span>
                {data.failed.map((f, i) => (
                  <div key={`f-${i}`} style={{ background: '#fff1f2', borderLeft: '3px solid #e11d48', padding: '8px 10px', marginBottom: '6px', borderRadius: '4px' }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#1f2937' }}>{f.title}</div>
                    <div style={{ fontSize: '12.5px', color: '#be123c', marginTop: '2px', fontWeight: 500 }}>Reason: {f.reason}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ), { duration: 15000, style: { minWidth: '380px', maxWidth: '460px', padding: '16px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)' } });

      setSelectedBatchTasks([]); 
      setBatchStatus(''); 
      setBatchAssignees([]); 
      setBatchDueDate('');
      fetchTasks();
      window.dispatchEvent(new Event('alertsUpdated'));
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

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="global-tasks-wrapper" style={{ paddingBottom: selectedBatchTasks.length > 0 ? '100px' : '40px' }}>
      <div className="global-tasks-content">
        
        <header className="global-header">
          <div>
            <h2 className="page-title">Global Task Search</h2>
            <p className="page-subtitle">Showing {totalCount} total matches across your portfolio.</p>
          </div>
        </header>

        <div className="filters-card">
          <form onSubmit={handleSearchSubmit} className="search-bar">
            <input 
              type="text" 
              placeholder="Search tasks by title or description..." 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="btn-search">Search</button>
          </form>

          <div className="filter-controls">
            
            <SearchableDropdown 
              options={projectsList} 
              value={filterProject} 
              onChange={setFilterProject} 
              placeholder="All Projects" 
              searchPlaceholder="Find project..."
            />

            <SearchableDropdown 
              options={usersList} 
              value={filterAssignee} 
              onChange={setFilterAssignee} 
              placeholder="All Assignees" 
              searchPlaceholder="Find member..."
            />

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
              <option value="priority">Sort: Priority</option>
              <option value="updatedAt">Sort: Last Update</option>
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
            const displayAssigned = task.assignedTo?.length ? task.assignedTo.map(u => u.name).join(', ') : 'Unassigned';

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
                  <Link to={`/projects/${task.project?._id || task.project}`}>{task.title}</Link>
                </h4>
                <p className="gtc-desc">{task.description}</p>
                
                <div className="gtc-meta">
                  <div className="gtc-meta-row">
                    <span className="gtc-meta-label">Status</span>
                    <span className="gtc-meta-value">{task.status}</span>
                  </div>
                  <div className="gtc-meta-row">
                    <span className="gtc-meta-label">Assigned</span>
                    <span className="gtc-meta-value text-truncate" title={displayAssigned}>{displayAssigned}</span>
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

        {totalPages > 1 && (
          <div className="pagination-wrapper">
            <button 
              className="btn-page" 
              disabled={page === 1} 
              onClick={() => setPage(prev => prev - 1)}
            >
              &larr; Previous
            </button>
            <span className="page-indicator">Page {page} of {totalPages}</span>
            <button 
              className="btn-page" 
              disabled={page === totalPages} 
              onClick={() => setPage(prev => prev + 1)}
            >
              Next &rarr;
            </button>
          </div>
        )}

        <BatchUpdateBar 
          selectedCount={selectedBatchTasks.length}
          batchStatus={batchStatus} setBatchStatus={setBatchStatus}
          batchAssignees={batchAssignees} setBatchAssignees={setBatchAssignees}
          batchDueDate={batchDueDate} setBatchDueDate={setBatchDueDate} 
          projectMembers={null} 
          role={role}
          onApply={handleBatchUpdate}
          onClear={() => { setSelectedBatchTasks([]); setBatchStatus(''); setBatchAssignees([]); setBatchDueDate(''); }}
        />

      </div>
    </div>
  );
};

export default GlobalTasks;