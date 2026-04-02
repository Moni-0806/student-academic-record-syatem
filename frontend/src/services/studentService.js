import api from './api';

export const getStudents = async (params) => {
    const response = await api.get('/students', { params });
    return response.data;
};

export const getStudentById = async (id) => {
    const response = await api.get(`/students/${id}`);
    return response.data;
};

export const createStudent = async (data) => {
    const response = await api.post('/students', data);
    return response.data;
};

export const updateStudent = async (id, data) => {
    const response = await api.put(`/students/${id}`, data);
    return response.data;
};

export const deleteStudent = async (id) => {
    const response = await api.delete(`/students/${id}`);
    return response.data;
};

export const getStudentsByClass = async (classId) => {
    const response = await api.get(`/students/class/${classId}`);
    return response.data;
};
