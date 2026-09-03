import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AlertDropdown from './AlertDropdown';
import './PrivateNavbar.css';

const PrivateNavbar = () => {
  const { logout, role } = useAuth(); 
  const [menuOpen, setMenuOpen] = useState(false); 
  const location = useLocation();

  return (
    <nav className="private-nav">
      <div className="private-nav-inner">
        
        <Link to="/dashboard" className="private-nav-brand" onClick={() => setMenuOpen(false)}>
          <span className="private-nav-logo-mark">PTT</span>
          Project Task Tracker
        </Link>

        <div className={`private-nav-links ${menuOpen ? 'private-open' : ''}`}>
          <Link to="/dashboard" onClick={() => setMenuOpen(false)} className={location.pathname === '/dashboard' ? 'private-active' : ''}>Dashboard</Link>
          <Link to="/tasks/global" onClick={() => setMenuOpen(false)} className={location.pathname.includes('/tasks/global') ? 'private-active' : ''}>Global Task Search</Link>
          {role === 'Manager' && (
            <Link to="/projects/archived" onClick={() => setMenuOpen(false)} className={location.pathname.includes('archived') ? 'private-active' : ''}>Archived Projects</Link>
          )}

          <div className="private-mobile-actions">
            <span className="private-role-badge-mobile">{role}</span>
            <button onClick={logout} className="private-nav-btn-logout">Log Out</button>
          </div>
        </div>

        <div className="private-nav-actions-desktop">
          <AlertDropdown />
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