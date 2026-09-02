import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../axiosPatch'; 
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast'; 
import './Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); 
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('mode') === 'signup') {
      setIsLogin(false);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); 
    
    const endpoint = isLogin ? '/auth/login' : '/auth/signup';
    const payload = isLogin 
      ? { email, password } 
      : { name, username, email, password };

    try {
      const { data } = await axios.post(endpoint, payload);
      login(data.token, data.user.role, data.user.id);
      toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Authentication failed');
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        
        <h2>{isLogin ? 'Welcome back' : 'Create your account'}</h2>
        <p className="auth-subtitle">
          {isLogin 
            ? 'Log in to access your portfolio and tasks.' 
            : 'Join TaskFlow and manage projects effortlessly.'}
        </p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <>
              <div className="input-group">
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  disabled={isLoading}
                />
              </div>
              <div className="input-group">
                <input 
                  type="text" 
                  placeholder="Username" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required 
                  disabled={isLoading}
                />
              </div>
            </>
          )}

          <div className="input-group">
            <input 
              type="email" 
              placeholder="Email address" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              disabled={isLoading}
            />
          </div>
          <div className="input-group">
            <input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              disabled={isLoading}
            />
          </div>
          
          <button type="submit" className="auth-submit" disabled={isLoading}>
            {isLoading ? <span className="auth-spinner"></span> : (isLogin ? 'Log in' : 'Sign up')}
          </button>
        </form>

        <p className="auth-toggle">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => {
            if (!isLoading) setIsLogin(!isLogin);
          }}>
            {isLogin ? 'Sign up' : 'Log in'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Auth;