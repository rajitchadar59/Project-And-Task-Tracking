import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Manage your portfolio seamlessly</h1>
        <p>Track tasks, monitor dependencies, and keep your projects moving forward with full visibility.</p>
        <Link to="/auth" className="home-btn-primary">Get Started</Link>
      </div>
    </div>
  );
};

export default Home;