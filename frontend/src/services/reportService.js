import api from './api';

export const getClassReport = async (classId, academicYear, semester) => {
    const response = await api.get('/reports/class', {
        params: { classId, academicYear, semester }
    });
    return response.data;
};

export const getStudentReport = async (studentId, academicYear, semester) => {
    const response = await api.get('/reports/student', {
        params: { studentId, academicYear, semester }
    });
    return response.data;
};

export const exportReport = async (type, params) => {
    const response = await api.get(`/reports/export/${type}`, {
        params,
        responseType: 'blob'
    });
    return response.data;
};
