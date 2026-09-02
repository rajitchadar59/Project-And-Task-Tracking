import React from 'react';
import SearchableMultiSelect from './SearchableMultiSelect';
import './BatchUpdateBar.css';

const BatchUpdateBar = ({ 
  selectedCount, 
  batchStatus, setBatchStatus, 
  batchAssignees, setBatchAssignees, 
  projectMembers, 
  onApply, onClear, role 
}) => {
  if (selectedCount === 0) return null;

  const toggleBatchAssignee = (id) => {
    setBatchAssignees(prev => prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]);
  };

  return (
    <div className="batch-bar-overlay">
      <div className="batch-bar-content">
        <div className="batch-info">
          <span className="batch-count">{selectedCount}</span>
          <span className="batch-text">Tasks Selected</span>
        </div>

        <div className="batch-controls">
          <select className="batch-select" value={batchStatus} onChange={e => setBatchStatus(e.target.value)}>
            <option value="">-- Update Status --</option>
            <option value="Backlog">Backlog</option>
            <option value="In Progress">In Progress</option>
            <option value="In Review">In Review</option>
            <option value="Done">Done</option>
            <option value="Blocked">Blocked</option>
          </select>
          
          {role === 'Manager' && (
            <div className="batch-dropdown-wrapper">
              <SearchableMultiSelect 
                items={projectMembers} 
                selectedIds={batchAssignees} 
                onToggle={toggleBatchAssignee} 
                placeholder="🔍 Assign members..." 
                emptyMessage="No members" 
              />
            </div>
          )}
        </div>

        <div className="batch-actions">
          <button className="btn-batch-apply" onClick={onApply}>Apply Updates</button>
          <button className="btn-batch-clear" onClick={onClear}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default BatchUpdateBar;