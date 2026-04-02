import React from 'react';
import SubjectList from '../components/subjects/SubjectList';

const SubjectsPage = () => {
    return (
        <div className="page-container">
            <h2>Subjects Management</h2>
            <SubjectList />
        </div>
    );
};

export default SubjectsPage;
