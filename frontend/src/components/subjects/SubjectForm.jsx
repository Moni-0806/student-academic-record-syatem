import React, { useState, useEffect } from 'react';
import { createSubject, updateSubject } from '../../services/subjectService';
import { getDepartments } from '../../services/departmentService';

const SubjectForm = ({ subject, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        subject_name: '',
        department_id: '',
        max_marks: 100
    });
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadDepartments();
        if (subject) {
            setFormData({
                subject_name: subject.subject_name || '',
                department_id: subject.department_id || '',
                max_marks: subject.max_marks || 100
            });
        }
    }, [subject]);

    const loadDepartments = async () => {
        try {
            const response = await getDepartments();
            setDepartments(response.data || []);
        } catch (err) {
            console.error('Error loading departments:', err);
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
                department_id: parseInt(formData.department_id),
                max_marks: parseInt(formData.max_marks)
            };

            if (subject) {
                await updateSubject(subject.subject_id, dataToSubmit);
            } else {
                await createSubject(dataToSubmit);
            }
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Error saving subject');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{subject ? '✏️ Edit Subject' : '➕ Add New Subject'}</h3>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label>Subject Name <span className="required">*</span></label>
                        <input
                            type="text"
                            name="subject_name"
                            placeholder="e.g., Mathematics, English, Biology"
                            value={formData.subject_name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Department <span className="required">*</span></label>
                        <select
                            name="department_id"
                            value={formData.department_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Department</option>
                            {departments.map(dept => (
                                <option key={dept.department_id} value={dept.department_id}>
                                    {dept.department_name}
                                </option>
                            ))}
                        </select>
                        <small className="form-hint">Subjects belong to departments</small>
                    </div>

                    <div className="form-group">
                        <label>Maximum Marks <span className="required">*</span></label>
                        <input
                            type="number"
                            name="max_marks"
                            placeholder="100"
                            value={formData.max_marks}
                            onChange={handleChange}
                            min="1"
                            max="1000"
                            required
                        />
                        <small className="form-hint">Default is 100 marks per subject</small>
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
                            {loading ? 'Saving...' : (subject ? 'Update Subject' : 'Add Subject')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SubjectForm;
