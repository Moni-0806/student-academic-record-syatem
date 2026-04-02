import React, { useState, useEffect } from 'react';
import { getStudents, deleteStudent } from '../../services/studentService';
import LoadingSpinner from '../common/LoadingSpinner';
import StudentForm from './StudentForm';

const StudentList = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const loadStudents = async () => {
        try {
            setLoading(true);
            const data = await getStudents();
            setStudents(data.data || []);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStudents();
    }, []);

    const handleDelete = async (studentId) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                await deleteStudent(studentId);
                loadStudents();
            } catch (err) {
                alert('Error deleting student: ' + err.message);
            }
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="page-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Students Management</h2>
                <button onClick={() => setShowForm(true)} className="btn-primary">
                    ➕ Add Student
                </button>
            </div>

            {showForm && (
                <StudentForm
                    student={selectedStudent}
                    onClose={() => {
                        setShowForm(false);
                        setSelectedStudent(null);
                    }}
                    onSuccess={loadStudents}
                />
            )}

            <table className="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Gender</th>
                        <th>Class</th>
                        <th>Academic Year</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map(student => (
                        <tr key={student.student_id}>
                            <td>{student.student_id}</td>
                            <td>{student.student_name || 'N/A'}</td>
                            <td>{student.gender}</td>
                            <td>{student.class_name}</td>
                            <td>{student.academic_year}</td>
                            <td>
                                <button
                                    onClick={() => {
                                        setSelectedStudent(student);
                                        setShowForm(true);
                                    }}
                                    className="btn-edit"
                                    style={{ marginRight: '0.5rem' }}
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(student.student_id)}
                                    className="btn-delete"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default StudentList;
