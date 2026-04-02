import React from 'react';

const StudentDetails = ({ student }) => {
    if (!student) return null;

    return (
        <div className="student-details">
            <h3>Student Details</h3>
            <div className="details-grid">
                <div className="detail-item">
                    <label>Name:</label>
                    <span>{student.first_name} {student.last_name}</span>
                </div>
                <div className="detail-item">
                    <label>Gender:</label>
                    <span>{student.gender}</span>
                </div>
                <div className="detail-item">
                    <label>Date of Birth:</label>
                    <span>{student.date_of_birth}</span>
                </div>
                <div className="detail-item">
                    <label>Class:</label>
                    <span>{student.class_name}</span>
                </div>
                <div className="detail-item">
                    <label>Academic Year:</label>
                    <span>{student.academic_year}</span>
                </div>
            </div>
        </div>
    );
};

export default StudentDetails;
