import api from './api';

export const getTeachers = async (params) => {
    const response = await api.get('/teachers', { params });
    return response.data;
};

export const getTeacherById = async (id) => {
    const response = await api.get(`/teachers/${id}`);
    return response.data;
};

export const createTeacher = async (data) => {
    const response = await api.post('/teachers', data);
    return response.data;
};

export const updateTeacher = async (id, data) => {
    const response = await api.put(`/teachers/${id}`, data);
    return response.data;
};

export const deleteTeacher = async (id) => {
    const response = await api.delete(`/teachers/${id}`);
    return response.data;
};

export const getMyAssignment = async () => {
    const response = await api.get('/teachers/my-assignment');
    return response.data;
};

export const getMyHomeroomMarks = async () => {
    const response = await api.get('/teachers/my-homeroom-marks');
    return response.data;
};

export const submitToAdmin = async (data) => {
    const response = await api.post('/teachers/submit-to-admin', data);
    return response.data;
};

export const getSubmissionStatus = async (params) => {
    const response = await api.get('/teachers/submission-status', { params });
    return response.data;
};

export const getLatestSubmission = async (classId) => {
    const response = await api.get('/teachers/latest-submission', { params: { class_id: classId } });
    return response.data;
};

export const getHomeroomTeachers = async () => {
    const response = await api.get('/teachers/homeroom');
    return response.data;
};

export const getTeacherAssignments = async () => {
    const response = await api.get('/teachers/assignments');
    return response.data;
};

export const getHomeroomList = async () => {
    const response = await api.get('/teachers/homeroom-list');
    return response.data;
};

export const createAssignment = async (data) => {
    const response = await api.post('/teachers/assignments', data);
    return response.data;
};

export const deleteAssignment = async (id) => {
    const response = await api.delete(`/teachers/assignments/${id}`);
    return response.data;
};

export const createHomeroomAssignment = async (data) => {
    const response = await api.post('/teachers/homeroom-list', data);
    return response.data;
};

export const deleteHomeroomAssignment = async (id) => {
    const response = await api.delete(`/teachers/homeroom-list/${id}`);
    return response.data;
};
