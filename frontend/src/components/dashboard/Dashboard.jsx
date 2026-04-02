import React, { useEffect, useState } from 'react';
import { getStudents } from '../../services/studentService';
import { getTeachers } from '../../services/teacherService';
import { getClasses } from '../../services/classService';
import { getSubjects } from '../../services/subjectService';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalTeachers: 0,
        totalClasses: 0,
        totalSubjects: 0
    });

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const [students, teachers, classes, subjects] = await Promise.all([
                getStudents(),
                getTeachers(),
                getClasses(),
                getSubjects()
            ]);

            setStats({
                totalStudents: students.data?.length || 0,
                totalTeachers: teachers.data?.length || 0,
                totalClasses: classes.data?.length || 0,
                totalSubjects: subjects.data?.length || 0
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const currentYear = new Date().getFullYear();

    return (
        <div className="dashboard-container">
            {/* School Banner */}
            <div className="school-banner">
                <div className="school-logo">
                    <div className="logo-circle">
                        <span className="logo-icon">🎓</span>
                    </div>
                </div>
                <div className="school-info">
                    <h1 className="school-name">MINARE HIGH SCHOOL</h1>
                    <p className="school-tagline">Academic Records Management System</p>
                    <p className="academic-year">Academic Year {currentYear}</p>
                </div>
            </div>

            {/* Welcome Section */}
            <div className="welcome-section">
                <h2>📊 Dashboard Overview</h2>
                <p>Welcome to the Student Academic Records Management System</p>
            </div>

            {/* Statistics Cards */}
            <div className="stats-grid-modern">
                <div className="stat-card-modern students-card">
                    <div className="stat-icon">
                        <span className="icon-large">👨‍🎓</span>
                    </div>
                    <div className="stat-content">
                        <h3>Total Students</h3>
                        <p className="stat-number-large">{stats.totalStudents}</p>
                        <span className="stat-label">Enrolled Students</span>
                    </div>
                </div>

                <div className="stat-card-modern teachers-card">
                    <div className="stat-icon">
                        <span className="icon-large">👨‍🏫</span>
                    </div>
                    <div className="stat-content">
                        <h3>Total Teachers</h3>
                        <p className="stat-number-large">{stats.totalTeachers}</p>
                        <span className="stat-label">Teaching Staff</span>
                    </div>
                </div>

                <div className="stat-card-modern classes-card">
                    <div className="stat-icon">
                        <span className="icon-large">🏫</span>
                    </div>
                    <div className="stat-content">
                        <h3>Total Classes</h3>
                        <p className="stat-number-large">{stats.totalClasses}</p>
                        <span className="stat-label">Active Classes</span>
                    </div>
                </div>

                <div className="stat-card-modern subjects-card">
                    <div className="stat-icon">
                        <span className="icon-large">📚</span>
                    </div>
                    <div className="stat-content">
                        <h3>Total Subjects</h3>
                        <p className="stat-number-large">{stats.totalSubjects}</p>
                        <span className="stat-label">Core Subjects</span>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions-section">
                <h3>⚡ Quick Actions</h3>
                <div className="quick-actions-grid">
                    <div className="quick-action-card">
                        <span className="action-icon">➕</span>
                        <span className="action-text">Add Student</span>
                    </div>
                    <div className="quick-action-card">
                        <span className="action-icon">➕</span>
                        <span className="action-text">Add Teacher</span>
                    </div>
                    <div className="quick-action-card">
                        <span className="action-icon">✏️</span>
                        <span className="action-text">Enter Marks</span>
                    </div>
                    <div className="quick-action-card">
                        <span className="action-icon">📄</span>
                        <span className="action-text">View Reports</span>
                    </div>
                </div>
            </div>

            {/* System Info */}
            <div className="system-info">
                <div className="info-card">
                    <span className="info-icon">ℹ️</span>
                    <div className="info-content">
                        <strong>System Status:</strong> All systems operational
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
