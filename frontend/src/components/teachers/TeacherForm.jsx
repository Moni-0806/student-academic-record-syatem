import React, { useState, useEffect } from 'react';
import { createTeacher, updateTeacher } from '../../services/teacherService';
import { getDepartments } from '../../services/departmentService';
import { getSubjects } from '../../services/subjectService';

const TeacherForm = ({ teacher, onClose, onSuccess }) => {
    const currentYear = new Date().getFullYear();
    const defaultAcademicYear = `${currentYear}/${currentYear + 1}`;

    const [formData, setFormData] = useState({
        teacher_name: '',
        email: '',
        phone: '',
        department_id: '',
        subject_id: '',
        username: '',
        password: ''
    });
    const [departments, setDepartments] = useState([]);
    const [allSubjects, setAllSubjects] = useState([]);
    const [filteredSubjects, setFilteredSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadDepartments();
        loadSubjects();
        if (teacher) {
            setFormData({
                teacher_name: teacher.teacher_name || '',
                email: teacher.email || '',
                phone: teacher.phone || '',
                department_id: teacher.department_id || '',
                subject_id: teacher.subject_id || '',
                username: '',
                password: ''
            });
        }
    }, [teacher]);

    // When allSubjects loads and we're editing, filter by existing department
    useEffect(() => {
        if (teacher && teacher.department_id && allSubjects.length) {
            const filtered = allSubjects.filter(s => s.department_id == teacher.department_id);
            setFilteredSubjects(filtered);
        }
    }, [allSubjects, teacher]);

    const loadDepartments = async () => {
        try {
            const response = await getDepartments();
            setDepartments(response.data || []);
        } catch (err) { console.error('Error loading departments:', err); }
    };

    const loadSubjects = async () => {
        try {
            const response = await getSubjects();
            setAllSubjects(response.data || []);
        } catch (err) { console.error('Error loading subjects:', err); }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'department_id') {
            // Filter subjects to only those belonging to selected department
            const filtered = allSubjects.filter(s => s.department_id == value);
            setFilteredSubjects(filtered);
            // Auto-select subject if there's exactly one match
            const autoSubject = filtered.length === 1 ? filtered[0].subject_id : '';
            setFormData(prev => ({ ...prev, department_id: value, subject_id: autoSubject }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const dataToSubmit = {
                teacher_name: formData.teacher_name,
                email: formData.email,
                phone: formData.phone,
                department_id: parseInt(formData.department_id),
                subject_id: parseInt(formData.subject_id)
            };

            if (!teacher) {
                dataToSubmit.username = formData.username;
                dataToSubmit.password = formData.password;
            }

            if (teacher) {
                await updateTeacher(teacher.teacher_id, dataToSubmit);
            } else {
                await createTeacher(dataToSubmit);
            }
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Error saving teacher');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{teacher ? '✏️ Edit Teacher' : '➕ Add New Teacher'}</h3>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label>Teacher Name <span className="required">*</span></label>
                        <input type="text" name="teacher_name" placeholder="Enter full name"
                            value={formData.teacher_name} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label>Email <span className="required">*</span></label>
                        <input type="email" name="email" placeholder="e.g., john.smith@school.com"
                            value={formData.email} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label>Phone</label>
                        <input type="tel" name="phone" placeholder="e.g., +1234567890"
                            value={formData.phone} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>Department <span className="required">*</span></label>
                        <select name="department_id" value={formData.department_id} onChange={handleChange} required>
                            <option value="">Select Department</option>
                            {departments.map(dept => (
                                <option key={dept.department_id} value={dept.department_id}>{dept.department_name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Subject <span className="required">*</span></label>
                        <select name="subject_id" value={formData.subject_id} onChange={handleChange} required>
                            <option value="">Select Subject</option>
                            {filteredSubjects.map(subject => (
                                <option key={subject.subject_id} value={subject.subject_id}>{subject.subject_name}</option>
                            ))}
                        </select>
                        {formData.department_id && filteredSubjects.length === 0 && (
                            <small style={{ color: '#e74c3c' }}>No subjects found for this department.</small>
                        )}
                    </div>

                    {!teacher && (
                        <>
                            <hr style={{ margin: '1rem 0', borderColor: '#e2e8f0' }} />
                            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>🔐 Login Credentials</p>
                            <div className="form-group">
                                <label>Username <span className="required">*</span></label>
                                <input type="text" name="username" placeholder="e.g., jsmith"
                                    value={formData.username} onChange={handleChange} required />
                                <small className="form-hint">For teacher login access</small>
                            </div>
                            <div className="form-group">
                                <label>Password <span className="required">*</span></label>
                                <input type="password" name="password" placeholder="Enter password"
                                    value={formData.password} onChange={handleChange} required minLength="6" />
                                <small className="form-hint">Minimum 6 characters</small>
                            </div>
                        </>
                    )}

                    <div className="form-actions">
                        <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : (teacher ? 'Update Teacher' : 'Add Teacher')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TeacherForm;
