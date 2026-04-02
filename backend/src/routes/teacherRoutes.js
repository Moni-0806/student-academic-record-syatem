const express = require('express');
const router = express.Router();
const {
    getTeachers,
    getTeacherById,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    getHomeroomTeachers
} = require('../controllers/teacherController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateTeacher } = require('../middleware/validationMiddleware');

router.route('/')
    .get(protect, getTeachers)
    .post(protect, authorize('admin'), validateTeacher, createTeacher);

router.get('/homeroom', protect, getHomeroomTeachers);

// Get ALL assignments for the logged-in teacher (all classes they teach)
router.get('/my-assignment', protect, async (req, res) => {
    try {
        const db = require('../config/database');
        const [teachers] = await db.query(
            `SELECT teacher_id, teacher_name FROM teachers WHERE user_id = ?`,
            [req.user.user_id]
        );
        if (!teachers.length) {
            return res.status(404).json({ success: false, message: 'No teacher record found for this user' });
        }
        const { teacher_id, teacher_name } = teachers[0];

        // Get ALL class/subject assignments for this teacher
        const [assignments] = await db.query(`
            SELECT csa.assignment_id, csa.academic_year, csa.semester,
                   s.subject_name, s.subject_id, s.max_mark,
                   c.class_name, c.grade_level, c.class_id
            FROM class_subject_assignments csa
            JOIN subjects s ON csa.subject_id = s.subject_id
            JOIN classes c ON csa.class_id = c.class_id
            WHERE csa.teacher_id = ?
            ORDER BY c.class_name, s.subject_name
        `, [teacher_id]);

        if (!assignments.length) {
            return res.status(404).json({ success: false, message: 'No class assignment found for this teacher. Please contact admin.' });
        }

        // For each assignment, load the students in that class
        const result = [];
        for (const a of assignments) {
            const [students] = await db.query(
                `SELECT student_id, student_name, student_code FROM students WHERE class_id = ? ORDER BY student_name`,
                [a.class_id]
            );
            result.push({ ...a, teacher_name, students });
        }

        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get homeroom class full marks view (all subjects, all students) for the logged-in homeroom teacher
router.get('/my-homeroom-marks', protect, async (req, res) => {
    try {
        const db = require('../config/database');

        // Find teacher_id from user
        const [teachers] = await db.query(
            `SELECT teacher_id, teacher_name FROM teachers WHERE user_id = ?`,
            [req.user.user_id]
        );
        if (!teachers.length) {
            return res.status(404).json({ success: false, message: 'No teacher record found' });
        }
        const { teacher_id, teacher_name } = teachers[0];

        // Check if this teacher is a homeroom teacher
        const [homerooms] = await db.query(`
            SELECT ha.class_id, ha.academic_year, ha.semester,
                   c.class_name, c.grade_level
            FROM homeroom_assignments ha
            JOIN classes c ON ha.class_id = c.class_id
            WHERE ha.teacher_id = ?
            ORDER BY ha.academic_year DESC, ha.semester DESC
        `, [teacher_id]);

        if (!homerooms.length) {
            return res.json({ success: true, data: null, isHomeroom: false });
        }

        // Use the most recent homeroom assignment
        const hr = homerooms[0];

        // Get all subjects assigned to this class
        const [subjects] = await db.query(`
            SELECT DISTINCT s.subject_id, s.subject_name, s.subject_code, s.max_mark,
                   t.teacher_name as subject_teacher
            FROM class_subject_assignments csa
            JOIN subjects s ON csa.subject_id = s.subject_id
            JOIN teachers t ON csa.teacher_id = t.teacher_id
            WHERE csa.class_id = ? AND csa.academic_year = ? AND csa.semester = ?
            ORDER BY s.subject_name
        `, [hr.class_id, hr.academic_year, hr.semester]);

        // Get all students in this class
        const [students] = await db.query(
            `SELECT student_id, student_name, student_code FROM students WHERE class_id = ? ORDER BY student_name`,
            [hr.class_id]
        );

        // Get all marks for this class/year/semester
        const [marks] = await db.query(`
            SELECT m.student_id, m.subject_id, m.mark
            FROM marks m
            JOIN students s ON m.student_id = s.student_id
            WHERE s.class_id = ? AND m.academic_year = ? AND m.semester = ?
        `, [hr.class_id, hr.academic_year, hr.semester]);

        // Build marks map: { studentId-subjectId: mark }
        const marksMap = {};
        marks.forEach(m => { marksMap[`${m.student_id}-${m.subject_id}`] = m.mark; });

        res.json({
            success: true,
            isHomeroom: true,
            data: {
                teacher_name,
                class_name: hr.class_name,
                grade_level: hr.grade_level,
                academic_year: hr.academic_year,
                semester: hr.semester,
                class_id: hr.class_id,
                subjects,
                students,
                marksMap
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
router.get('/assignments', protect, async (req, res) => {
    try {
        const db = require('../config/database');
        const [rows] = await db.query(`
            SELECT csa.assignment_id, csa.academic_year, csa.semester,
                   t.teacher_name, t.email, t.teacher_id,
                   s.subject_name, s.subject_id,
                   c.class_name, c.grade_level, c.class_id
            FROM class_subject_assignments csa
            JOIN teachers t ON csa.teacher_id = t.teacher_id
            JOIN subjects s ON csa.subject_id = s.subject_id
            JOIN classes c ON csa.class_id = c.class_id
            ORDER BY c.class_name, s.subject_name
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/assignments', protect, authorize('admin'), async (req, res) => {
    try {
        const db = require('../config/database');
        const { class_id, subject_id, teacher_id, academic_year, semester } = req.body;
        await db.query(
            `INSERT INTO class_subject_assignments (class_id, subject_id, teacher_id, academic_year, semester)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE teacher_id = VALUES(teacher_id)`,
            [class_id, subject_id, teacher_id, academic_year, semester]
        );
        res.json({ success: true, message: 'Teacher assigned successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/assignments/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const db = require('../config/database');
        await db.query(`DELETE FROM class_subject_assignments WHERE assignment_id = ?`, [req.params.id]);
        res.json({ success: true, message: 'Assignment deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/homeroom-list', protect, async (req, res) => {
    try {
        const db = require('../config/database');
        const [rows] = await db.query(`
            SELECT ha.assignment_id, ha.academic_year, ha.semester,
                   t.teacher_name, t.email, t.teacher_id,
                   c.class_name, c.grade_level, c.class_id
            FROM homeroom_assignments ha
            JOIN teachers t ON ha.teacher_id = t.teacher_id
            JOIN classes c ON ha.class_id = c.class_id
            ORDER BY c.class_name
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/homeroom-list', protect, authorize('admin'), async (req, res) => {
    try {
        const db = require('../config/database');
        const { class_id, teacher_id, semester } = req.body;

        // Get academic_year from the class itself
        const [classRows] = await db.query(`SELECT academic_year FROM classes WHERE class_id = ?`, [class_id]);
        if (!classRows.length) return res.status(404).json({ success: false, message: 'Class not found' });
        const academic_year = classRows[0].academic_year;

        // Check if this class already has a homeroom teacher for this semester
        const [existingClass] = await db.query(
            `SELECT * FROM homeroom_assignments WHERE class_id = ? AND academic_year = ? AND semester = ?`,
            [class_id, academic_year, semester]
        );
        if (existingClass.length > 0) {
            return res.status(400).json({ success: false, message: 'A homeroom teacher is already assigned to this class for this semester.' });
        }

        // Check if this teacher is already a homeroom teacher for any class
        const [existingTeacher] = await db.query(
            `SELECT ha.*, c.class_name FROM homeroom_assignments ha
             JOIN classes c ON ha.class_id = c.class_id
             WHERE ha.teacher_id = ?`,
            [teacher_id]
        );
        if (existingTeacher.length > 0) {
            return res.status(400).json({ success: false, message: `This teacher is already a homeroom teacher for class "${existingTeacher[0].class_name}". A teacher can only be homeroom teacher for one class.` });
        }

        await db.query(
            `INSERT INTO homeroom_assignments (class_id, teacher_id, academic_year, semester) VALUES (?, ?, ?, ?)`,
            [class_id, teacher_id, academic_year, semester]
        );
        res.json({ success: true, message: 'Homeroom teacher assigned successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/homeroom-list/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const db = require('../config/database');
        await db.query(`DELETE FROM homeroom_assignments WHERE assignment_id = ?`, [req.params.id]);
        res.json({ success: true, message: 'Homeroom assignment deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Homeroom teacher submits all marks to admin
router.post('/submit-to-admin', protect, async (req, res) => {
    try {
        const db = require('../config/database');
        const [teachers] = await db.query(
            `SELECT teacher_id FROM teachers WHERE user_id = ?`, [req.user.user_id]
        );
        if (!teachers.length) return res.status(404).json({ success: false, message: 'Teacher not found' });
        const teacher_id = teachers[0].teacher_id;

        const { class_id, academic_year, semester } = req.body;

        // Block if marks already finalized by admin
        const [finalized] = await db.query(
            `SELECT finalization_id FROM mark_finalizations WHERE class_id = ? AND academic_year = ? AND semester = ?`,
            [class_id, academic_year, semester]
        );
        if (finalized.length > 0) {
            return res.status(403).json({ success: false, message: 'Marks for this class have been finalized by admin and cannot be edited.' });
        }

        // Verify this teacher is the homeroom teacher for this class
        const [hr] = await db.query(
            `SELECT * FROM homeroom_assignments WHERE class_id = ? AND teacher_id = ? AND academic_year = ? AND semester = ?`,
            [class_id, teacher_id, academic_year, semester]
        );
        if (!hr.length) return res.status(403).json({ success: false, message: 'You are not the homeroom teacher for this class' });

        await db.query(
            `INSERT INTO homeroom_submissions (class_id, teacher_id, academic_year, semester)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE submitted_at = CURRENT_TIMESTAMP, teacher_id = VALUES(teacher_id)`,
            [class_id, teacher_id, academic_year, semester]
        );
        res.json({ success: true, message: 'Marks submitted to admin successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Check if homeroom has submitted for a class
router.get('/submission-status', protect, async (req, res) => {
    try {
        const db = require('../config/database');
        const { class_id, academic_year, semester } = req.query;
        const [rows] = await db.query(
            `SELECT submitted_at FROM homeroom_submissions WHERE class_id = ? AND academic_year = ? AND semester = ?`,
            [class_id, academic_year, semester]
        );
        res.json({ success: true, submitted: rows.length > 0, submitted_at: rows[0]?.submitted_at || null });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get latest submission for a class (any year/semester) - for admin to auto-detect
router.get('/latest-submission', protect, async (req, res) => {
    try {
        const db = require('../config/database');
        const { class_id } = req.query;
        const [rows] = await db.query(
            `SELECT academic_year, semester, submitted_at FROM homeroom_submissions WHERE class_id = ? ORDER BY submitted_at DESC LIMIT 1`,
            [class_id]
        );
        if (!rows.length) return res.json({ success: true, found: false });
        res.json({ success: true, found: true, academic_year: rows[0].academic_year, semester: String(rows[0].semester), submitted_at: rows[0].submitted_at });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.route('/:id')
    .get(protect, getTeacherById)
    .put(protect, authorize('admin'), validateTeacher, updateTeacher)
    .delete(protect, authorize('admin'), deleteTeacher);

module.exports = router;
