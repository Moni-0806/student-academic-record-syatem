import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
    const location = useLocation();
    const { user } = useAuth();
    const [teachersOpen, setTeachersOpen] = useState(
        location.pathname.startsWith('/teachers')
    );

    const isActive = (path) => location.pathname === path;
    const isTeachersSection = location.pathname.startsWith('/teachers');

    const mainItems = [
        { path: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['admin'] },
        { path: '/classes', label: 'Classes', icon: '🏫', roles: ['admin'] },
        { path: '/students', label: 'Students', icon: '👨‍🎓', roles: ['admin'] },
        { path: '/subjects', label: 'Subjects', icon: '📚', roles: ['admin'] },
        { path: '/marks', label: 'Marks', icon: '📝', roles: ['admin', 'teacher'] },
        { path: '/reports', label: 'Reports', icon: '📄', roles: ['admin'] },
    ];

    const teacherSubItems = [
        { path: '/teachers', label: 'Teacher List', icon: '📋' },
        { path: '/teachers/assign', label: 'Assign Teacher', icon: '📚' },
        { path: '/teachers/homeroom', label: 'Assign Homeroom Teacher', icon: '🏠' },
    ];

    const filteredMain = mainItems.filter(item =>
        item.roles.includes(user?.role || 'admin')
    );

    const showTeachers = (user?.role || 'admin') === 'admin';

    return (
        <aside className="sidebar">
            <nav>
                <ul>
                    {filteredMain.slice(0, 2).map(item => (
                        <li key={item.path} className={isActive(item.path) ? 'active' : ''}>
                            <Link to={item.path}>
                                <span className="icon">{item.icon}</span>
                                <span>{item.label}</span>
                            </Link>
                        </li>
                    ))}

                    {/* Teachers with submenu */}
                    {showTeachers && (
                        <li className={`has-submenu ${isTeachersSection ? 'submenu-open' : ''}`}>
                            <button
                                className={`sidebar-parent-btn ${isTeachersSection ? 'active' : ''}`}
                                onClick={() => setTeachersOpen(o => !o)}
                            >
                                <span className="icon">👨‍🏫</span>
                                <span>Teachers</span>
                                <span className="submenu-arrow">{teachersOpen ? '▾' : '▸'}</span>
                            </button>

                            {teachersOpen && (
                                <ul className="submenu">
                                    {teacherSubItems.map(sub => (
                                        <li key={sub.path} className={isActive(sub.path) ? 'active' : ''}>
                                            <Link to={sub.path}>
                                                <span className="icon">{sub.icon}</span>
                                                <span>{sub.label}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    )}

                    {filteredMain.slice(2).map(item => (
                        <li key={item.path} className={isActive(item.path) ? 'active' : ''}>
                            <Link to={item.path}>
                                <span className="icon">{item.icon}</span>
                                <span>{item.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
