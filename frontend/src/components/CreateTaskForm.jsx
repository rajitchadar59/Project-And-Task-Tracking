// src/components/CreateTaskForm.jsx
import React, { useState } from 'react';
import './CreateTaskForm.css';

const CreateTaskForm = ({ 
  onSubmit, 
  title, setTitle, 
  description, setDescription, 
  priority, setPriority, 
  dueDate, setDueDate, 
  projectMembers, tasks, 
  assignedTo, setAssignedTo, 
  selectedDependencies, setSelectedDependencies 
}) => {
  const [memberSearch, setMemberSearch] = useState('');
  const [taskSearch, setTaskSearch] = useState('');

  const toggleAssignee = (id) => {
    setAssignedTo(prev => prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]);
  };

  const toggleDependency = (id) => {
    setSelectedDependencies(prev => prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]);
  };

  const filteredMembers = projectMembers.filter(m => 
    m.name.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(taskSearch.toLowerCase())
  );

  return (
    <div className="task-form-container">
      <div className="task-form-card">
        <h3>Create New Task</h3>
        <p className="form-subtitle">Add a new task to this project workspace.</p>
        
        <form onSubmit={onSubmit} className="task-form">
          <div className="form-row-primary">
            <div className="form-group flex-1">
              <label>Task Title</label>
              <input type="text" placeholder="e.g. Design Homepage" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            <div className="form-group flex-2">
              <label>Description</label>
              <input type="text" placeholder="Task details and objectives" value={description} onChange={e => setDescription(e.target.value)} required />
            </div>
          </div>

          <div className="form-row-secondary">
            <div className="form-group">
              <label>Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value)}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
          </div>

          <div className="form-row-tertiary">
            <div className="form-group">
              <label>Assign Members</label>
              <input 
                type="text" 
                placeholder="🔍 Search members..." 
                value={memberSearch} 
                onChange={e => setMemberSearch(e.target.value)}
                className="search-sub-input"
              />
              <div className="checkbox-scroll-box">
                {filteredMembers.map(m => (
                  <label key={m._id} className="checkbox-label">
                    <input type="checkbox" checked={assignedTo.includes(m._id)} onChange={() => toggleAssignee(m._id)} />
                    <span>{m.name}</span>
                  </label>
                ))}
                {filteredMembers.length === 0 && <span className="empty-text">No members found.</span>}
              </div>
            </div>

            <div className="form-group">
              <label>Task Dependencies</label>
              <input 
                type="text" 
                placeholder="🔍 Search tasks..." 
                value={taskSearch} 
                onChange={e => setTaskSearch(e.target.value)}
                className="search-sub-input"
              />
              <div className="checkbox-scroll-box">
                {filteredTasks.map(t => (
                  <label key={t._id} className="checkbox-label">
                    <input type="checkbox" checked={selectedDependencies.includes(t._id)} onChange={() => toggleDependency(t._id)} />
                    <span>{t.title}</span>
                  </label>
                ))}
                {filteredTasks.length === 0 && <span className="empty-text">No tasks found.</span>}
              </div>
            </div>
          </div>

          <button type="submit" className="btn-create">Create Task</button>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskForm;