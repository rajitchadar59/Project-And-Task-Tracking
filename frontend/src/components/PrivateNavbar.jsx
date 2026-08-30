import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './PrivateNavbar.css';

const PrivateNavbar = () => {
  const { logout, role } = useAuth();

  return (
    <nav className="private-nav">
      <div className="nav-brand">
        <Link to="/dashboard">TaskFlow</Link>
      </div>
      <div className="nav-menu">
        <span className="role-badge">{role}</span>
        <button onClick={logout} className="nav-btn-outline">Log Out</button>
      </div>
    </nav>
  );
};

export default PrivateNavbar;