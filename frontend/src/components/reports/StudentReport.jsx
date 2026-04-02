import React from 'react';

const StudentReport = ({ report }) => {
    if (!report) return null;

    return (
        <div className="student-report">
            <h3>Student Academic Report</h3>
            <div className="report-header">
                <p>Student: {report.student_name}</p>
                <p>ID: {report.student_id}</p>
                <p>Class: {report.class_name}</p>
            </div>

            <table className="report-table">
                <thead>
                    <tr>
                        <th>Subject</th>
                        <th>Mark</th>
                    </tr>
                </thead>
                <tbody>
                    {report.marks?.map(mark => (
                        <tr key={mark.subject_id}>
                            <td>{mark.subject_name}</td>
                            <td>{mark.mark_value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="report-summary">
                <p>Total: {report.total} / 500</p>
                <p>Average: {report.average}%</p>
                <p>Rank: {report.rank}</p>
                <p>Status: <span className={`status-badge ${report.status.toLowerCase()}`}>
                    {report.status}
                </span></p>
            </div>
        </div>
    );
};

export default StudentReport;
