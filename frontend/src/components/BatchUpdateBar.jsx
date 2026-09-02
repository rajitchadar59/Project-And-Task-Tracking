import React, { useState, useEffect } from 'react';
import SearchableMultiSelect from './SearchableMultiSelect';
import './BatchUpdateBar.css';

const BatchUpdateBar = ({ 
  selectedCount, 
  batchStatus, setBatchStatus, 
  batchAssignees, setBatchAssignees, 
  batchDueDate, setBatchDueDate, 
  projectMembers, 
  onApply, onClear, role 
}) => {
  const [updateMode, setUpdateMode] = useState(''); 

  useEffect(() => {
    if (selectedCount === 0) {
      setUpdateMode('');
    }
  }, [selectedCount]);

  if (selectedCount === 0) return null;

  const toggleBatchAssignee = (id) => {
    setBatchAssignees(prev => prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]);
  };

  const handleModeChange = (e) => {
    setUpdateMode(e.target.value);
    setBatchStatus('');
    setBatchAssignees([]);
    if (setBatchDueDate) setBatchDueDate('');
  };

  const handleApply = () => {
    if (!updateMode) return alert("Please choose an update type first.");
    if (updateMode === 'status' && !batchStatus) return alert("Please select a status.");
    if (updateMode === 'assignee' && batchAssignees.length === 0) return alert("Please select at least one assignee.");
    if (updateMode === 'dueDate' && !batchDueDate) return alert("Please select a due date.");
    onApply();
  };

  const handleClear = () => {
    setUpdateMode('');
    onClear();
  };

  return (
    <div className="batch-bar-overlay">
      <div className="batch-bar-content">
        
        <div className="batch-info">
          <span className="batch-count">{selectedCount}</span>
          <span className="batch-text">Tasks Selected</span>
        </div>

        <div className="batch-controls">
          <select className="batch-select primary-select" value={updateMode} onChange={handleModeChange}>
            
            <option value="">-- Choose Update Type --</option>
            <option value="status">Change Status</option>
            {role === 'Manager' && projectMembers && <option value="assignee">Change Assignees</option>}
            <option value="dueDate">Change Due Date</option>
          </select>
          
          {updateMode === 'status' && (
            <select className="batch-select fade-in" value={batchStatus} onChange={e => setBatchStatus(e.target.value)}>
              <option value="">-- Select New Status --</option>
              <option value="Backlog">Backlog</option>
              <option value="In Progress">In Progress</option>
              <option value="In Review">In Review</option>
              <option value="Done">Done</option>
              <option value="Blocked">Blocked</option>
            </select>
          )}

          {updateMode === 'assignee' && role === 'Manager' && projectMembers && (
            <div className="batch-dropdown-wrapper fade-in">
              <SearchableMultiSelect 
                items={projectMembers} 
                selectedIds={batchAssignees} 
                onToggle={toggleBatchAssignee} 
                placeholder="🔍 Assign members..." 
                emptyMessage="No members" 
              />
            </div>
          )}

          {updateMode === 'dueDate' && (
            <input 
              type="date" 
              className="batch-select fade-in" 
              value={batchDueDate || ''} 
              onChange={e => setBatchDueDate(e.target.value)}
            />
          )}
        </div>

        <div className="batch-actions">
          <button className="btn-batch-clear" onClick={handleApply}>Apply</button>
          <button className="btn-batch-clear" onClick={handleClear}>Cancel</button>
        </div>

      </div>
    </div>
  );
};

export default BatchUpdateBar;