import React, { useEffect, useState } from 'react';
import { getClasses, createClass, updateClass, deleteClass } from '../../services/classService';
import LoadingSpinner from '../common/LoadingSpinner';

const ClassList = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const [formData, setFormData] = useState({
        class_name: '',
        grade_level: '',
        academic_year: new Date().getFullYear().toString(),
        semester: '1'
    });
    const [error, setError] = useState('');

    useEffect(() => {
        loadClasses();
    }, []);

    const loadClasses = async () => {
        try {
            setLoading(true);
            const response = await getClasses();
            setClasses(response.data || []);
        } catch (error) {
            console.error('Error loading classes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingClass(null);
        setFormData({
            class_name: '',
            grade_level: '',
            academic_year: new Date().getFullYear().toString(),
            semester: '1'
        });
        setError('');
        setShowForm(true);
    };

    const handleEdit = (cls) => {
        setEditingClass(cls);
        setFormData({
            class_name: cls.class_name,
            grade_level: cls.grade_level,
            academic_year: cls.academic_year,
            semester: cls.semester || '1'
        });
        setError('');
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editingClass) {
                await updateClass(editingClass.class_id, formData);
            } else {
                await createClass(formData);
            }
            setShowForm(false);
            await loadClasses();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Error saving class');
        }
    };

    const handleDelete = async (classId) => {
        if (window.confirm('Are you sure you want to delete this class?')) {
            try {
                await deleteClass(classId);
                loadClasses();
            } catch (err) {
                alert('Error deleting class: ' + err.message);
            }
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="page-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Classes Management</h2>
                <button onClick={handleAdd} className="btn-primary">
                    ➕ Add Class
                </button>
            </div>

            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingClass ? '✏️ Edit Class' : '➕ Add New Class'}</h3>
                            <button className="modal-close" onClick={() => setShowForm(false)}>&times;</button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
                            {error && <div className="error-message">{error}</div>}

                            <div className="form-group">
                                <label>Grade Level <span className="required">*</span></label>
                                <input
                                    type="text"
                                    name="grade_level"
                                    placeholder="e.g., 10"
                                    value={formData.grade_level}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Class Name <span className="required">*</span></label>
                                <input
                                    type="text"
                                    name="class_name"
                                    placeholder="e.g., Grade 10A"
                                    value={formData.class_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

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

                            <div className="form-actions">
                                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editingClass ? 'Update Class' : 'Add Class'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <table className="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Class Name</th>
                        <th>Grade Level</th>
                        <th>Academic Year</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {classes.length === 0 ? (
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                                No classes found. Click "Add Class" to create one.
                            </td>
                        </tr>
                    ) : (
                        classes.map(cls => (
                            <tr key={cls.class_id}>
                                <td>{cls.class_id}</td>
                                <td>{cls.class_name}</td>
                                <td>{cls.grade_level}</td>
                                <td>{cls.academic_year}</td>
                                <td>
                                    <button
                                        onClick={() => handleEdit(cls)}
                                        className="btn-edit"
                                        style={{ marginRight: '0.5rem' }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cls.class_id)}
                                        className="btn-delete"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ClassList;
