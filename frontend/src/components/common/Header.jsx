import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const Header = () => {
    const { user, logout } = useAuth();

    return (
        <header className="header">
            <div className="header-content">
                <h1>MINARE HIGH SCHOOL</h1>
                <div className="header-right">
                    <span>Welcome, {user?.username}</span>
                    <button onClick={logout} className="btn-logout">Logout</button>
                </div>
            </div>
        </header>
    );
};

export default Header;
