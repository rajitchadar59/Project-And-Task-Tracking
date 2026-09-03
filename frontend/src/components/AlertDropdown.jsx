import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from '../axiosPatch';
import { useAuth } from '../context/AuthContext';
import './AlertDropdown.css';

const AlertDropdown = () => {
  const { userId } = useAuth();
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const fetchOverdueAlerts = async () => {
      try {
        const { data } = await axios.get('/tasks/global?isOverdue=true');
        // FIXED: Extract 'tasks' array from the paginated backend response
        const tasksArray = data.tasks || data || []; 

        let activeAlerts = [];
        if (userId) {
          activeAlerts = tasksArray.filter(t => {
            if (!t.dismissedBy) return true;
            return !t.dismissedBy.some(id => String(id) === String(userId));
          });
        } else {
          activeAlerts = tasksArray.filter(t => !t.dismissedBy || t.dismissedBy.length === 0);
        }
        setOverdueTasks(activeAlerts);
      } catch (err) {
        console.error('Error fetching overdue alerts:', err);
      }
    };

    fetchOverdueAlerts();
    window.addEventListener('alertsUpdated', fetchOverdueAlerts);
    return () => window.removeEventListener('alertsUpdated', fetchOverdueAlerts);
  }, [location.pathname, userId]); 

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="alert-dropdown-container">
      <button onClick={() => setShowDropdown(!showDropdown)} className="alert-btn" aria-label="Alerts">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        {overdueTasks.length > 0 && (
          <span className="alert-badge">{overdueTasks.length}</span>
        )}
      </button>

      {showDropdown && (
        <div className="alert-dropdown-menu">
          <div className="alert-dropdown-header">
            <h4>Active Alerts</h4>
          </div>
          {overdueTasks.length === 0 ? (
            <p className="alert-empty">You have no pending alerts.</p>
          ) : (
            <div className="alert-list">
              {overdueTasks.map(task => (
                <div key={task._id} className="alert-item">
                  <Link 
                    to={`/projects/${task.project._id || task.project}`} 
                    onClick={() => setShowDropdown(false)}
                    className="alert-item-title"
                  >
                    {task.title}
                  </Link>
                  <span className="alert-item-date">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AlertDropdown;