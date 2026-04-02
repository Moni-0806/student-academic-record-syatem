const TeacherModel = require('../models/teacherModel');
const UserModel = require('../models/userModel');
const bcrypt = require('bcryptjs');

// Get all teachers
exports.getTeachers = async (req, res) => {
    try {
        const teachers = await TeacherModel.findAll();
        res.json({ success: true, data: teachers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get homeroom teachers
exports.getHomeroomTeachers = async (req, res) => {
    try {
        const teachers = await TeacherModel.findHomeroom();
        res.json({ success: true, data: teachers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get teacher by ID
exports.getTeacherById = async (req, res) => {
    try {
        const teacher = await TeacherModel.findById(req.params.id);
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }
        res.json({ success: true, data: teacher });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get teachers by department
exports.getTeachersByDepartment = async (req, res) => {
    try {
        const teachers = await TeacherModel.findByDepartment(req.params.departmentId);
        res.json({ success: true, data: teachers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create new teacher
exports.createTeacher = async (req, res) => {
    try {
        console.log('=== CREATE TEACHER REQUEST ===');
        console.log('Request body:', JSON.stringify(req.body, null, 2));

        const { username, password, subject_id, class_id, academic_year, semester, is_homeroom, ...teacherData } = req.body;

        console.log('Extracted username:', username);
        console.log('Extracted password:', password ? '[PROVIDED]' : '[MISSING]');

        // Get subject to find its department
        let department_id = teacherData.department_id || null;
        if (subject_id) {
            const SubjectModel = require('../models/subjectModel');
            const subject = await SubjectModel.findById(subject_id);
            if (subject) department_id = subject.department_id;
        }

        // Create user account - username and password are required
        let userId = null;
        if (username && password) {
            userId = await UserModel.create({
                username: username.trim(),
                password: password,
                email: teacherData.email,
                role: 'teacher'
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required for teacher login'
            });
        }

        // Create teacher
        const teacherId = await TeacherModel.create({
            ...teacherData,
            subject_id: subject_id || null,
            department_id: department_id,
            user_id: userId
        });

        // Save class assignment if provided
        if (class_id && subject_id && academic_year && semester) {
            const db = require('../config/database');
            await db.query(
                `INSERT INTO class_subject_assignments (class_id, subject_id, teacher_id, academic_year, semester)
                 VALUES (?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE teacher_id = VALUES(teacher_id)`,
                [class_id, subject_id, teacherId, academic_year, semester]
            );

            // Only assign as homeroom if explicitly checked AND no homeroom teacher exists yet for this class
            const isHomeroom = is_homeroom === true || is_homeroom === 'true';
            console.log('is_homeroom value:', is_homeroom, '=> isHomeroom:', isHomeroom);

            if (isHomeroom) {
                // Check if homeroom already assigned for this class/semester
                const [existing] = await db.query(
                    `SELECT * FROM homeroom_assignments WHERE class_id = ? AND academic_year = ? AND semester = ?`,
                    [class_id, academic_year, semester]
                );
                if (existing.length > 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'A homeroom teacher is already assigned to this class for this semester.'
                    });
                }
                await db.query(
                    `INSERT INTO homeroom_assignments (class_id, teacher_id, academic_year, semester)
                     VALUES (?, ?, ?, ?)`,
                    [class_id, teacherId, academic_year, semester]
                );
            }
        }

        const teacher = await TeacherModel.findById(teacherId);
        res.status(201).json({ success: true, data: teacher });
    } catch (error) {
        console.error('Error creating teacher:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update teacher
exports.updateTeacher = async (req, res) => {
    try {
        const affectedRows = await TeacherModel.update(req.params.id, req.body);
        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }
        const teacher = await TeacherModel.findById(req.params.id);
        res.json({ success: true, data: teacher });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete teacher
exports.deleteTeacher = async (req, res) => {
    try {
        // Get teacher first to find the user_id
        const teacher = await TeacherModel.findById(req.params.id);
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        const userId = teacher.user_id;

        // Delete teacher (this also cascades to assignments)
        await TeacherModel.delete(req.params.id);

        // Also delete the associated user account so username can be reused
        if (userId) {
            await UserModel.delete(userId);
        }

        res.json({ success: true, message: 'Teacher deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
