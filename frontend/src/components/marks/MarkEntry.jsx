import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getStudentsByClass } from '../../services/studentService';
import { getClasses } from '../../services/classService';
import { createMark, getMarks, getFinalizationStatus, finalizeMarks, getClassSubjects } from '../../services/markService';
import { getMyAssignment, getMyHomeroomMarks, submitToAdmin, getSubmissionStatus, getLatestSubmission } from '../../services/teacherService';

const MarkEntry = () => {
    const { user } = useContext(AuthContext);
    const isTeacher = user?.role === 'teacher';
    const navigate = useNavigate();

    // Teacher state
    const [assignments, setAssignments] = useState([]);
    const [assignmentError, setAssignmentError] = useState('');
    const [teacherMarks, setTeacherMarks] = useState({});
    const [homeroomData, setHomeroomData] = useState(null);
    const [homeroomTab, setHomeroomTab] = useState('entry');
    const [submitted, setSubmitted] = useState(false);
    const [resubmitted, setResubmitted] = useState(false);
    const [homeroomEdits, setHomeroomEdits] = useState({});
    const [finalizedClasses, setFinalizedClasses] = useState({}); // { classId_year_sem: true }

    // Admin state
    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());
    const [semester, setSemester] = useState('1');
    const [marks, setMarks] = useState({});
    const [notSubmitted, setNotSubmitted] = useState(false);
    const [finalized, setFinalized] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isTeacher) {
            loadTeacherData();
        } else {
            getClasses().then(r => setClasses(r.data || [])).catch(console.error);
        }
    }, [isTeacher]);

    useEffect(() => {
        if (!isTeacher && selectedClass) loadAdminData(selectedClass, academicYear, semester);
    }, [academicYear, semester]);

    // ---- Teacher flow ----
    const loadTeacherData = async () => {
        try {
            setLoading(true);
            const [assignRes, homeroomRes] = await Promise.all([getMyAssignment(), getMyHomeroomMarks()]);
            const list = assignRes.data;
            setAssignments(list);
            const allMarks = {};
            const finalizedMap = {};
            for (let i = 0; i < list.length; i++) {
                allMarks[i] = await fetchExistingMarks(list[i].class_id, list[i].academic_year, list[i].semester);
                try {
                    const fRes = await getFinalizationStatus({ classId: list[i].class_id, academicYear: list[i].academic_year, semester: list[i].semester });
                    if (fRes.finalized) finalizedMap[`${list[i].class_id}_${list[i].academic_year}_${list[i].semester}`] = true;
                } catch { /* ignore */ }
            }
            setTeacherMarks(allMarks);
            if (homeroomRes.isHomeroom && homeroomRes.data) {
                setHomeroomData(homeroomRes.data);
                const { class_id, academic_year, semester: sem } = homeroomRes.data;
                const statusRes = await getSubmissionStatus({ class_id, academic_year, semester: sem });
                setSubmitted(statusRes.submitted);
                setHomeroomEdits({ ...homeroomRes.data.marksMap });
                try {
                    const fRes = await getFinalizationStatus({ classId: class_id, academicYear: academic_year, semester: sem });
                    if (fRes.finalized) finalizedMap[`${class_id}_${academic_year}_${sem}`] = true;
                } catch { /* ignore */ }
            }
            setFinalizedClasses(finalizedMap);
        } catch (err) {
            setAssignmentError(err.response?.data?.message || 'No assignment found. Please contact admin.');
        } finally { setLoading(false); }
    };

    const fetchExistingMarks = async (classId, year, sem) => {
        try {
            const res = await getMarks({ class_id: classId, academic_year: year, semester: sem, bypass_gate: true });
            const map = {};
            (res.data || []).forEach(m => { map[`${m.student_id}-${m.subject_id}`] = m.mark; });
            return map;
        } catch { return {}; }
    };

    const handleTeacherMarkChange = (assignIdx, studentId, subjectId, value) => {
        const num = parseFloat(value);
        if (value !== '' && (isNaN(num) || num < 0 || num > 100)) return;
        setTeacherMarks(prev => ({
            ...prev,
            [assignIdx]: { ...(prev[assignIdx] || {}), [`${studentId}-${subjectId}`]: value }
        }));
    };

    const handleTeacherSubmit = async (assignIdx) => {
        const a = assignments[assignIdx];
        const entries = Object.entries(teacherMarks[assignIdx] || {}).filter(([, v]) => v !== '');
        if (!entries.length) { alert('Please enter at least one mark'); return; }
        try {
            setLoading(true);
            for (const [key, value] of entries) {
                const [studentId, subjectId] = key.split('-');
                await createMark({ student_id: parseInt(studentId), subject_id: parseInt(subjectId), mark_value: parseFloat(value), semester: parseInt(a.semester), academic_year: a.academic_year });
            }
            alert('Marks submitted successfully!');
            const refreshed = await fetchExistingMarks(a.class_id, a.academic_year, a.semester);
            setTeacherMarks(prev => ({ ...prev, [assignIdx]: refreshed }));
            if (homeroomData) {
                const hr = await getMyHomeroomMarks();
                if (hr.isHomeroom && hr.data) { setHomeroomData(hr.data); setHomeroomEdits({ ...hr.data.marksMap }); }
            }
        } catch (err) { alert('Error: ' + (err.response?.data?.message || err.message)); }
        finally { setLoading(false); }
    };

    const handleHomeroomMarkChange = (studentId, subjectId, value) => {
        const num = parseFloat(value);
        if (value !== '' && (isNaN(num) || num < 0 || num > 100)) return;
        setHomeroomEdits(prev => ({ ...prev, [`${studentId}-${subjectId}`]: value }));
    };

    const handleSubmitToAdmin = async () => {
        if (!window.confirm('Submit all marks to admin?')) return;
        try {
            setLoading(true);
            const entries = Object.entries(homeroomEdits).filter(([, v]) => v !== '');
            for (const [key, value] of entries) {
                const [studentId, subjectId] = key.split('-');
                await createMark({ student_id: parseInt(studentId), subject_id: parseInt(subjectId), mark_value: parseFloat(value), semester: parseInt(homeroomData.semester), academic_year: homeroomData.academic_year });
            }
            await submitToAdmin({ class_id: homeroomData.class_id, academic_year: homeroomData.academic_year, semester: homeroomData.semester });
            const wasAlreadySubmitted = submitted;
            setSubmitted(true);
            if (wasAlreadySubmitted) {
                setResubmitted(true);
                setTimeout(() => setResubmitted(false), 3000);
            }
            const hr = await getMyHomeroomMarks();
            if (hr.isHomeroom && hr.data) { setHomeroomData(hr.data); setHomeroomEdits({ ...hr.data.marksMap }); }
            alert('Marks submitted to admin successfully!');
        } catch (err) { alert('Error: ' + (err.response?.data?.message || err.message)); }
        finally { setLoading(false); }
    };

    // ---- Admin flow ----
    const loadAdminData = async (classId, year, sem) => {
        try {
            setLoading(true);
            setNotSubmitted(false);
            setFinalized(false);
            setMarks({});
            setError('');

            // Run independently so one failure doesn't kill everything
            let studData = [], subData = [], marksData = { submitted: true, data: [] }, finalData = { finalized: false };

            try { const r = await getStudentsByClass(classId); studData = r.data || []; }
            catch (e) { console.error('Students fetch failed:', e.response?.status, e.message); }

            try { const r = await getClassSubjects(classId, year, sem); subData = r.data || []; }
            catch (e) { console.error('Subjects fetch failed:', e.response?.status, e.message); }

            try { marksData = await getMarks({ class_id: classId, academic_year: year, semester: sem }); }
            catch (e) { console.error('Marks fetch failed:', e.response?.status, e.message); }

            try { finalData = await getFinalizationStatus({ classId, academicYear: year, semester: sem }); }
            catch (e) { console.error('Finalization fetch failed:', e.response?.status, e.message); }

            setStudents(studData);
            setSubjects(subData);

            if (marksData.submitted === false) { setNotSubmitted(true); return; }
            setNotSubmitted(false);
            setFinalized(finalData.finalized || false);
            const map = {};
            (marksData.data || []).forEach(m => { map[`${m.student_id}-${m.subject_id}`] = m.mark; });
            setMarks(map);
        } catch (e) { setError('Error loading data: ' + e.message); }
        finally { setLoading(false); }
    };

    const handleClassChange = async (e) => {
        const classId = e.target.value;
        setSelectedClass(classId);
        setStudents([]); setSubjects([]); setMarks({});
        setNotSubmitted(false); setFinalized(false); setError('');
        if (!classId) return;

        // Auto-detect year/semester from latest homeroom submission
        let useYear = academicYear;
        let useSem = semester;
        try {
            const sub = await getLatestSubmission(classId);
            if (sub.found) {
                useYear = sub.academic_year;
                useSem = sub.semester;
                setAcademicYear(useYear);
                setSemester(useSem);
            }
        } catch (e) { /* ignore, use current values */ }

        loadAdminData(classId, useYear, useSem);
    };

    const handleMarkChange = (studentId, subjectId, value) => {
        const num = parseFloat(value);
        if (value !== '' && (isNaN(num) || num < 0 || num > 100)) return;
        setMarks(prev => ({ ...prev, [`${studentId}-${subjectId}`]: value }));
    };

    const handleAdminSaveMarks = async () => {
        if (!selectedClass) { alert('Please select a class'); return; }
        const entries = Object.entries(marks).filter(([, v]) => v !== '');
        if (!entries.length) { alert('Please enter at least one mark'); return; }
        if (!window.confirm('Save and lock marks? After saving, marks cannot be edited.')) return;
        try {
            setLoading(true);
            for (const [key, value] of entries) {
                const [studentId, subjectId] = key.split('-');
                await createMark({ student_id: parseInt(studentId), subject_id: parseInt(subjectId), mark_value: parseFloat(value), semester: parseInt(semester), academic_year: academicYear });
            }
            await finalizeMarks({ class_id: selectedClass, academic_year: academicYear, semester });
            // Navigate directly to report page after saving
            navigate('/reports', { state: { classId: selectedClass, academicYear, semester } });
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            setError(msg); alert('Error: ' + msg);
        } finally { setLoading(false); }
    };

    const handleSendToReport = () => navigate('/reports', { state: { classId: selectedClass, academicYear, semester } });

    // ======= TEACHER VIEW =======
    if (isTeacher) {
        if (loading && !assignments.length) return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading your assignments...</div>;
        if (assignmentError) return <div style={{ textAlign: 'center', padding: '3rem', color: '#e74c3c' }}>{assignmentError}</div>;

        return (
            <div className="mark-entry">
                {homeroomData && (
                    <div style={{ display: 'flex', marginBottom: '1.5rem', borderBottom: '2px solid #e0e0e0' }}>
                        <button onClick={() => setHomeroomTab('entry')} style={{ padding: '0.7rem 1.5rem', border: 'none', cursor: 'pointer', fontWeight: '600', background: homeroomTab === 'entry' ? '#667eea' : 'transparent', color: homeroomTab === 'entry' ? 'white' : '#555', borderRadius: '6px 6px 0 0' }}>📝 Enter Marks</button>
                        <button onClick={() => setHomeroomTab('homeroom')} style={{ padding: '0.7rem 1.5rem', border: 'none', cursor: 'pointer', fontWeight: '600', background: homeroomTab === 'homeroom' ? '#27ae60' : 'transparent', color: homeroomTab === 'homeroom' ? 'white' : '#555', borderRadius: '6px 6px 0 0' }}>🏠 Homeroom View</button>
                    </div>
                )}

                {homeroomTab === 'entry' && assignments.map((a, idx) => (
                    <div key={a.assignment_id} style={{ marginBottom: '2.5rem', border: '1px solid #e0e0e0', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div><strong style={{ fontSize: '1.1rem' }}>{a.class_name} — Grade {a.grade_level}</strong><span style={{ marginLeft: '1rem', opacity: 0.9 }}>Subject: <strong>{a.subject_name}</strong></span></div>
                            <div style={{ opacity: 0.85, fontSize: '0.9rem' }}>Year: {a.academic_year} | Semester: {a.semester}</div>
                        </div>
                        {finalizedClasses[`${a.class_id}_${a.academic_year}_${a.semester}`] && (
                            <div style={{ background: '#fff3cd', color: '#856404', padding: '0.6rem 1.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
                                🔒 Marks finalized by admin — editing is disabled.
                            </div>
                        )}
                        <div style={{ padding: '1rem' }}>
                            {a.students && a.students.length > 0 ? (
                                <>
                                    <table className="data-table" style={{ marginBottom: '1rem' }}>
                                        <thead><tr><th>#</th><th>Student Name</th><th>Code</th><th>{a.subject_name} (Max: {a.max_mark || 100})</th></tr></thead>
                                        <tbody>
                                            {a.students.map((s, si) => (
                                                <tr key={s.student_id}>
                                                    <td>{si + 1}</td>
                                                    <td>{s.student_name}</td>
                                                    <td>{s.student_code}</td>
                                                    <td>
                                                        {finalizedClasses[`${a.class_id}_${a.academic_year}_${a.semester}`]
                                                            ? <span style={{ fontWeight: '600' }}>{(teacherMarks[idx] || {})[`${s.student_id}-${a.subject_id}`] ?? '—'}</span>
                                                            : <input type="number" min="0" max={a.max_mark || 100} step="0.5" value={(teacherMarks[idx] || {})[`${s.student_id}-${a.subject_id}`] || ''} onChange={e => handleTeacherMarkChange(idx, s.student_id, a.subject_id, e.target.value)} placeholder="0-100" style={{ width: '90px', padding: '0.4rem', border: '1px solid #ddd', borderRadius: '4px' }} />
                                                        }
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {!finalizedClasses[`${a.class_id}_${a.academic_year}_${a.semester}`] && (
                                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <button onClick={() => handleTeacherSubmit(idx)} className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Submit Marks'}</button>
                                        </div>
                                    )}
                                </>
                            ) : <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>No students in this class.</div>}
                        </div>
                    </div>
                ))}

                {homeroomTab === 'homeroom' && homeroomData && (
                    <div style={{ border: '1px solid #e0e0e0', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)', color: 'white', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div><strong>🏠 {homeroomData.class_name} — Grade {homeroomData.grade_level}</strong><span style={{ marginLeft: '1rem', opacity: 0.9 }}>All Subjects</span></div>
                            <div style={{ opacity: 0.85, fontSize: '0.9rem' }}>Year: {homeroomData.academic_year} | Semester: {homeroomData.semester}</div>
                        </div>
                        {finalizedClasses[`${homeroomData.class_id}_${homeroomData.academic_year}_${homeroomData.semester}`] && (
                            <div style={{ background: '#fff3cd', color: '#856404', padding: '0.75rem 1.5rem', fontWeight: '600' }}>
                                🔒 Marks finalized by admin — editing is disabled.
                            </div>
                        )}
                        {submitted && !finalizedClasses[`${homeroomData.class_id}_${homeroomData.academic_year}_${homeroomData.semester}`] && (
                            <div style={{ background: '#d4edda', color: '#155724', padding: '0.75rem 1.5rem', fontWeight: '600' }}>✅ Marks submitted to admin.</div>
                        )}
                        <div style={{ padding: '1rem', overflowX: 'auto' }}>
                            {homeroomData.students && homeroomData.students.length > 0 ? (
                                <>
                                    <table className="data-table" style={{ marginBottom: '1rem', minWidth: '700px' }}>
                                        <thead>
                                            <tr>
                                                <th>#</th><th>Student Name</th><th>Code</th>
                                                {(homeroomData.subjects || []).map(sub => <th key={sub.subject_id} style={{ textAlign: 'center' }}>{sub.subject_name}<br /><small>/{sub.max_mark || 100}</small></th>)}
                                                <th style={{ textAlign: 'center' }}>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {homeroomData.students.map((s, si) => {
                                                const total = (homeroomData.subjects || []).reduce((sum, sub) => { const v = homeroomEdits[`${s.student_id}-${sub.subject_id}`]; return sum + (v !== '' && v !== undefined ? parseFloat(v) || 0 : 0); }, 0);
                                                const maxTotal = (homeroomData.subjects || []).reduce((sum, sub) => sum + (sub.max_mark || 100), 0);
                                                const isLocked = !!finalizedClasses[`${homeroomData.class_id}_${homeroomData.academic_year}_${homeroomData.semester}`];
                                                return (
                                                    <tr key={s.student_id}>
                                                        <td>{si + 1}</td><td>{s.student_name}</td><td>{s.student_code}</td>
                                                        {(homeroomData.subjects || []).map(sub => (
                                                            <td key={sub.subject_id} style={{ textAlign: 'center' }}>
                                                                {isLocked
                                                                    ? <span style={{ fontWeight: '600' }}>{homeroomEdits[`${s.student_id}-${sub.subject_id}`] ?? '—'}</span>
                                                                    : <input type="number" min="0" max={sub.max_mark || 100} step="0.5" value={homeroomEdits[`${s.student_id}-${sub.subject_id}`] ?? ''} onChange={e => handleHomeroomMarkChange(s.student_id, sub.subject_id, e.target.value)} placeholder="—" style={{ width: '65px', padding: '0.3rem', border: '1px solid #ddd', borderRadius: '4px', textAlign: 'center' }} />
                                                                }
                                                            </td>
                                                        ))}
                                                        <td style={{ textAlign: 'center', fontWeight: '700' }}>{total}/{maxTotal}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                    {!finalizedClasses[`${homeroomData.class_id}_${homeroomData.academic_year}_${homeroomData.semester}`] && (
                                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <button onClick={handleSubmitToAdmin} disabled={loading || resubmitted} style={{ background: resubmitted ? '#155724' : '#27ae60', color: 'white', border: 'none', padding: '0.7rem 1.8rem', borderRadius: '6px', fontWeight: '600', cursor: resubmitted ? 'default' : 'pointer', transition: 'background 0.3s' }}>
                                                {loading ? 'Submitting...' : resubmitted ? '✅ Resubmitted' : submitted ? '📤 Re-submit to Admin' : '📤 Submit to Admin'}
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>No students in this class.</div>}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ======= ADMIN VIEW =======
    return (
        <div className="mark-entry">
            <div style={{ background: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: '10px', padding: '1.2rem 1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ flex: '1', minWidth: '180px' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.4rem', color: '#555' }}>Class</label>
                    <select value={selectedClass} onChange={handleClassChange} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}>
                        <option value="">— Select Class —</option>
                        {classes.map(c => <option key={c.class_id} value={c.class_id}>{c.class_name} (Grade {c.grade_level})</option>)}
                    </select>
                </div>
                <div style={{ flex: '1', minWidth: '140px' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.4rem', color: '#555' }}>Academic Year</label>
                    <input type="text" value={academicYear} onChange={e => setAcademicYear(e.target.value)} placeholder="e.g. 2025" style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }} />
                </div>
                <div style={{ flex: '1', minWidth: '120px' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.4rem', color: '#555' }}>Semester</label>
                    <select value={semester} onChange={e => setSemester(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}>
                        <option value="1">Semester 1</option>
                        <option value="2">Semester 2</option>
                    </select>
                </div>
            </div>

            {error && <div style={{ background: '#fdecea', color: '#c0392b', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1rem' }}>{error}</div>}
            {!selectedClass && <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>Select a class to view and manage marks.</div>}
            {selectedClass && loading && <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>}
            {selectedClass && !loading && notSubmitted && (
                <div style={{ background: '#fff3cd', color: '#856404', border: '1px solid #ffc107', borderRadius: '8px', padding: '1.2rem 1.5rem', textAlign: 'center' }}>
                    ⏳ Marks have not been submitted by the homeroom teacher yet.
                </div>
            )}

            {selectedClass && !loading && !notSubmitted && students.length > 0 && (
                <div style={{ border: '1px solid #e0e0e0', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)', color: 'white', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong>{classes.find(c => c.class_id == selectedClass)?.class_name} — Marks Table</strong>
                        <div style={{ fontSize: '0.9rem', opacity: 0.85 }}>
                            Year: {academicYear} | Semester: {semester}
                            {finalized && <span style={{ marginLeft: '1rem', background: '#27ae60', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>🔒 Finalized</span>}
                        </div>
                    </div>
                    <div style={{ padding: '1rem', overflowX: 'auto' }}>
                        <table className="data-table" style={{ marginBottom: '1rem', minWidth: '700px' }}>
                            <thead>
                                <tr>
                                    <th>#</th><th>Student Name</th><th>Code</th>
                                    {subjects.map(sub => <th key={sub.subject_id} style={{ textAlign: 'center' }}>{sub.subject_name}<br /><small>/{sub.max_mark || 100}</small></th>)}
                                    <th style={{ textAlign: 'center' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((s, si) => {
                                    const total = subjects.reduce((sum, sub) => { const v = marks[`${s.student_id}-${sub.subject_id}`]; return sum + (v !== '' && v !== undefined ? parseFloat(v) || 0 : 0); }, 0);
                                    const maxTotal = subjects.reduce((sum, sub) => sum + (sub.max_mark || 100), 0);
                                    return (
                                        <tr key={s.student_id}>
                                            <td>{si + 1}</td><td style={{ fontWeight: '500' }}>{s.student_name}</td><td>{s.student_code}</td>
                                            {subjects.map(sub => (
                                                <td key={sub.subject_id} style={{ textAlign: 'center' }}>
                                                    {finalized
                                                        ? <span style={{ fontWeight: '600' }}>{marks[`${s.student_id}-${sub.subject_id}`] ?? '—'}</span>
                                                        : <input type="number" min="0" max={sub.max_mark || 100} step="0.5" value={marks[`${s.student_id}-${sub.subject_id}`] ?? ''} onChange={e => handleMarkChange(s.student_id, sub.subject_id, e.target.value)} placeholder="—" style={{ width: '65px', padding: '0.3rem', border: '1px solid #ddd', borderRadius: '4px', textAlign: 'center' }} />
                                                    }
                                                </td>
                                            ))}
                                            <td style={{ textAlign: 'center', fontWeight: '700', color: '#2c3e50' }}>{total}/{maxTotal}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            {!finalized && <button onClick={handleAdminSaveMarks} disabled={loading} style={{ background: '#2c3e50', color: 'white', border: 'none', padding: '0.7rem 1.8rem', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>{loading ? 'Saving...' : '💾 Save Marks'}</button>}
                            {finalized && <button onClick={handleSendToReport} style={{ background: '#3498db', color: 'white', border: 'none', padding: '0.7rem 1.8rem', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>📊 Send to Report</button>}
                        </div>
                    </div>
                </div>
            )}
            {selectedClass && !loading && !notSubmitted && students.length === 0 && !error && (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>No students found in this class.</div>
            )}
        </div>
    );
};

export default MarkEntry;
