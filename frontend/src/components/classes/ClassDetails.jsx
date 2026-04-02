import React from 'react';

const ClassDetails = ({ classData }) => {
    if (!classData) return null;

    return (
        <div className="class-details">
            <h3>Class Details</h3>
            <div className="details-grid">
                <div className="detail-item">
                    <label>Class Name:</label>
                    <span>{classData.class_name}</span>
                </div>
                <div className="detail-item">
                    <label>Grade Level:</label>
                    <span>{classData.grade_level}</span>
                </div>
                <div className="detail-item">
                    <label>Academic Year:</label>
                    <span>{classData.academic_year}</span>
                </div>
                <div className="detail-item">
                    <label>Homeroom Teacher:</label>
                    <span>{classData.homeroom_teacher_name || 'Not Assigned'}</span>
                </div>
            </div>
        </div>
    );
};

export default ClassDetails;
