import React, { createContext, useState, useEffect } from 'react';
import { login as loginService, logout as logoutService, getCurrentUser } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const userData = await getCurrentUser();
                setUser(userData.data);
            }
        } catch (error) {
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        setLoading(true);
        try {
            const data = await loginService(credentials);
            setUser(data.user);
            localStorage.setItem('token', data.token);
            setLoading(false);
            return data;
        } catch (error) {
            setLoading(false);
            throw error;
        }
    };

    const logout = () => {
        logoutService();
        setUser(null);
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
