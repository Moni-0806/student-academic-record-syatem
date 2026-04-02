import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
    const location = useLocation();
    const { user } = useAuth();

    const allMenuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['admin'] },
        { path: '/classes', label: 'Classes', icon: '🏫', roles: ['admin'] },
        { path: '/teachers', label: 'Teachers', icon: '👨‍🏫', roles: ['admin'] },
        { path: '/students', label: 'Students', icon: '👨‍🎓', roles: ['admin'] },
        { path: '/subjects', label: 'Subjects', icon: '📚', roles: ['admin'] },
        { path: '/marks', label: 'Marks', icon: '📝', roles: ['admin', 'teacher'] },
        { path: '/reports', label: 'Reports', icon: '📄', roles: ['admin'] }
    ];

    // Filter menu items based on user role
    const menuItems = allMenuItems.filter(item =>
        item.roles.includes(user?.role || 'admin')
    );

    return (
        <aside className="sidebar">
            <nav>
                <ul>
                    {menuItems.map(item => (
                        <li key={item.path} className={location.pathname === item.path ? 'active' : ''}>
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
