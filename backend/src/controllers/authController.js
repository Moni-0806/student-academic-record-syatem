const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const authConfig = require('../config/auth');

// Login
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user
        const user = await UserModel.findByUsername(username);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Verify password
        const isValid = await UserModel.verifyPassword(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user.user_id, username: user.username, role: user.role },
            authConfig.jwtSecret,
            { expiresIn: authConfig.jwtExpire }
        );

        res.json({
            success: true,
            token,
            user: {
                user_id: user.user_id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Register (admin only)
exports.register = async (req, res) => {
    try {
        const userId = await UserModel.create(req.body);
        const user = await UserModel.findById(userId);
        res.status(201).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await UserModel.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Get user with password
        const user = await UserModel.findByUsername(req.user.username);

        // Verify current password
        const isValid = await UserModel.verifyPassword(currentPassword, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }

        // Update password
        await UserModel.changePassword(req.user.userId, newPassword);
        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
