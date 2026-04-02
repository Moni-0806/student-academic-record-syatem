// Script to create admin user
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function createAdmin() {
    try {
        // Hash the password
        const password = 'admin123';
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        console.log('Password hash generated:', passwordHash);

        // Connect to database
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('Connected to database');

        // Check if admin exists
        const [existing] = await connection.execute(
            'SELECT * FROM users WHERE username = ?',
            ['admin']
        );

        if (existing.length > 0) {
            console.log('Admin user already exists. Updating password...');
            await connection.execute(
                'UPDATE users SET password_hash = ? WHERE username = ?',
                [passwordHash, 'admin']
            );
            console.log('✅ Admin password updated successfully!');
        } else {
            console.log('Creating new admin user...');
            await connection.execute(
                'INSERT INTO users (username, password_hash, email, role) VALUES (?, ?, ?, ?)',
                ['admin', passwordHash, 'admin@abchighschool.com', 'admin']
            );
            console.log('✅ Admin user created successfully!');
        }

        console.log('\nLogin credentials:');
        console.log('Username: admin');
        console.log('Password: admin123');

        // Verify the user was created
        const [users] = await connection.execute(
            'SELECT user_id, username, email, role, created_at FROM users WHERE username = ?',
            ['admin']
        );
        console.log('\nUser in database:', users[0]);

        await connection.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createAdmin();
