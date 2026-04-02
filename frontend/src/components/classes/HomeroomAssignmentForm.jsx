import React, { useState, useEffect } from 'react';
import { getTeachers } from '../../services/teacherService';
import { assignHomeroom } from '../../services/homeroomService';

const HomeroomAssignmentForm = ({ classData, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        class_id: classData?.class_id || '',
        teacher_id: '',
        academic_year: new Date().getFullYear().toString(),
        semester: '1'
    });
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadTeachers();
    }, []);

    const loadTeachers = async () => {
        try {
            const response = await getTeachers();
            setTeachers(response.data || []);
        } catch (err) {
            console.error('Error loading teachers:', err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const dataToSubmit = {
                ...formData,
                class_id: parseInt(formData.class_id),
                teacher_id: parseInt(formData.teacher_id),
                semester: parseInt(formData.semester)
            };

            await assignHomeroom(dataToSubmit);
            alert('Homeroom teacher assigned successfully!');
            onSuccess();
            onClose();
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Error assigning homeroom teacher';
            setError(errorMsg);
            alert('Error: ' + errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>👨‍🏫 Assign Homeroom Teacher</h3>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label>Class</label>
                        <input
                            type="text"
                            value={classData?.class_name || ''}
                            disabled
                            style={{ background: '#f5f5f5' }}
                        />
                    </div>

                    <div className="form-group">
                        <label>Homeroom Teacher <span className="required">*</span></label>
                        <select
                            name="teacher_id"
                            value={formData.teacher_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Teacher</option>
                            {teachers.map(teacher => (
                                <option key={teacher.teacher_id} value={teacher.teacher_id}>
                                    {teacher.teacher_name} - {teacher.department_name}
                                </option>
                            ))}
                        </select>
                        <small className="form-hint">One homeroom teacher per class per semester</small>
                    </div>

                    <div className="form-group">
                        <label>Academic Year <span className="required">*</span></label>
                        <input
                            type="text"
                            name="academic_year"
                            value={formData.academic_year}
                            onChange={handleChange}
                            placeholder="2026"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Semester <span className="required">*</span></label>
                        <select
                            name="semester"
                            value={formData.semester}
                            onChange={handleChange}
                            required
                        >
                            <option value="1">Semester 1</option>
                            <option value="2">Semester 2</option>
                        </select>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Assigning...' : 'Assign Teacher'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default HomeroomAssignmentForm;
