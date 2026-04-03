import React, { useEffect, useState } from 'react';
import { getTeachers, deleteTeacher, getTeacherAssignments, getHomeroomList, createAssignment, deleteAssignment, createHomeroomAssignment, deleteHomeroomAssignment } from '../../services/teacherService';
import { getClasses } from '../../services/classService';
import { getSubjects } from '../../services/subjectService';
import LoadingSpinner from '../common/LoadingSpinner';
import TeacherForm from './TeacherForm';

const currentYear = new Date().getFullYear();
const defaultYear = `${currentYear}/${currentYear + 1}`;

const TeacherList = ({ section = 'list' }) => {
    const [teachers, setTeachers] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [homeroomList, setHomeroomList] = useState([]);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showTeacherForm, setShowTeacherForm] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);

    const [showAssignForm, setShowAssignForm] = useState(false);
    const [assignData, setAssignData] = useState({ teacher_id: '', subject_id: '', class_id: '', academic_year: defaultYear, semester: '1' });
    const [assignError, setAssignError] = useState('');

    const [showHomeroomForm, setShowHomeroomForm] = useState(false);
    const [homeroomData, setHomeroomData] = useState({ teacher_id: '', class_id: '', academic_year: defaultYear, semester: '1' });
    const [homeroomError, setHomeroomError] = useState('');

    useEffect(() => { loadAll(); }, []);

    const loadAll = async () => {
        try {
            const [tRes, aRes, hRes, cRes, sRes] = await Promise.all([
                getTeachers(), getTeacherAssignments(), getHomeroomList(), getClasses(), getSubjects()
            ]);
            setTeachers(tRes.data || []);
            setAssignments(aRes.data || []);
            setHomeroomList(hRes.data || []);
            setClasses(cRes.data || []);
            setSubjects(sRes.data || []);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTeacher = async (id) => {
        if (window.confirm('Delete this teacher?')) {
            try { await deleteTeacher(id); loadAll(); }
            catch (err) { alert('Error: ' + err.message); }
        }
    };

    const handleAssignSubmit = async (e) => {
        e.preventDefault();
        setAssignError('');
        try {
            await createAssignment({
                teacher_id: parseInt(assignData.teacher_id),
                subject_id: parseInt(assignData.subject_id),
                class_id: parseInt(assignData.class_id),
                academic_year: assignData.academic_year,
                semester: parseInt(assignData.semester)
            });
            setShowAssignForm(false);
            setAssignData({ teacher_id: '', subject_id: '', class_id: '', academic_year: defaultYear, semester: '1' });
            loadAll();
        } catch (err) {
            setAssignError(err.response?.data?.message || err.message);
        }
    };

    const handleHomeroomSubmit = async (e) => {
        e.preventDefault();
        setHomeroomError('');
        try {
            await createHomeroomAssignment({
                teacher_id: parseInt(homeroomData.teacher_id),
                class_id: parseInt(homeroomData.class_id),
                academic_year: homeroomData.academic_year,
                semester: parseInt(homeroomData.semester)
            });
            setShowHomeroomForm(false);
            setHomeroomData({ teacher_id: '', class_id: '', academic_year: defaultYear, semester: '1' });
            loadAll();
        } catch (err) {
            setHomeroomError(err.response?.data?.message || err.message);
        }
    };

    if (loading) return <LoadingSpinner />;

    // ===== SECTION: TEACHER LIST =====
    if (section === 'list') return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, color: '#1e293b' }}>👨‍🏫 Teachers</h3>
                <button onClick={() => { setSelectedTeacher(null); setShowTeacherForm(true); }} className="btn-primary">
                    ➕ Add Teacher
                </button>
            </div>
            {showTeacherForm && (
                <TeacherForm
                    teacher={selectedTeacher}
                    onClose={() => { setShowTeacherForm(false); setSelectedTeacher(null); }}
                    onSuccess={loadAll}
                />
            )}
            <table className="data-table">
                <thead>
                    <tr><th>ID</th><th>Name</th><th>Email</th><th>Department</th><th>Subject</th><th>Actions</th></tr>
                </thead>
                <tbody>
                    {teachers.length === 0 ? (
                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No teachers found.</td></tr>
                    ) : teachers.map(t => (
                        <tr key={t.teacher_id}>
                            <td>{t.teacher_id}</td>
                            <td>{t.teacher_name || 'N/A'}</td>
                            <td>{t.email || 'N/A'}</td>
                            <td>{t.department_name || 'N/A'}</td>
                            <td>{t.subject_name || 'N/A'}</td>
                            <td>
                                <button onClick={() => { setSelectedTeacher(t); setShowTeacherForm(true); }} className="btn-edit" style={{ marginRight: '0.5rem' }}>Edit</button>
                                <button onClick={() => handleDeleteTeacher(t.teacher_id)} className="btn-delete">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    // ===== SECTION: ASSIGN TEACHER =====
    if (section === 'assign') return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, color: '#1e293b' }}>📚 Assign Teacher</h3>
                <button onClick={() => setShowAssignForm(true)} className="btn-primary">➕ Assign Teacher</button>
            </div>

            {showAssignForm && (
                <div className="modal-overlay" onClick={() => setShowAssignForm(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>📚 Assign Teacher to Class</h3>
                            <button className="modal-close" onClick={() => setShowAssignForm(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleAssignSubmit} style={{ padding: '2rem' }}>
                            {assignError && <div className="error-message">{assignError}</div>}
                            <div className="form-group">
                                <label>Teacher <span className="required">*</span></label>
                                <select value={assignData.teacher_id} onChange={(e) => {
                                    const tid = e.target.value;
                                    const t = teachers.find(t => t.teacher_id == tid);
                                    setAssignData({ ...assignData, teacher_id: tid, subject_id: t?.subject_id || '' });
                                }} required>
                                    <option value="">Select Teacher</option>
                                    {teachers.map(t => <option key={t.teacher_id} value={t.teacher_id}>{t.teacher_name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Subject</label>
                                <input type="text" readOnly
                                    value={subjects.find(s => s.subject_id == assignData.subject_id)?.subject_name || '— auto-filled when teacher selected —'}
                                    style={{ background: '#f1f5f9', color: '#475569', cursor: 'not-allowed' }}
                                />
                            </div>
                            <div className="form-group">
                                <label>Class <span className="required">*</span></label>
                                <select value={assignData.class_id} onChange={(e) => setAssignData({ ...assignData, class_id: e.target.value })} required>
                                    <option value="">Select Class</option>
                                    {classes.map(c => <option key={c.class_id} value={c.class_id}>{c.class_name} - {c.grade_level}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Academic Year <span className="required">*</span></label>
                                <input type="text" placeholder="e.g., 2025/2026" value={assignData.academic_year} onChange={(e) => setAssignData({ ...assignData, academic_year: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Semester <span className="required">*</span></label>
                                <select value={assignData.semester} onChange={(e) => setAssignData({ ...assignData, semester: e.target.value })} required>
                                    <option value="1">Semester 1</option>
                                    <option value="2">Semester 2</option>
                                </select>
                            </div>
                            <div className="form-actions">
                                <button type="button" onClick={() => setShowAssignForm(false)} className="btn-secondary">Cancel</button>
                                <button type="submit" className="btn-primary">Assign</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <table className="data-table">
                <thead>
                    <tr><th>#</th><th>Teacher</th><th>Subject</th><th>Class</th><th>Grade</th><th>Academic Year</th><th>Semester</th><th>Actions</th></tr>
                </thead>
                <tbody>
                    {assignments.length === 0 ? (
                        <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>No assignments found.</td></tr>
                    ) : assignments.map((a, i) => (
                        <tr key={a.assignment_id}>
                            <td>{i + 1}</td>
                            <td>{a.teacher_name}</td>
                            <td>{a.subject_name}</td>
                            <td>{a.class_name}</td>
                            <td>{a.grade_level}</td>
                            <td>{a.academic_year}</td>
                            <td>Semester {a.semester}</td>
                            <td>
                                <button onClick={async () => { await deleteAssignment(a.assignment_id); loadAll(); }} className="btn-delete">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    // ===== SECTION: HOMEROOM TEACHER =====
    if (section === 'homeroom') return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, color: '#1e293b' }}>🏠 Assign Homeroom Teacher</h3>
                <button onClick={() => setShowHomeroomForm(true)} className="btn-primary">➕ Assign Homeroom Teacher</button>
            </div>

            {showHomeroomForm && (
                <div className="modal-overlay" onClick={() => setShowHomeroomForm(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>🏠 Assign Homeroom Teacher</h3>
                            <button className="modal-close" onClick={() => setShowHomeroomForm(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleHomeroomSubmit} style={{ padding: '2rem' }}>
                            {homeroomError && <div className="error-message">{homeroomError}</div>}
                            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>
                                Only one homeroom teacher per class per semester.
                            </p>
                            <div className="form-group">
                                <label>Teacher <span className="required">*</span></label>
                                <select value={homeroomData.teacher_id} onChange={(e) => setHomeroomData({ ...homeroomData, teacher_id: e.target.value })} required>
                                    <option value="">Select Teacher</option>
                                    {teachers
                                        .filter(t => !homeroomList.some(h => h.teacher_id === t.teacher_id))
                                        .map(t => <option key={t.teacher_id} value={t.teacher_id}>{t.teacher_name}</option>)
                                    }
                                </select>
                                {teachers.filter(t => !homeroomList.some(h => h.teacher_id === t.teacher_id)).length === 0 && (
                                    <small style={{ color: '#e74c3c' }}>All teachers are already assigned as homeroom teachers.</small>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Class <span className="required">*</span></label>
                                <select value={homeroomData.class_id} onChange={(e) => setHomeroomData({ ...homeroomData, class_id: e.target.value })} required>
                                    <option value="">Select Class</option>
                                    {classes.map(c => <option key={c.class_id} value={c.class_id}>{c.class_name} - {c.grade_level}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Semester <span className="required">*</span></label>
                                <select value={homeroomData.semester} onChange={(e) => setHomeroomData({ ...homeroomData, semester: e.target.value })} required>
                                    <option value="1">Semester 1</option>
                                    <option value="2">Semester 2</option>
                                </select>
                            </div>
                            <div className="form-actions">
                                <button type="button" onClick={() => setShowHomeroomForm(false)} className="btn-secondary">Cancel</button>
                                <button type="submit" className="btn-primary">Assign</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <table className="data-table">
                <thead>
                    <tr><th>#</th><th>Teacher</th><th>Class</th><th>Grade</th><th>Academic Year</th><th>Semester</th><th>Actions</th></tr>
                </thead>
                <tbody>
                    {homeroomList.length === 0 ? (
                        <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No homeroom assignments found.</td></tr>
                    ) : homeroomList.map((h, i) => (
                        <tr key={h.assignment_id}>
                            <td>{i + 1}</td>
                            <td>{h.teacher_name}</td>
                            <td>{h.class_name}</td>
                            <td>{h.grade_level}</td>
                            <td>{h.academic_year}</td>
                            <td>Semester {h.semester}</td>
                            <td>
                                <button onClick={async () => { await deleteHomeroomAssignment(h.assignment_id); loadAll(); }} className="btn-delete">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return null;
};

export default TeacherList;
