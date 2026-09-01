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
  
  // Task Creation State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState(''); 
  const [assignedTo, setAssignedTo] = useState('');
  const [selectedDependencies, setSelectedDependencies] = useState([]);

  // Batch Update State
  const [selectedBatchTasks, setSelectedBatchTasks] = useState([]);
  const [batchStatus, setBatchStatus] = useState('');
  const [batchAssignee, setBatchAssignee] = useState('');

  // --- NEW: Audit History & Comments State ---
  const [openTimelines, setOpenTimelines] = useState([]);
  const [comments, setComments] = useState({});

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
        title, description, priority, dueDate: dueDate || null,
        project: projectId, assignedTo: assignedTo || null,
        dependencies: selectedDependencies
      });
      setTitle(''); setDescription(''); setDueDate('');
      setAssignedTo(''); setSelectedDependencies([]);
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
      setSelectedBatchTasks(prev => prev.filter(id => id !== taskId));
    } catch (err) {
      alert('Failed to delete task');
    }
  };


  const toggleBatchTask = (taskId) => {
    setSelectedBatchTasks(prev => prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]);
  };

  const handleBatchUpdate = async () => {
    if (selectedBatchTasks.length === 0) return;
    const updates = {};
    if (batchStatus) updates.status = batchStatus;
    if (batchAssignee) updates.assignedTo = batchAssignee;

    if (Object.keys(updates).length === 0) {
      alert('Please select a new status or assignee to apply.');
      return;
    }

    try {
      const { data } = await axios.patch('/tasks/batch', { taskIds: selectedBatchTasks, updates });
      let alertMsg = `Batch Update Complete!\n\nSuccessful: ${data.successful.length}\nFailed: ${data.failed.length}`;
      if (data.failed.length > 0) alertMsg += `\n\nFailures:\n` + data.failed.map(f => `- ${f.title}: ${f.reason}`).join('\n');
      alert(alertMsg);
      setSelectedBatchTasks([]); setBatchStatus(''); setBatchAssignee('');
      fetchTasks();
    } catch (err) {
      alert('Failed to process batch update.');
    }
  };

 
  const toggleTimeline = (taskId) => {
    setOpenTimelines(prev => prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]);
  };

  const handleCommentChange = (taskId, text) => {
    setComments(prev => ({ ...prev, [taskId]: text }));
  };

  const handleAddComment = async (taskId) => {
    if (!comments[taskId]?.trim()) return;
    try {
      await axios.post(`/tasks/${taskId}/comments`, { comment: comments[taskId] });
      setComments(prev => ({ ...prev, [taskId]: '' }));
      fetchTasks(); // Refresh tasks to get the new history log
    } catch (err) {
      alert('Failed to add comment');
    }
  };

  if (!project) return <div>Loading project...</div>;

  return (
    <div className="dashboard-container" style={{ paddingBottom: selectedBatchTasks.length > 0 ? '80px' : '20px' }}>
      <header className="dashboard-header">
        <div>
          <Link to="/dashboard" className="back-link">&larr; Back to Dashboard</Link>
          <h2 style={{ marginTop: '10px' }}>Project: {project.name}</h2>
        </div>
        <span className="role-badge">{role}</span>
      </header>

      {role === 'Manager' && (
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
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }} />
          </div>
          
          <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
            <div>
              <strong>Assign To:</strong>
              <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} style={{ marginLeft: '10px', padding: '5px' }}>
                <option value="">Unassigned</option>
                {project.members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <strong>Depends On:</strong>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '5px' }}>
                {tasks.map(t => (
                  <label key={t._id} style={{ fontSize: '0.85rem' }}>
                    <input type="checkbox" checked={selectedDependencies.includes(t._id)} onChange={() => handleDependencyToggle(t._id)} /> {t.title}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <button type="submit" style={{ alignSelf: 'flex-start' }}>Add Task</button>
        </form>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Project Tasks</h3>
        {selectedBatchTasks.length > 0 && <span style={{ fontWeight: 'bold', color: '#007bff' }}>{selectedBatchTasks.length} task(s) selected</span>}
      </div>

      <div className="projects-grid">
        {tasks.map(task => (
          <div key={task._id} className="project-card" style={{ borderLeft: `4px solid ${task.status === 'Done' ? 'green' : '#FF385C'}`, backgroundColor: selectedBatchTasks.includes(task._id) ? '#f0f8ff' : '#fff' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h4>{task.title}</h4>
              <input type="checkbox" checked={selectedBatchTasks.includes(task._id)} onChange={() => toggleBatchTask(task._id)} style={{ transform: 'scale(1.2)', cursor: 'pointer' }} />
            </div>
            
            <p>{task.description}</p>
            
            <div style={{ fontSize: '0.85rem', margin: '10px 0' }}>
              <p><strong>Status:</strong> 
                <select value={task.status} onChange={(e) => handleStatusChange(task._id, e.target.value)} style={{ marginLeft: '5px', padding: '2px' }}>
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </p>
              <p><strong>Assigned:</strong> {task.assignedTo?.name || 'Unassigned'}</p>
              {task.dueDate && <p><strong>Due Date:</strong> <span style={{color: new Date(task.dueDate) < new Date() && task.status !== 'Done' ? 'red' : 'inherit'}}>{new Date(task.dueDate).toLocaleDateString()}</span></p>}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button onClick={() => toggleTimeline(task._id)} style={{ background: '#f8f9fa', border: '1px solid #ddd', color: '#333', padding: '4px 8px', cursor: 'pointer' }}>
                {openTimelines.includes(task._id) ? 'Hide Audit Log' : 'View Audit Log'}
              </button>
              {role === 'Manager' && (
                <button onClick={() => handleDeleteTask(task._id)} style={{ background: 'transparent', border: '1px solid #ccc', color: '#333', padding: '4px 8px', cursor: 'pointer' }}>Delete</button>
              )}
            </div>

      
            {openTimelines.includes(task._id) && (
              <div style={{ marginTop: '15px', background: '#fafafa', border: '1px solid #eee', borderRadius: '4px', padding: '10px' }}>
                <h5 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>Task Audit History</h5>
                
                <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '10px', fontSize: '0.85rem' }}>
                  {task.history?.map((log, index) => (
                    <div key={index} style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px dotted #ccc' }}>
                      <span style={{ fontWeight: 'bold', color: log.action === 'Comment' ? '#007bff' : '#555' }}>[{log.action}] </span>
                      <span>{log.details}</span>
                      <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '3px' }}>
                        By: {log.user?.name || 'Unknown'} on {new Date(log.date).toLocaleString()}
                      </div>
                    </div>
                  ))}
                  {(!task.history || task.history.length === 0) && <p style={{ color: '#888' }}>No history recorded.</p>}
                </div>

                <div style={{ display: 'flex', gap: '5px' }}>
                  <input 
                    type="text" 
                    placeholder="Add a comment..." 
                    value={comments[task._id] || ''}
                    onChange={(e) => handleCommentChange(task._id, e.target.value)}
                    style={{ flex: 1, padding: '6px', fontSize: '0.85rem' }}
                  />
                  <button 
                    onClick={() => handleAddComment(task._id)}
                    style={{ padding: '6px 12px', background: '#333', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    Post
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

    
      {selectedBatchTasks.length > 0 && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#ffffff', padding: '15px 20px', boxShadow: '0 -4px 12px rgba(0,0,0,0.1)', display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'center', zIndex: 1000, borderTop: '2px solid #007bff' }}>
          <strong style={{ fontSize: '1.1rem' }}>Batch Update ({selectedBatchTasks.length})</strong>
          <select value={batchStatus} onChange={e => setBatchStatus(e.target.value)} style={{ padding: '8px' }}>
            <option value="">-- Set Status --</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
          {role === 'Manager' && (
            <select value={batchAssignee} onChange={e => setBatchAssignee(e.target.value)} style={{ padding: '8px' }}>
              <option value="">-- Reassign To --</option>
              {project.members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
            </select>
          )}
          <button onClick={handleBatchUpdate} style={{ background: '#28a745', color: 'white', padding: '8px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Apply</button>
          <button onClick={() => setSelectedBatchTasks([])} style={{ background: 'transparent', color: '#dc3545', padding: '8px 20px', border: '1px solid #dc3545', borderRadius: '4px', cursor: 'pointer' }}>Clear</button>
        </div>
      )}
    </div>
  );
};

export default ProjectView;