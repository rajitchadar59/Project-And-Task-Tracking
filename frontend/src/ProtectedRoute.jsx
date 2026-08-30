import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext'; // Adjust this path if your Context is elsewhere

const ProtectedRoute = ({ children, allowedRoles, redirectPath = "/auth" }) => {
    const { token, role, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
                <p>Loading...</p>
            </div>
        );
    }
  
    if (!token) {
        return <Navigate to={redirectPath} state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to="/" replace />; 
    }
 
    return children;
};

export default ProtectedRoute;