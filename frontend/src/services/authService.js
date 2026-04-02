import api from './api';

export const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('token');
};

export const getCurrentUser = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};

export const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};
