import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../axiosPatch'; 
import './PrivateNavbar.css';

const PrivateNavbar = () => {
  const { logout, role, userId } = useAuth(); 
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const location = useLocation();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchOverdueAlerts = async () => {
      try {
        const { data } = await axios.get('/tasks/global?isOverdue=true');
        
        let activeAlerts = [];
        if (userId) {
          // FIXED: Bulletproof string matching for IDs
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

  // Close dropdown if clicked outside
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
      <div className="nav-brand">
        <Link to="/dashboard">TaskFlow</Link>
      </div>
      <div className="nav-menu" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold', color: '#333', position: 'relative', padding: 0 }}
          >
            Alerts
            {overdueTasks.length > 0 && (
              <span style={{
                position: 'absolute', top: '-10px', right: '-15px',
                background: '#FF385C', color: 'white', borderRadius: '50%',
                padding: '2px 6px', fontSize: '0.75rem', fontWeight: 'bold'
              }}>
                {overdueTasks.length}
              </span>
            )}
          </button>

          {showDropdown && (
            <div style={{
              position: 'absolute', top: '35px', right: '-20px', width: '260px',
              background: 'white', border: '1px solid #ddd', borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1000, padding: '15px',
              textAlign: 'left'
            }}>
              <h4 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Active Alerts</h4>
              
              {overdueTasks.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>You have no pending alerts.</p>
              ) : (
                <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                  {overdueTasks.map(task => (
                    <div key={task._id} style={{ padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
                      <Link 
                        to={`/project/${task.project._id || task.project}`} 
                        onClick={() => setShowDropdown(false)}
                        style={{ textDecoration: 'none', color: '#007bff', fontWeight: 'bold', fontSize: '0.9rem', display: 'block' }}
                      >
                        {task.title}
                      </Link>
                      <span style={{ fontSize: '0.75rem', color: '#FF385C' }}>
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <span className="role-badge">{role}</span>
        <button onClick={logout} className="nav-btn-outline">Log Out</button>
      </div>
    </nav>
  );
};

export default PrivateNavbar;