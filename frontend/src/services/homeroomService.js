import api from './api';

export const getHomeroomAssignments = async () => {
    const response = await api.get('/homeroom');
    return response.data;
};

export const getHomeroomByClass = async (classId, academicYear, semester) => {
    const response = await api.get('/homeroom/class', {
        params: { classId, academicYear, semester }
    });
    return response.data;
};

export const assignHomeroom = async (data) => {
    const response = await api.post('/homeroom', data);
    return response.data;
};

export const deleteHomeroomAssignment = async (id) => {
    const response = await api.delete(`/homeroom/${id}`);
    return response.data;
};
