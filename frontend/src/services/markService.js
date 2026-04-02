import api from './api';

// params: { class_id, academic_year, semester, bypass_gate (for teachers) }
export const getMarks = async (params) => {
    const endpoint = params.bypass_gate ? '/marks/class/teacher' : '/marks/class';
    const response = await api.get(endpoint, {
        params: {
            classId: params.class_id,
            academicYear: params.academic_year,
            semester: params.semester
        }
    });
    return response.data;
};

export const getMarkById = async (id) => {
    const response = await api.get(`/marks/${id}`);
    return response.data;
};

export const createMark = async (data) => {
    const response = await api.post('/marks', data);
    return response.data;
};

export const updateMark = async (id, data) => {
    const response = await api.put(`/marks/${id}`, data);
    return response.data;
};

export const deleteMark = async (id) => {
    const response = await api.delete(`/marks/${id}`);
    return response.data;
};

export const getStudentMarks = async (studentId, params) => {
    const response = await api.get(`/marks/student/${studentId}`, { params });
    return response.data;
};

export const getClassSubjects = async (classId, academicYear, semester) => {
    const response = await api.get('/marks/class-subjects', {
        params: { classId, academicYear, semester }
    });
    return response.data;
};

export const getFinalizationStatus = async (params) => {
    const response = await api.get('/marks/finalization-status', { params });
    return response.data;
};

export const finalizeMarks = async (data) => {
    const response = await api.post('/marks/finalize', data);
    return response.data;
};
