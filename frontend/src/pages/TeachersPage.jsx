import React from 'react';
import TeacherList from '../components/teachers/TeacherList';

const TeachersPage = () => {
    return (
        <div className="page-container">
            <h2>Teachers Management</h2>
            <TeacherList />
        </div>
    );
};

export default TeachersPage;
