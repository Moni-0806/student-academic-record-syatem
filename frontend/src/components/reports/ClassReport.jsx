import React, { useEffect, useState } from 'react';
import { getClassReport } from '../../services/reportService';
import LoadingSpinner from '../common/LoadingSpinner';

const printStudentCard = (student, classInfo, filters) => {
    const subjects = [
        { label: 'Mathematics', value: student.maths },
        { label: 'English', value: student.english },
        { label: 'Biology', value: student.biology },
        { label: 'Chemistry', value: student.chemistry },
        { label: 'Physics', value: student.physics },
    ];

    const rows = subjects.map(s => `
        <tr>
            <td>${s.label}</td>
            <td style="text-align:center">${s.value ?? '-'}</td>
            <td style="text-align:center">100</td>
            <td style="text-align:center;font-weight:600;color:${(s.value ?? 0) >= 50 ? '#155724' : '#721c24'}">
                ${s.value != null ? ((s.value >= 50) ? 'PASS' : 'FAIL') : '-'}
            </td>
        </tr>`).join('');

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<title>Result Card - ${student.student_name}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, sans-serif; background:#fff; }
  .card { width:680px; margin:30px auto; border:2px solid #1a237e; border-radius:8px; overflow:hidden; }
  .school-header { background:linear-gradient(135deg,#1a237e,#283593); color:#fff; text-align:center; padding:18px 12px; }
  .school-header h1 { font-size:20px; letter-spacing:2px; margin-bottom:4px; }
  .school-header p  { font-size:12px; opacity:.85; }
  .card-title { background:#e8eaf6; text-align:center; padding:8px; font-size:14px; font-weight:700; color:#1a237e; letter-spacing:1px; border-bottom:1px solid #c5cae9; }
  .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:0; border-bottom:1px solid #c5cae9; }
  .info-item { padding:8px 16px; border-right:1px solid #e8eaf6; }
  .info-item:nth-child(even) { border-right:none; }
  .info-label { font-size:10px; color:#666; text-transform:uppercase; letter-spacing:.5px; }
  .info-value { font-size:13px; font-weight:600; color:#1a237e; margin-top:2px; }
  table { width:100%; border-collapse:collapse; }
  th { background:#1a237e; color:#fff; padding:8px 12px; font-size:12px; text-align:left; }
  td { padding:7px 12px; font-size:13px; border-bottom:1px solid #e8eaf6; }
  tr:last-child td { border-bottom:none; }
  tr:nth-child(even) td { background:#f5f5f5; }
  .totals-row { background:#e8eaf6 !important; font-weight:700; }
  .totals-row td { border-top:2px solid #1a237e; color:#1a237e; }
  .result-banner { text-align:center; padding:12px; font-size:16px; font-weight:700; letter-spacing:1px; }
  .pass { background:#d4edda; color:#155724; }
  .fail { background:#f8d7da; color:#721c24; }
  .footer { text-align:center; padding:10px; font-size:10px; color:#888; border-top:1px solid #e8eaf6; }
  @media print {
    body { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .card { margin:0; border-radius:0; width:100%; }
  }
</style>
</head>
<body>
<div class="card">
  <div class="school-header">
    <h1>MINARE HIGH SCHOOL</h1>
    <p>Student Academic Result Card</p>
  </div>
  <div class="card-title">SEMESTER RESULT CARD</div>
  <div class="info-grid">
    <div class="info-item"><div class="info-label">Student Name</div><div class="info-value">${student.student_name}</div></div>
    <div class="info-item"><div class="info-label">Student ID</div><div class="info-value">${student.student_code}</div></div>
    <div class="info-item"><div class="info-label">Class</div><div class="info-value">${classInfo.class_name || '-'}</div></div>
    <div class="info-item"><div class="info-label">Grade Level</div><div class="info-value">${classInfo.grade_level || '-'}</div></div>
    <div class="info-item"><div class="info-label">Academic Year</div><div class="info-value">${filters.academicYear}</div></div>
    <div class="info-item"><div class="info-label">Semester</div><div class="info-value">Semester ${filters.semester}</div></div>
    <div class="info-item"><div class="info-label">Homeroom Teacher</div><div class="info-value">${classInfo.homeroom_teacher || 'N/A'}</div></div>
    <div class="info-item"><div class="info-label">Gender</div><div class="info-value">${student.gender === 'M' ? 'Male' : 'Female'}</div></div>
  </div>
  <table>
    <thead><tr><th>Subject</th><th style="text-align:center">Mark</th><th style="text-align:center">Max</th><th style="text-align:center">Result</th></tr></thead>
    <tbody>
      ${rows}
      <tr class="totals-row">
        <td>TOTAL</td>
        <td style="text-align:center">${student.total ?? 0}</td>
        <td style="text-align:center">500</td>
        <td style="text-align:center">${student.average ?? 0}%</td>
      </tr>
    </tbody>
  </table>
  <div class="result-banner ${(student.status || '').toLowerCase()}">${student.status === 'PASS' ? '✅ PASSED' : '❌ FAILED'} &nbsp;|&nbsp; Rank: ${student.rank} &nbsp;|&nbsp; Average: ${student.average}%</div>
  <div class="footer">Printed from MINARE HIGH SCHOOL Academic Record System &nbsp;|&nbsp; Academic Year ${filters.academicYear}</div>
</div>
<script>window.onload=function(){window.print();}</script>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=750,height=700');
    win.document.write(html);
    win.document.close();
};

const buildCardHTML = (student, classInfo, filters) => {
    const subjects = [
        { label: 'Mathematics', value: student.maths },
        { label: 'English', value: student.english },
        { label: 'Biology', value: student.biology },
        { label: 'Chemistry', value: student.chemistry },
        { label: 'Physics', value: student.physics },
    ];
    const rows = subjects.map(s => `
        <tr>
            <td>${s.label}</td>
            <td style="text-align:center">${s.value ?? '-'}</td>
            <td style="text-align:center">100</td>
            <td style="text-align:center;font-weight:600;color:${(s.value ?? 0) >= 50 ? '#155724' : '#721c24'}">
                ${s.value != null ? ((s.value >= 50) ? 'PASS' : 'FAIL') : '-'}
            </td>
        </tr>`).join('');
    return `
<div class="card">
  <div class="school-header">
    <h1>MINARE HIGH SCHOOL</h1>
    <p>Student Academic Result Card</p>
  </div>
  <div class="card-title">SEMESTER RESULT CARD</div>
  <div class="info-grid">
    <div class="info-item"><div class="info-label">Student Name</div><div class="info-value">${student.student_name}</div></div>
    <div class="info-item"><div class="info-label">Student ID</div><div class="info-value">${student.student_code}</div></div>
    <div class="info-item"><div class="info-label">Class</div><div class="info-value">${classInfo.class_name || '-'}</div></div>
    <div class="info-item"><div class="info-label">Grade Level</div><div class="info-value">${classInfo.grade_level || '-'}</div></div>
    <div class="info-item"><div class="info-label">Academic Year</div><div class="info-value">${filters.academicYear}</div></div>
    <div class="info-item"><div class="info-label">Semester</div><div class="info-value">Semester ${filters.semester}</div></div>
    <div class="info-item"><div class="info-label">Homeroom Teacher</div><div class="info-value">${classInfo.homeroom_teacher || 'N/A'}</div></div>
    <div class="info-item"><div class="info-label">Gender</div><div class="info-value">${student.gender === 'M' ? 'Male' : 'Female'}</div></div>
  </div>
  <table>
    <thead><tr><th>Subject</th><th style="text-align:center">Mark</th><th style="text-align:center">Max</th><th style="text-align:center">Result</th></tr></thead>
    <tbody>
      ${rows}
      <tr class="totals-row">
        <td>TOTAL</td>
        <td style="text-align:center">${student.total ?? 0}</td>
        <td style="text-align:center">500</td>
        <td style="text-align:center">${student.average ?? 0}%</td>
      </tr>
    </tbody>
  </table>
  <div class="result-banner ${(student.status || '').toLowerCase()}">${student.status === 'PASS' ? '✅ PASSED' : '❌ FAILED'} &nbsp;|&nbsp; Rank: ${student.rank} &nbsp;|&nbsp; Average: ${student.average}%</div>
  <div class="footer">Printed from MINARE HIGH SCHOOL Academic Record System &nbsp;|&nbsp; Academic Year ${filters.academicYear}</div>
</div>`;
};

const printAllCards = (students, classInfo, filters) => {
    const cardCSS = `
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, sans-serif; background:#fff; }
  .card { width:680px; margin:20px auto; border:2px solid #1a237e; border-radius:8px; overflow:hidden; page-break-after:always; }
  .card:last-child { page-break-after:avoid; }
  .school-header { background:linear-gradient(135deg,#1a237e,#283593); color:#fff; text-align:center; padding:18px 12px; }
  .school-header h1 { font-size:20px; letter-spacing:2px; margin-bottom:4px; }
  .school-header p  { font-size:12px; opacity:.85; }
  .card-title { background:#e8eaf6; text-align:center; padding:8px; font-size:14px; font-weight:700; color:#1a237e; letter-spacing:1px; border-bottom:1px solid #c5cae9; }
  .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:0; border-bottom:1px solid #c5cae9; }
  .info-item { padding:8px 16px; border-right:1px solid #e8eaf6; }
  .info-item:nth-child(even) { border-right:none; }
  .info-label { font-size:10px; color:#666; text-transform:uppercase; letter-spacing:.5px; }
  .info-value { font-size:13px; font-weight:600; color:#1a237e; margin-top:2px; }
  table { width:100%; border-collapse:collapse; }
  th { background:#1a237e; color:#fff; padding:8px 12px; font-size:12px; text-align:left; }
  td { padding:7px 12px; font-size:13px; border-bottom:1px solid #e8eaf6; }
  tr:last-child td { border-bottom:none; }
  tr:nth-child(even) td { background:#f5f5f5; }
  .totals-row { background:#e8eaf6 !important; font-weight:700; }
  .totals-row td { border-top:2px solid #1a237e; color:#1a237e; }
  .result-banner { text-align:center; padding:12px; font-size:16px; font-weight:700; letter-spacing:1px; }
  .pass { background:#d4edda; color:#155724; }
  .fail { background:#f8d7da; color:#721c24; }
  .footer { text-align:center; padding:10px; font-size:10px; color:#888; border-top:1px solid #e8eaf6; }
  @media print {
    body { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .card { margin:0; border-radius:0; width:100%; }
  }`;

    const allCards = students.map(s => buildCardHTML(s, classInfo, filters)).join('\n');

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<title>All Result Cards — ${classInfo.class_name} — ${filters.academicYear}</title>
<style>${cardCSS}</style>
</head>
<body>
${allCards}
<script>window.onload=function(){window.print();}<\/script>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=800,height=700');
    win.document.write(html);
    win.document.close();
};

const ClassReport = ({ filters }) => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadReport();
    }, [filters]);

    const loadReport = async () => {
        if (!filters.classId || !filters.academicYear || !filters.semester) {
            return;
        }

        setLoading(true);
        try {
            const response = await getClassReport(filters.classId, filters.academicYear, filters.semester);
            console.log('Report response:', response); // Debug log
            setReport(response.data || response);
        } catch (error) {
            console.error('Error loading report:', error);
            alert('Error loading report: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;
    if (!report || !report.students || report.students.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                {filters.classId ? 'No data found for the selected class, academic year, and semester.' : 'Please select a class to view the report.'}
            </div>
        );
    }

    const classInfo = report.class_info || {};

    return (
        <div className="class-report">
            <div className="report-header">
                <h3>MINARE HIGH SCHOOL STUDENT ROSTER</h3>
                <p>GRADE: {classInfo.class_name || 'N/A'}</p>
                <p>HOMEROOM TEACHER: {classInfo.homeroom_teacher || 'Not Assigned'}</p>
                <p>ACADEMIC YEAR: {filters.academicYear} | SEMESTER {filters.semester}</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <button
                    onClick={() => printAllCards(report.students, classInfo, filters)}
                    style={{ background: '#1a237e', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.6rem 1.4rem', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
                >
                    🖨️ Print All Cards
                </button>
            </div>

            <table className="report-table">
                <thead>
                    <tr>
                        <th>STUDENT NAME</th>
                        <th>GENDER</th>
                        <th>ID</th>
                        <th>MATHS</th>
                        <th>ENG</th>
                        <th>BIO</th>
                        <th>CHEM</th>
                        <th>PHY</th>
                        <th>TOTAL</th>
                        <th>AVG</th>
                        <th>RANK</th>
                        <th>STATUS</th>
                    </tr>
                </thead>
                <tbody>
                    {report.students.map(student => (
                        <tr key={student.student_id}>
                            <td>{student.student_name}</td>
                            <td>{student.gender}</td>
                            <td>{student.student_code}</td>
                            <td>{student.maths || '-'}</td>
                            <td>{student.english || '-'}</td>
                            <td>{student.biology || '-'}</td>
                            <td>{student.chemistry || '-'}</td>
                            <td>{student.physics || '-'}</td>
                            <td>{student.total || 0}</td>
                            <td>{student.average || 0}</td>
                            <td>{student.rank}</td>
                            <td>
                                <span className={`status-badge ${student.status.toLowerCase()}`}>
                                    {student.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="report-notes">
                <p>❏ SUBJECT LEVEL TOTAL = 100</p>
                <p>❏ OVERALL TOTAL = 500</p>
                <p>❏ PASS MARK = 50%</p>
            </div>

            {report.summary && (
                <div className="report-summary" style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
                    <h4>Class Summary</h4>
                    <p>Total Students: {report.summary.total_students}</p>
                    <p>Passed: {report.summary.passed} | Failed: {report.summary.failed}</p>
                    <p>Class Average: {report.summary.class_average}</p>
                </div>
            )}
        </div>
    );
};

export default ClassReport;
