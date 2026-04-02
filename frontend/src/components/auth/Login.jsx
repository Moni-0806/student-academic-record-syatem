import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Login = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login, loading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const result = await login(credentials);
            // Redirect based on user role
            if (result.user.role === 'teacher') {
                navigate('/marks');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Login failed');
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-logo">
                    <div className="logo-icon">🎓</div>
                    <h2>MINARE HIGH SCHOOL</h2>
                    <h3>Student Academic Record System</h3>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            placeholder="Enter your username"
                            value={credentials.username}
                            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                            required
                            autoComplete="username"
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={credentials.password}
                                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                required
                                autoComplete="current-password"
                                style={{ paddingRight: '40px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '1.2rem',
                                    padding: '5px',
                                    color: '#666'
                                }}
                                title={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="btn-login">
                        {loading ? (
                            <>
                                <span className="spinner-small"></span>
                                Logging in...
                            </>
                        ) : (
                            <>
                                🔐 Login
                            </>
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <p>🔒 Secure Access Portal</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
