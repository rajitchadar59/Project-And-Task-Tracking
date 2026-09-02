import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../axiosPatch'; 
import './PrivateNavbar.css';

const PrivateNavbar = () => {
  const { logout, role, userId } = useAuth(); 
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); 
  
  const location = useLocation();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchOverdueAlerts = async () => {
      try {
        const { data } = await axios.get('/tasks/global?isOverdue=true');
        let activeAlerts = [];
        if (userId) {
          activeAlerts = data.filter(t => {
            if (!t.dismissedBy) return true;
            return !t.dismissedBy.some(id => String(id) === String(userId));
          });
        } else {
          activeAlerts = data.filter(t => !t.dismissedBy || t.dismissedBy.length === 0);
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
    <nav className="private-nav">
      <div className="private-nav-inner">
        
        <Link to="/dashboard" className="private-nav-brand" onClick={() => setMenuOpen(false)}>
          <span className="private-nav-logo-mark">PTT</span>
          Project Task Tracker
        </Link>

        <div className={`private-nav-links ${menuOpen ? 'private-open' : ''}`}>
          <Link to="/dashboard" onClick={() => setMenuOpen(false)} className={location.pathname === '/dashboard' ? 'private-active' : ''}>Dashboard</Link>
          <Link to="/tasks/global" onClick={() => setMenuOpen(false)} className={location.pathname.includes('/tasks/global') ? 'private-active' : ''}>Search Tasks</Link>
          {role === 'Manager' && (
            <Link to="/projects/archived" onClick={() => setMenuOpen(false)} className={location.pathname.includes('archived') ? 'private-active' : ''}>Archived Projects</Link>
          )}

          <div className="private-mobile-actions">
            <span className="private-role-badge-mobile">{role}</span>
            <button onClick={logout} className="private-nav-btn-logout">Log Out</button>
          </div>
        </div>

        <div className="private-nav-actions-desktop">
          <div ref={dropdownRef} className="private-alert-dropdown-container">
            <button onClick={() => setShowDropdown(!showDropdown)} className="private-alert-btn" aria-label="Alerts">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              {overdueTasks.length > 0 && (
                <span className="private-alert-badge">{overdueTasks.length}</span>
              )}
            </button>

            {showDropdown && (
              <div className="private-alert-dropdown-menu">
                <div className="private-alert-dropdown-header">
                  <h4>Active Alerts</h4>
                </div>
                {overdueTasks.length === 0 ? (
                  <p className="private-alert-empty">You have no pending alerts.</p>
                ) : (
                  <div className="private-alert-list">
                    {overdueTasks.map(task => (
                      <div key={task._id} className="private-alert-item">
                        <Link 
                          to={`/project/${task.project._id || task.project}`} 
                          onClick={() => setShowDropdown(false)}
                          className="private-alert-item-title"
                        >
                          {task.title}
                        </Link>
                        <span className="private-alert-item-date">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <span className="private-role-badge-desktop">{role}</span>
          <button onClick={logout} className="private-nav-btn-logout">Log out</button>
        </div>

        <button
          type="button"
          className={`private-nav-toggle ${menuOpen ? 'private-open' : ''}`}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

      </div>
    </nav>
  );
};

export default PrivateNavbar;