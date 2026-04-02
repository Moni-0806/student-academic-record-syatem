import React, { useEffect, useState } from 'react';
import { getClasses } from '../../services/classService';

const ReportFilters = ({ filters, setFilters }) => {
    const [classes, setClasses] = useState([]);

    useEffect(() => {
        loadClasses();
    }, []);

    const loadClasses = async () => {
        try {
            const response = await getClasses();
            setClasses(response.data || []);
        } catch (error) {
            console.error('Error loading classes:', error);
        }
    };

    return (
        <div className="report-filters">
            <div className="filter-group">
                <label>Class:</label>
                <select
                    value={filters.classId}
                    onChange={(e) => setFilters({ ...filters, classId: e.target.value })}
                >
                    <option value="">Select Class</option>
                    {classes.map(cls => (
                        <option key={cls.class_id} value={cls.class_id}>
                            {cls.class_name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="filter-group">
                <label>Academic Year:</label>
                <input
                    type="text"
                    value={filters.academicYear}
                    onChange={(e) => setFilters({ ...filters, academicYear: e.target.value })}
                    placeholder="e.g. 2025"
                />
            </div>

            <div className="filter-group">
                <label>Semester:</label>
                <select
                    value={filters.semester}
                    onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                >
                    <option value="1">Semester I</option>
                    <option value="2">Semester II</option>
                </select>
            </div>
        </div>
    );
};

export default ReportFilters;
