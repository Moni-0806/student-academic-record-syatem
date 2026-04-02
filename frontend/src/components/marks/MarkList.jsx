import React from 'react';

const MarkList = ({ marks }) => {
    return (
        <div className="mark-list">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Student</th>
                        <th>Subject</th>
                        <th>Mark</th>
                        <th>Semester</th>
                        <th>Academic Year</th>
                    </tr>
                </thead>
                <tbody>
                    {marks.map(mark => (
                        <tr key={mark.mark_id}>
                            <td>{mark.student_name}</td>
                            <td>{mark.subject_name}</td>
                            <td>{mark.mark_value}</td>
                            <td>{mark.semester}</td>
                            <td>{mark.academic_year}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MarkList;
