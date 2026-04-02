import React, { useState, useEffect } from 'react';
import { createStudent, updateStudent } from '../../services/studentService';
import { getClasses } from '../../services/classService';

const StudentForm = ({ student, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        student_name: '',
        gender: 'M',
        date_of_birth: '',
        student_code: '',
        class_id: '',
        academic_year: new Date().getFullYear().toString(),
        semester: '1'
    });

    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadClasses();
        if (student) {
            setFormData({
                student_name: student.student_name || '',
                gender: student.gender || 'M',
                date_of_birth: student.date_of_birth || '',
                student_code: student.student_code || '',
                class_id: student.class_id || '',
                academic_year: student.academic_year || new Date().getFullYear().toString(),
                semester: student.semester?.toString() || '1'
            });
        }
    }, [student]);

    const loadClasses = async () => {
        try {
            const response = await getClasses();
            setClasses(response.data || []);
        } catch (err) {
            console.error('Error loading classes:', err);
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
            // Convert semester to integer
            const dataToSubmit = {
                ...formData,
                semester: parseInt(formData.semester),
                class_id: parseInt(formData.class_id)
            };

            if (student) {
                await updateStudent(student.student_id, dataToSubmit);
            } else {
                await createStudent(dataToSubmit);
            }

            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Error saving student');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{student ? '✏️ Edit Student' : '➕ Add New Student'}</h3>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="student-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-row">
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label>Student Name <span className="required">*</span></label>
                            <input
                                type="text"
                                name="student_name"
                                placeholder="Enter full name (e.g., John Doe)"
                                value={formData.student_name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Gender <span className="required">*</span></label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                required
                            >
                                <option value="M">Male</option>
                                <option value="F">Female</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Date of Birth</label>
                            <input
                                type="date"
                                name="date_of_birth"
                                value={formData.date_of_birth}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Student Code <span className="required">*</span></label>
                            <input
                                type="text"
                                name="student_code"
                                placeholder="e.g., MIN001/24"
                                value={formData.student_code}
                                onChange={handleChange}
                                required
                            />
                            <small className="form-hint">Format: MIN###/YY</small>
                        </div>

                        <div className="form-group">
                            <label>Class <span className="required">*</span></label>
                            <select
                                name="class_id"
                                value={formData.class_id}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select a class</option>
                                {classes.map(cls => (
                                    <option key={cls.class_id} value={cls.class_id}>
                                        {cls.class_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Academic Year <span className="required">*</span></label>
                            <input
                                type="text"
                                name="academic_year"
                                placeholder="e.g., 2024"
                                value={formData.academic_year}
                                onChange={handleChange}
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
                            {loading ? 'Saving...' : (student ? 'Update Student' : 'Add Student')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudentForm;
