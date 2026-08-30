import React from 'react';
import { Link } from 'react-router-dom';
import './PublicNavbar.css';

const PublicNavbar = () => {
  return (
    <nav className="public-nav">
      <div className="nav-brand">
        <Link to="/">TaskFlow</Link>
      </div>
      <div className="nav-links">
        <Link to="/auth" className="nav-btn-primary">Sign In</Link>
      </div>
    </nav>
  );
};

export default PublicNavbar;