import api from './api';

export const getClasses = async (params) => {
    const response = await api.get('/classes', { params });
    return response.data;
};

export const getClassById = async (id) => {
    const response = await api.get(`/classes/${id}`);
    return response.data;
};

export const createClass = async (data) => {
    const response = await api.post('/classes', data);
    return response.data;
};

export const updateClass = async (id, data) => {
    const response = await api.put(`/classes/${id}`, data);
    return response.data;
};

export const deleteClass = async (id) => {
    const response = await api.delete(`/classes/${id}`);
    return response.data;
};
