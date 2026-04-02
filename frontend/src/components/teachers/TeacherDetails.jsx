import React from 'react';

const TeacherDetails = ({ teacher }) => {
    if (!teacher) return null;

    return (
        <div className="teacher-details">
            <h3>Teacher Details</h3>
            <div className="details-grid">
                <div className="detail-item">
                    <label>Name:</label>
                    <span>{teacher.first_name} {teacher.last_name}</span>
                </div>
                <div className="detail-item">
                    <label>Email:</label>
                    <span>{teacher.email}</span>
                </div>
                <div className="detail-item">
                    <label>Phone:</label>
                    <span>{teacher.phone}</span>
                </div>
                <div className="detail-item">
                    <label>Department:</label>
                    <span>{teacher.department_name}</span>
                </div>
                <div className="detail-item">
                    <label>Homeroom Teacher:</label>
                    <span>{teacher.is_homeroom_teacher ? 'Yes' : 'No'}</span>
                </div>
            </div>
        </div>
    );
};

export default TeacherDetails;
