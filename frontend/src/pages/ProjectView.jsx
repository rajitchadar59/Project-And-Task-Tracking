import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../axiosPatch';
import { useAuth } from '../context/AuthContext';
import './ProjectView.css';

const ProjectView = () => {
  const { id: projectId } = useParams();
  const { role, userId } = useAuth(); 

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);

  // Create Task States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState(''); 
  const [assignedTo, setAssignedTo] = useState([]); 
  const [selectedDependencies, setSelectedDependencies] = useState([]);

  // Search filter states for checkbox lists
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const [dependencySearch, setDependencySearch] = useState('');
  const [editAssigneeSearch, setEditAssigneeSearch] = useState('');
  const [editDependencySearch, setEditDependencySearch] = useState('');
  const [batchAssigneeSearch, setBatchAssigneeSearch] = useState('');

  // Edit Task States
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
      setAssigneeSearch(''); setDependencySearch('');
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
    setEditAssigneeSearch('');
    setEditDependencySearch('');
  };

  const submitEdit = async (taskId) => {
    try {
      await axios.patch(`/tasks/${taskId}`, editForm);
      setEditingTaskId(null);
      fetchTasks();
      window.dispatchEvent(new Event('alertsUpdated'));
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

  const handleAssigneeToggle = (memberId) => {
    setAssignedTo(prev => prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]);
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
      setSelectedBatchTasks([]); setBatchStatus(''); setBatchAssignees([]); setBatchAssigneeSearch('');
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
      window.dispatchEvent(new Event('alertsUpdated'));
    } catch (err) {
      alert('Failed to dismiss alert');
    }
  };

  if (!project) return <div>Loading project...</div>;

  // Filtered lists for search boxes
  const filteredMembers = project.members.filter(m => m.name.toLowerCase().includes(assigneeSearch.toLowerCase()));
  const filteredTasksForCreate = tasks.filter(t => t.title.toLowerCase().includes(dependencySearch.toLowerCase()));
  
  const filteredMembersEdit = project.members.filter(m => m.name.toLowerCase().includes(editAssigneeSearch.toLowerCase()));
  const filteredTasksForEdit = (currentTaskId) => tasks.filter(t => t._id !== currentTaskId && t.title.toLowerCase().includes(editDependencySearch.toLowerCase()));
  
  const filteredMembersBatch = project.members.filter(m => m.name.toLowerCase().includes(batchAssigneeSearch.toLowerCase()));

  // Shared inline style for the search/checkbox container to keep it clean
  const selectBoxStyle = {
    border: '1px solid #ccc',
    borderRadius: '6px',
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    width: '100%',
    minWidth: '200px'
  };

  const searchInputStyle = {
    padding: '8px',
    border: 'none',
    borderBottom: '1px solid #eee',
    outline: 'none',
    fontSize: '0.85rem',
    background: '#f9f9f9'
  };

  const checkboxListStyle = {
    maxHeight: '110px',
    overflowY: 'auto',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  };

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
            <select value={priority} onChange={e => setPriority(e.target.value)} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '6px' }}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '6px' }} />
          </div>

          <div style={{ display: 'flex', gap: '30px', marginBottom: '15px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            
            {/* Assign To Custom Dropdown */}
            <div style={{ flex: 1 }}>
              <strong style={{ display: 'block', marginBottom: '5px' }}>Assign To:</strong>
              <div style={selectBoxStyle}>
                <input 
                  type="text" 
                  placeholder="🔍 Search members..." 
                  value={assigneeSearch} 
                  onChange={e => setAssigneeSearch(e.target.value)}
                  style={searchInputStyle}
                />
                <div style={checkboxListStyle}>
                  {filteredMembers.length === 0 ? (
                    <span style={{ fontSize: '0.8rem', color: '#888' }}>No members found</span>
                  ) : (
                    filteredMembers.map(m => (
                      <label key={m._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={assignedTo.includes(m._id)} 
                          onChange={() => handleAssigneeToggle(m._id)} 
                        /> 
                        {m.name}
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Depends On Custom Dropdown */}
            <div style={{ flex: 1 }}>
              <strong style={{ display: 'block', marginBottom: '5px' }}>Depends On:</strong>
              <div style={selectBoxStyle}>
                <input 
                  type="text" 
                  placeholder="🔍 Search tasks..." 
                  value={dependencySearch} 
                  onChange={e => setDependencySearch(e.target.value)}
                  style={searchInputStyle}
                />
                <div style={checkboxListStyle}>
                  {filteredTasksForCreate.length === 0 ? (
                    <span style={{ fontSize: '0.8rem', color: '#888' }}>No tasks found</span>
                  ) : (
                    filteredTasksForCreate.map(t => (
                      <label key={t._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={selectedDependencies.includes(t._id)} 
                          onChange={() => handleDependencyToggle(t._id)} 
                        /> 
                        {t.title}
                      </label>
                    ))
                  )}
                </div>
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
          const hasDismissed = task.dismissedBy?.some(id => String(id) === String(userId));
          const isAssignedToMe = task.assignedTo?.some(u => String(u._id || u) === String(userId));
          
          // FIXED: Nayi condition jo allow karti hai Manager ko aur Assigned member ko dismiss karne
          const canDismiss = role === 'Manager' || isAssignedToMe;
          
          return (
            <div key={task._id} className="project-card" style={{ borderLeft: `4px solid ${task.status === 'Done' ? 'green' : '#FF385C'}`, backgroundColor: selectedBatchTasks.includes(task._id) ? '#f0f8ff' : '#fff' }}>
              
              {editingTaskId === task._id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <input type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} style={{ padding: '8px', fontWeight: 'bold', border: '1px solid #ccc', borderRadius: '4px' }} />
                  <textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} style={{ padding: '8px', width: '100%', border: '1px solid #ccc', borderRadius: '4px' }} />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <select value={editForm.priority} onChange={e => setEditForm({...editForm, priority: e.target.value})} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                    <input type="date" value={editForm.dueDate} onChange={e => setEditForm({...editForm, dueDate: e.target.value})} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                  </div>

                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    {/* Edit Assignees Custom Dropdown */}
                    {role === 'Manager' && (
                      <div style={{ flex: 1 }}>
                        <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: '5px' }}>Assign To:</strong>
                        <div style={selectBoxStyle}>
                          <input 
                            type="text" 
                            placeholder="🔍 Search members..." 
                            value={editAssigneeSearch} 
                            onChange={e => setEditAssigneeSearch(e.target.value)}
                            style={searchInputStyle}
                          />
                          <div style={checkboxListStyle}>
                            {filteredMembersEdit.map(m => (
                              <label key={m._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                                <input 
                                  type="checkbox" 
                                  checked={editForm.assignedTo.includes(m._id)} 
                                  onChange={() => {
                                    const currentAssigned = editForm.assignedTo || [];
                                    const updatedAssigned = currentAssigned.includes(m._id) ? currentAssigned.filter(id => id !== m._id) : [...currentAssigned, m._id];
                                    setEditForm({...editForm, assignedTo: updatedAssigned});
                                  }} 
                                /> 
                                {m.name}
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Edit Dependencies Custom Dropdown */}
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: '5px' }}>Dependencies:</strong>
                      <div style={selectBoxStyle}>
                        <input 
                          type="text" 
                          placeholder="🔍 Search tasks..." 
                          value={editDependencySearch} 
                          onChange={e => setEditDependencySearch(e.target.value)}
                          style={searchInputStyle}
                        />
                        <div style={checkboxListStyle}>
                          {filteredTasksForEdit(task._id).map(t => (
                            <label key={t._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                              <input 
                                type="checkbox" 
                                checked={editForm.dependencies.includes(t._id)} 
                                onChange={() => {
                                  const currentDeps = editForm.dependencies || [];
                                  const updatedDeps = currentDeps.includes(t._id) ? currentDeps.filter(id => id !== t._id) : [...currentDeps, t._id];
                                  setEditForm({...editForm, dependencies: updatedDeps});
                                }} 
                              /> 
                              {t.title}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                    <button onClick={() => submitEdit(task._id)} style={{ background: '#28a745', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
                    <button onClick={() => setEditingTaskId(null)} style={{ background: '#ccc', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
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
                      <select value={task.status} onChange={(e) => handleStatusChange(task._id, e.target.value)} style={{ marginLeft: '5px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }}>
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
                    
                    {/* FIXED: button ab Manager aur Assigned user dono ko dikhega */}
                    {isOverdue && !hasDismissed && canDismiss && (
                       <button onClick={() => handleDismissAlert(task._id)} style={{ padding: '4px 8px', background: '#ffc107', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '8px', fontWeight: 'bold' }}> Dismiss Overdue Alert For You</button>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                    <button onClick={() => toggleTimeline(task._id)} style={{ background: '#f8f9fa', border: '1px solid #ddd', color: '#333', padding: '4px 8px', cursor: 'pointer', borderRadius: '4px' }}>
                      {openTimelines.includes(task._id) ? 'Hide Audit Log' : 'View Audit Log'}
                    </button>
                    <button onClick={() => startEditing(task)} style={{ background: 'transparent', border: '1px solid #007bff', color: '#007bff', padding: '4px 8px', cursor: 'pointer', borderRadius: '4px' }}>Edit</button>
                    {role === 'Manager' && (
                      <button onClick={() => handleDeleteTask(task._id)} style={{ background: 'transparent', border: '1px solid #ccc', color: '#333', padding: '4px 8px', cursor: 'pointer', borderRadius: '4px' }}>Delete</button>
                    )}
                  </div>
                </>
              )}

              {openTimelines.includes(task._id) && !editingTaskId && (
                <div style={{ marginTop: '15px', background: '#fafafa', border: '1px solid #eee', borderRadius: '6px', padding: '12px' }}>
                  <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '10px', fontSize: '0.85rem' }}>
                    {task.history?.map((log, index) => (
                      <div key={index} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px dotted #ccc' }}>
                        <span style={{ fontWeight: 'bold', color: log.action === 'Comment' ? '#007bff' : '#555' }}>[{log.action}] </span>
                        <span>{log.details}</span>
                        <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '4px' }}>
                          By: {log.user?.name || 'Unknown'} on {new Date(log.date).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="text" placeholder="Add a comment..." value={comments[task._id] || ''} onChange={(e) => handleCommentChange(task._id, e.target.value)} style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                    <button onClick={() => handleAddComment(task._id)} style={{ padding: '8px 16px', background: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Post</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedBatchTasks.length > 0 && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#ffffff', padding: '15px 20px', boxShadow: '0 -4px 12px rgba(0,0,0,0.15)', display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'center', zIndex: 1000, borderTop: '3px solid #007bff' }}>
          <strong style={{ fontSize: '1.1rem' }}>Batch Update ({selectedBatchTasks.length})</strong>
          <select value={batchStatus} onChange={e => setBatchStatus(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
            <option value="">-- Set Status --</option>
            <option value="Backlog">Backlog</option>
            <option value="In Progress">In Progress</option>
            <option value="In Review">In Review</option>
            <option value="Done">Done</option>
            <option value="Blocked">Blocked</option>
          </select>
          
          {role === 'Manager' && (
            <div style={{ position: 'relative', width: '220px' }}>
              <div style={{...selectBoxStyle, position: 'absolute', bottom: '100%', left: 0, marginBottom: '10px', boxShadow: '0 -4px 12px rgba(0,0,0,0.15)'}}>
                <input 
                  type="text" 
                  placeholder="🔍 Search members..." 
                  value={batchAssigneeSearch} 
                  onChange={e => setBatchAssigneeSearch(e.target.value)}
                  style={searchInputStyle}
                />
                <div style={checkboxListStyle}>
                  {filteredMembersBatch.map(m => (
                    <label key={m._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={batchAssignees.includes(m._id)} 
                        onChange={() => setBatchAssignees(prev => prev.includes(m._id) ? prev.filter(id => id !== m._id) : [...prev, m._id])} 
                      /> 
                      {m.name}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <button onClick={handleBatchUpdate} style={{ background: '#28a745', color: 'white', padding: '8px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Apply Updates</button>
          <button onClick={() => { setSelectedBatchTasks([]); setBatchAssignees([]); }} style={{ background: 'transparent', color: '#dc3545', padding: '8px 20px', border: '1px solid #dc3545', borderRadius: '4px', cursor: 'pointer' }}>Clear Selection</button>
        </div>
      )}
    </div>
  );
};

export default ProjectView;