import React, { useState } from 'react';
import './TaskCard.css';

const TaskCard = ({ 
  task, role, userId, 
  isEditing, editForm, setEditForm, 
  onSaveEdit, onCancelEdit, onStartEdit, onDelete, 
  onStatusChange, onDismissAlert, 
  projectMembers, allTasks, 
  isSelectedForBatch, onToggleBatchTask, 
  isTimelineOpen, onToggleTimeline, 
  commentText, onCommentChange, onAddComment 
}) => {
  const [editMemberSearch, setEditMemberSearch] = useState('');
  const [editTaskSearch, setEditTaskSearch] = useState('');

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done';
  const hasDismissed = task.dismissedBy?.some(id => String(id) === String(userId));
  const isAssignedToMe = task.assignedTo?.some(u => String(u._id || u) === String(userId));
  
  
  const canDismiss = isAssignedToMe;

  const toggleEditAssignee = (id) => {
    const current = editForm.assignedTo || [];
    setEditForm({ ...editForm, assignedTo: current.includes(id) ? current.filter(uid => uid !== id) : [...current, id] });
  };

  const toggleEditDependency = (id) => {
    const current = editForm.dependencies || [];
    setEditForm({ ...editForm, dependencies: current.includes(id) ? current.filter(tid => tid !== id) : [...current, id] });
  };

  const tasksForEdit = (allTasks || []).filter(t => t._id !== task._id);

  const filteredEditMembers = (projectMembers || []).filter(m => 
    m.name?.toLowerCase().includes(editMemberSearch.toLowerCase())
  );

  const filteredEditTasks = tasksForEdit.filter(t => 
    t.title?.toLowerCase().includes(editTaskSearch.toLowerCase())
  );

  if (isEditing) {
    return (
      <div className="task-card editing">
        <div className="task-edit-grid">
          <input className="edit-input font-bold" type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
          <textarea className="edit-textarea" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
          
          <div className="edit-row-small">
            <select className="edit-input" value={editForm.priority} onChange={e => setEditForm({...editForm, priority: e.target.value})}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <input className="edit-input" type="date" value={editForm.dueDate} onChange={e => setEditForm({...editForm, dueDate: e.target.value})} />
          </div>

          <div className="edit-row-large">
            <div className="edit-multi-group">
              <label>Assign To:</label>
              <input 
                type="text" 
                placeholder="🔍 Search members..." 
                value={editMemberSearch} 
                onChange={e => setEditMemberSearch(e.target.value)}
                className="search-sub-input"
              />
              <div className="edit-checkbox-list">
                {filteredEditMembers.map(m => (
                  <label key={m._id} className="checkbox-label">
                    <input type="checkbox" checked={editForm.assignedTo.includes(m._id)} onChange={() => toggleEditAssignee(m._id)} /> 
                    <span>{m.name}</span>
                  </label>
                ))}
                {filteredEditMembers.length === 0 && <span className="empty-text">No members found.</span>}
              </div>
            </div>

            <div className="edit-multi-group">
              <label>Dependencies:</label>
              <input 
                type="text" 
                placeholder="🔍 Search tasks..." 
                value={editTaskSearch} 
                onChange={e => setEditTaskSearch(e.target.value)}
                className="search-sub-input"
              />
              <div className="edit-checkbox-list">
                {filteredEditTasks.map(t => (
                  <label key={t._id} className="checkbox-label">
                    <input type="checkbox" checked={editForm.dependencies.includes(t._id)} onChange={() => toggleEditDependency(t._id)} /> 
                    <span>{t.title}</span>
                  </label>
                ))}
                {filteredEditTasks.length === 0 && <span className="empty-text">No tasks found.</span>}
              </div>
            </div>
          </div>

          <div className="task-actions mt-3">
            <button className="btn-save" onClick={() => onSaveEdit(task._id)}>Save</button>
            <button className="btn-cancel" onClick={onCancelEdit}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

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
    <div className={`task-card ${isSelectedForBatch ? 'selected' : ''}`} style={{ borderLeftColor: getStatusColor(task.status) }}>
      <div className="task-header">
        <h4 className="task-title text-truncate" title={task.title}>{task.title}</h4>
        <input className="task-checkbox" type="checkbox" checked={isSelectedForBatch} onChange={() => onToggleBatchTask(task._id)} />
      </div>
      <p className="task-desc">{task.description}</p>
      
      <div className="task-meta">
        <div className="meta-item">
          <span className="meta-key">Status:</span>
          <select className="status-select" value={task.status} onChange={(e) => onStatusChange(task._id, e.target.value)}>
            <option value="Backlog">Backlog</option>
            <option value="In Progress">In Progress</option>
            <option value="In Review">In Review</option>
            <option value="Done">Done</option>
            <option value="Blocked">Blocked</option>
          </select>
        </div>
        <div className="meta-item">
          <span className="meta-key">Assigned:</span> 
          <span className="meta-val text-truncate" title={task.assignedTo?.length ? task.assignedTo.map(u => u.name).join(', ') : 'Unassigned'}>
            {task.assignedTo?.length ? task.assignedTo.map(u => u.name).join(', ') : 'Unassigned'}
          </span>
        </div>
        {task.dependencies?.length > 0 && (
          <div className="meta-item">
            <span className="meta-key">Depends On:</span> 
            <span className="meta-val text-truncate" title={task.dependencies.map(d => d.title).join(', ')}>
              {task.dependencies.map(d => d.title).join(', ')}
            </span>
          </div>
        )}
        {task.dueDate && (
          <div className="meta-item">
            <span className="meta-key">Due Date:</span> 
            <span className="meta-val" style={{ color: isOverdue ? '#d93a5c' : 'inherit', fontWeight: isOverdue ? '600' : 'normal' }}>
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {isOverdue && !hasDismissed && canDismiss && (
        <button className="btn-dismiss" onClick={() => onDismissAlert(task._id)}>Dismiss Alert</button>
      )}

      <div className="task-actions mt-3">
        <button className="btn-ghost" onClick={() => onToggleTimeline(task._id)}>
          {isTimelineOpen ? 'Hide Audit Logs' : 'View Audit Logs'}
        </button>
        <button className="btn-ghost color-blue" onClick={() => onStartEdit(task)}>Edit</button>
        {role === 'Manager' && (
          <button className="btn-ghost color-red" onClick={() => onDelete(task._id)}>Delete</button>
        )}
      </div>

      {isTimelineOpen && (
        <div className="task-timeline">
          <div className="timeline-logs">
            {task.history?.map((log, index) => (
              <div key={index} className="timeline-entry">
                <span className="log-action" style={{ color: log.action === 'Comment' ? '#2563eb' : '#6a6a6a' }}>[{log.action}]</span>
                <span className="log-details">{log.details}</span>
                <div className="log-meta">By: {log.user?.name || 'Unknown'} on {new Date(log.date).toLocaleString()}</div>
              </div>
            ))}
          </div>
          <div className="timeline-comment-box">
            <input type="text" placeholder="Add comment..." value={commentText || ''} onChange={(e) => onCommentChange(task._id, e.target.value)} className="comment-input" />
            <button className="btn-comment" onClick={() => onAddComment(task._id)}>Post</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;