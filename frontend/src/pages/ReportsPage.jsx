import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import ReportFilters from '../components/reports/ReportFilters';
import ClassReport from '../components/reports/ClassReport';

const ReportsPage = () => {
    const location = useLocation();
    const passed = location.state || {};

    const [filters, setFilters] = useState({
        classId: passed.classId || '',
        academicYear: passed.academicYear || new Date().getFullYear(),
        semester: passed.semester || 1
    });

    return (
        <div className="page-container">
            <h2>Academic Reports</h2>
            <ReportFilters filters={filters} setFilters={setFilters} />
            {filters.classId && <ClassReport filters={filters} />}
        </div>
    );
};

export default ReportsPage;
