const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'student_records',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 2,
    queueLimit: 10,
    idleTimeout: 10000,
    maxIdle: 1
});

console.log('✓ Database pool created');

module.exports = pool;
