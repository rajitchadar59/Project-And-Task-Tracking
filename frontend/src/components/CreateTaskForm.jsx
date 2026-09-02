import React from 'react';
import SearchableMultiSelect from './SearchableMultiSelect';
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

  const toggleAssignee = (id) => {
    setAssignedTo(prev => prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]);
  };

  const toggleDependency = (id) => {
    setSelectedDependencies(prev => prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]);
  };

  return (
    <form className="create-task-form" onSubmit={onSubmit}>
      <h3 className="form-title">Create New Task</h3>
      
      <div className="form-primary-row">
        <input className="form-input flex-1" type="text" placeholder="Task Title" value={title} onChange={e => setTitle(e.target.value)} required />
        <input className="form-input flex-2" type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required />
        <select className="form-select" value={priority} onChange={e => setPriority(e.target.value)}>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <input className="form-input form-date" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
      </div>

      <div className="form-secondary-row">
        <div className="multi-select-group">
          <label>Assign To:</label>
          <SearchableMultiSelect 
            items={projectMembers} 
            selectedIds={assignedTo} 
            onToggle={toggleAssignee} 
            placeholder="🔍 Search members..." 
            emptyMessage="No members found" 
          />
        </div>

        <div className="multi-select-group">
          <label>Depends On:</label>
          <SearchableMultiSelect 
            items={tasks} 
            selectedIds={selectedDependencies} 
            onToggle={toggleDependency} 
            placeholder="🔍 Search tasks..." 
            emptyMessage="No tasks found" 
          />
        </div>
      </div>

      <button type="submit" className="btn-create-task">Add Task</button>
    </form>
  );
};

export default CreateTaskForm;