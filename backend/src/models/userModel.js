const db = require('../config/database');
const bcrypt = require('bcryptjs');

class UserModel {
    // Find user by username
    static async findByUsername(username) {
        const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        return rows[0];
    }

    // Find user by ID
    static async findById(id) {
        const [rows] = await db.query('SELECT user_id, username, email, role, created_at FROM users WHERE user_id = ?', [id]);
        return rows[0];
    }

    // Create new user
    static async create(userData) {
        const { username, password, email, role } = userData;

        // Validate required fields
        if (!password) {
            throw new Error('Password is required to create a user');
        }
        if (!username) {
            throw new Error('Username is required to create a user');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.query(`
      INSERT INTO users (username, password_hash, email, role)
      VALUES (?, ?, ?, ?)
    `, [username, hashedPassword, email, role]);
        return result.insertId;
    }

    // Verify password
    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    // Update user
    static async update(id, userData) {
        const { email, role } = userData;
        const [result] = await db.query(`
      UPDATE users SET email = ?, role = ? WHERE user_id = ?
    `, [email, role, id]);
        return result.affectedRows;
    }

    // Change password
    static async changePassword(id, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const [result] = await db.query(`
      UPDATE users SET password_hash = ? WHERE user_id = ?
    `, [hashedPassword, id]);
        return result.affectedRows;
    }

    // Delete user
    static async delete(id) {
        const [result] = await db.query('DELETE FROM users WHERE user_id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = UserModel;
