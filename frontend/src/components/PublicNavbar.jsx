import { useState } from 'react';
import { Link } from 'react-router-dom';
import './PublicNavbar.css';

const PublicNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="public-nav">
      <div className="nav-inner">
        <Link to="/" className="nav-brand" onClick={() => setMenuOpen(false)}>
          <span className="nav-logo-mark">PTT</span>
          Project Task Tracker
        </Link>

        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a>
          <Link to="/auth" className="nav-link-signin" onClick={() => setMenuOpen(false)}>
            Sign In
          </Link>
          <Link
            to="/auth?mode=signup"
            className="nav-btn-primary"
            onClick={() => setMenuOpen(false)}
          >
            Get started
          </Link>
        </div>

        <button
          type="button"
          className={`nav-toggle ${menuOpen ? 'open' : ''}`}
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

export default PublicNavbar;