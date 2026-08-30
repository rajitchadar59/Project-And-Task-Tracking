import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../axiosPatch'; // Corrected path

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const [role, setRole] = useState(localStorage.getItem("role") || null);
    const [userId, setUserId] = useState(localStorage.getItem("userId") || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(false);
    }, []);

    const login = (newToken, newRole, newUserId) => {
        localStorage.setItem("token", newToken);
        localStorage.setItem("role", newRole);
        localStorage.setItem("userId", newUserId);
        
        setToken(newToken);
        setRole(newRole);
        setUserId(newUserId);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");
        
        setToken(null);
        setRole(null);
        setUserId(null);
    };

    return (
        <AuthContext.Provider value={{ token, role, userId, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);