const express = require('express');
const cors = require('cors');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// Import routes
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const classRoutes = require('./routes/classRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const markRoutes = require('./routes/markRoutes');
const reportRoutes = require('./routes/reportRoutes');
const homeroomRoutes = require('./routes/homeroomRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/marks', markRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/homeroom', homeroomRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is running' });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
