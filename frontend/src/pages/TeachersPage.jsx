import React from 'react';
import TeacherList from '../components/teachers/TeacherList';

const TeachersPage = ({ section = 'list' }) => {
    return (
        <div className="page-container">
            <h2>Teachers Management</h2>
            <TeacherList section={section} />
        </div>
    );
};

export default TeachersPage;
