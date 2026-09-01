import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../axiosPatch';
import { useAuth } from '../context/AuthContext';
import './ProjectView.css';

const ProjectView = () => {
  const { id: projectId } = useParams();
  const { role, userId } = useAuth(); // FIXED: Extract userId to check dismissals
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState(''); 
  const [assignedTo, setAssignedTo] = useState([]); 
  const [selectedDependencies, setSelectedDependencies] = useState([]);

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editForm, setEditForm] = useState({ 
    title: '', description: '', priority: 'Medium', dueDate: '', assignedTo: [], dependencies: []
  });

  const [selectedBatchTasks, setSelectedBatchTasks] = useState([]);
  const [batchStatus, setBatchStatus] = useState('');
  const [batchAssignees, setBatchAssignees] = useState([]); 

  const [openTimelines, setOpenTimelines] = useState([]);
  const [comments, setComments] = useState({});

  useEffect(() => {
    fetchProjectDetails();
    fetchTasks();
  }, [projectId]);

  const fetchProjectDetails = async () => {
    const { data } = await axios.get(`/projects/${projectId}`);
    setProject(data);
  };

  const fetchTasks = async () => {
    const { data } = await axios.get(`/tasks/project/${projectId}`);
    setTasks(data);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/tasks', {
        title, description, priority, dueDate: dueDate || null,
        project: projectId, assignedTo, dependencies: selectedDependencies
      });
      setTitle(''); setDescription(''); setDueDate('');
      setAssignedTo([]); setSelectedDependencies([]);
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create task');
    }
  };

  const startEditing = (task) => {
    setEditingTaskId(task._id);
    setEditForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      assignedTo: task.assignedTo ? task.assignedTo.map(u => u._id) : [],
      dependencies: task.dependencies ? task.dependencies.map(d => d._id || d) : []
    });
  };

  const submitEdit = async (taskId) => {
    try {
      await axios.patch(`/tasks/${taskId}`, editForm);
      setEditingTaskId(null);
      fetchTasks();
      window.dispatchEvent(new Event('alertsUpdated')); // Tell Navbar to check alerts
    } catch (err) {
      alert('Failed to update task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await axios.patch(`/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
      if(newStatus === 'Done') window.dispatchEvent(new Event('alertsUpdated'));
    } catch (err) {
      if (err.response?.data?.blockingTasks) {
        alert(`Cannot complete!\n\nBlocking Tasks: \n- ${err.response.data.blockingTasks.join('\n- ')}`);
      } else {
        alert(err.response?.data?.error || 'Failed to update status');
      }
      fetchTasks(); 
    }
  };

  const handleDependencyToggle = (taskId) => {
    setSelectedDependencies(prev => prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]);
  };

  const handleDeleteTask = async (taskId) => {
    if(!window.confirm('Delete this task?')) return;
    try {
      await axios.delete(`/tasks/${taskId}`);
      fetchTasks();
      setSelectedBatchTasks(prev => prev.filter(id => id !== taskId));
      window.dispatchEvent(new Event('alertsUpdated'));
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
    if (batchAssignees.length > 0) updates.assignedTo = batchAssignees;

    try {
      const { data } = await axios.patch('/tasks/batch', { taskIds: selectedBatchTasks, updates });
      alert(`Updated: ${data.successful.length}, Failed: ${data.failed.length}`);
      setSelectedBatchTasks([]); setBatchStatus(''); setBatchAssignees([]);
      fetchTasks();
      window.dispatchEvent(new Event('alertsUpdated'));
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
      fetchTasks();
    } catch (err) {
      alert('Failed to add comment');
    }
  };

  const handleDismissAlert = async (taskId) => {
    try {
      await axios.post(`/tasks/${taskId}/dismiss-alert`);
      fetchTasks();
      window.dispatchEvent(new Event('alertsUpdated')); // FIXED: Immediately update navbar badge
    } catch (err) {
      alert('Failed to dismiss alert');
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
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '6px' }} />
          </div>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
            <div>
              <strong>Assign To (Multi-Select):</strong>
              <select multiple value={assignedTo} onChange={e => setAssignedTo(Array.from(e.target.selectedOptions, option => option.value))} style={{ marginLeft: '10px', padding: '5px', height: '60px' }}>
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
      </div>

      <div className="projects-grid">
        {tasks.map(task => {
          const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done';
          // FIXED: Check if the user has already dismissed this task
          const hasDismissed = task.dismissedBy?.includes(userId); 
          
          return (
            <div key={task._id} className="project-card" style={{ borderLeft: `4px solid ${task.status === 'Done' ? 'green' : '#FF385C'}`, backgroundColor: selectedBatchTasks.includes(task._id) ? '#f0f8ff' : '#fff' }}>
              
              {editingTaskId === task._id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} style={{ padding: '5px', fontWeight: 'bold' }} />
                  <textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} style={{ padding: '5px', width: '100%' }} />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <select value={editForm.priority} onChange={e => setEditForm({...editForm, priority: e.target.value})} style={{ padding: '5px' }}>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                    <input type="date" value={editForm.dueDate} onChange={e => setEditForm({...editForm, dueDate: e.target.value})} style={{ padding: '5px' }} />
                  </div>
                  {role === 'Manager' && (
                    <select multiple value={editForm.assignedTo} onChange={e => setEditForm({...editForm, assignedTo: Array.from(e.target.selectedOptions, opt => opt.value)})} style={{ padding: '5px', height: '60px' }}>
                      {project.members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                    </select>
                  )}
                  <div>
                    <strong style={{fontSize: '0.85rem'}}>Dependencies:</strong>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '3px' }}>
                      {tasks.filter(t => t._id !== task._id).map(t => (
                        <label key={t._id} style={{ fontSize: '0.8rem' }}>
                          <input type="checkbox" checked={editForm.dependencies.includes(t._id)} 
                            onChange={() => {
                              const currentDeps = editForm.dependencies || [];
                              const updatedDeps = currentDeps.includes(t._id) ? currentDeps.filter(id => id !== t._id) : [...currentDeps, t._id];
                              setEditForm({...editForm, dependencies: updatedDeps});
                            }} /> {t.title}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button onClick={() => submitEdit(task._id)} style={{ background: '#28a745', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>Save</button>
                    <button onClick={() => setEditingTaskId(null)} style={{ background: '#ccc', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4>{task.title}</h4>
                    <input type="checkbox" checked={selectedBatchTasks.includes(task._id)} onChange={() => toggleBatchTask(task._id)} style={{ transform: 'scale(1.2)', cursor: 'pointer' }} />
                  </div>
                  <p>{task.description}</p>
                  
                  <div style={{ fontSize: '0.85rem', margin: '10px 0' }}>
                    <p><strong>Status:</strong> 
                      <select value={task.status} onChange={(e) => handleStatusChange(task._id, e.target.value)} style={{ marginLeft: '5px', padding: '2px' }}>
                        <option value="Backlog">Backlog</option>
                        <option value="In Progress">In Progress</option>
                        <option value="In Review">In Review</option>
                        <option value="Done">Done</option>
                        <option value="Blocked">Blocked</option>
                      </select>
                    </p>
                    <p><strong>Assigned:</strong> {task.assignedTo && task.assignedTo.length > 0 ? task.assignedTo.map(u => u.name).join(', ') : 'Unassigned'}</p>
                    {task.dependencies && task.dependencies.length > 0 && (
                      <p><strong>Depends On:</strong> {task.dependencies.map(d => d.title).join(', ')}</p>
                    )}
                    {task.dueDate && <p><strong>Due Date:</strong> <span style={{color: isOverdue ? 'red' : 'inherit'}}>{new Date(task.dueDate).toLocaleDateString()}</span></p>}
                    
                    {/* FIXED: Hides button if user has already dismissed it */}
                    {isOverdue && !hasDismissed && (
                       <button onClick={() => handleDismissAlert(task._id)} style={{ padding: '2px 6px', background: '#ffc107', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '5px' }}>Dismiss Overdue Alert</button>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                    <button onClick={() => toggleTimeline(task._id)} style={{ background: '#f8f9fa', border: '1px solid #ddd', color: '#333', padding: '4px 8px', cursor: 'pointer' }}>
                      {openTimelines.includes(task._id) ? 'Hide Audit Log' : 'View Audit Log'}
                    </button>
                    <button onClick={() => startEditing(task)} style={{ background: 'transparent', border: '1px solid #007bff', color: '#007bff', padding: '4px 8px', cursor: 'pointer' }}>Edit</button>
                    {role === 'Manager' && (
                      <button onClick={() => handleDeleteTask(task._id)} style={{ background: 'transparent', border: '1px solid #ccc', color: '#333', padding: '4px 8px', cursor: 'pointer' }}>Delete</button>
                    )}
                  </div>
                </>
              )}

              {openTimelines.includes(task._id) && !editingTaskId && (
                <div style={{ marginTop: '15px', background: '#fafafa', border: '1px solid #eee', borderRadius: '4px', padding: '10px' }}>
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
                  </div>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <input type="text" placeholder="Add a comment..." value={comments[task._id] || ''} onChange={(e) => handleCommentChange(task._id, e.target.value)} style={{ flex: 1, padding: '6px' }} />
                    <button onClick={() => handleAddComment(task._id)} style={{ padding: '6px 12px', background: '#333', color: 'white', border: 'none', cursor: 'pointer' }}>Post</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedBatchTasks.length > 0 && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#ffffff', padding: '15px 20px', boxShadow: '0 -4px 12px rgba(0,0,0,0.1)', display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'center', zIndex: 1000, borderTop: '2px solid #007bff' }}>
          <strong style={{ fontSize: '1.1rem' }}>Batch Update ({selectedBatchTasks.length})</strong>
          <select value={batchStatus} onChange={e => setBatchStatus(e.target.value)} style={{ padding: '8px' }}>
            <option value="">-- Set Status --</option>
            <option value="Backlog">Backlog</option>
            <option value="In Progress">In Progress</option>
            <option value="In Review">In Review</option>
            <option value="Done">Done</option>
            <option value="Blocked">Blocked</option>
          </select>
          {role === 'Manager' && (
            <select multiple value={batchAssignees} onChange={e => setBatchAssignees(Array.from(e.target.selectedOptions, option => option.value))} style={{ padding: '8px', height: '40px' }}>
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