const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const [users] = await db.query(
                'SELECT user_id, username, email, role FROM users WHERE user_id = ?',
                [decoded.userId || decoded.id]
            );

            if (users.length === 0) {
                return res.status(401).json({ success: false, error: 'Not authorized' });
            }

            req.user = users[0];
            next();
        } catch (error) {
            return res.status(401).json({ success: false, error: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, error: 'Not authorized, no token' });
    }
};

// Role-based authorization
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};

module.exports = { protect, authorize };
