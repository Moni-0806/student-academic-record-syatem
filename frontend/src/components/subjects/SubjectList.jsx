import React, { useEffect, useState } from 'react';
import { getSubjects, deleteSubject } from '../../services/subjectService';
import LoadingSpinner from '../common/LoadingSpinner';
import SubjectForm from './SubjectForm';

const SubjectList = () => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState(null);

    useEffect(() => {
        loadSubjects();
    }, []);

    const loadSubjects = async () => {
        try {
            const response = await getSubjects();
            setSubjects(response.data || []);
        } catch (error) {
            console.error('Error loading subjects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (subjectId) => {
        if (window.confirm('Are you sure you want to delete this subject?')) {
            try {
                await deleteSubject(subjectId);
                loadSubjects();
            } catch (err) {
                alert('Error deleting subject: ' + err.message);
            }
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="subject-list">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <button onClick={() => {
                    setSelectedSubject(null);
                    setShowForm(true);
                }} className="btn-primary">
                    ➕ Add Subject
                </button>
            </div>

            {showForm && (
                <SubjectForm
                    subject={selectedSubject}
                    onClose={() => {
                        setShowForm(false);
                        setSelectedSubject(null);
                    }}
                    onSuccess={loadSubjects}
                />
            )}

            <table className="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Subject Name</th>
                        <th>Department</th>
                        <th>Max Marks</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {subjects.length === 0 ? (
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                                No subjects found. Click "Add Subject" to create one.
                            </td>
                        </tr>
                    ) : (
                        subjects.map(subject => (
                            <tr key={subject.subject_id}>
                                <td>{subject.subject_id}</td>
                                <td>{subject.subject_name}</td>
                                <td>{subject.department_name || 'N/A'}</td>
                                <td>{subject.max_mark}</td>
                                <td>
                                    <button
                                        onClick={() => {
                                            setSelectedSubject(subject);
                                            setShowForm(true);
                                        }}
                                        className="btn-edit"
                                        style={{ marginRight: '0.5rem' }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(subject.subject_id)}
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

export default SubjectList;
