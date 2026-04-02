import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import MarkEntry from '../components/marks/MarkEntry';

const MarksPage = () => {
    const { user } = useContext(AuthContext);
    const isTeacher = user?.role === 'teacher';

    return (
        <div className="page-container">
            <h2>{isTeacher ? 'Enter Marks for My Class' : 'Marks Management'}</h2>
            {isTeacher && (
                <p style={{ color: '#666', marginBottom: '1.5rem', marginTop: '-0.5rem' }}>
                    Showing your assigned class(es) and subject. Enter marks for each student and click Submit.
                </p>
            )}
            <MarkEntry />
        </div>
    );
};

export default MarksPage;
