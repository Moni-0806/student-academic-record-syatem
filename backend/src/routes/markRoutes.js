const express = require('express');
const router = express.Router();
const markController = require('../controllers/markController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateMark, validate } = require('../middleware/validationMiddleware');

// All routes require authentication
router.use(protect);

// Get subjects assigned to a class for a given year/semester
router.get('/class-subjects', protect, async (req, res) => {
    try {
        const db = require('../config/database');
        const { classId, academicYear, semester } = req.query;
        const [rows] = await db.query(`
            SELECT DISTINCT s.subject_id, s.subject_name, s.subject_code, s.max_mark
            FROM class_subject_assignments csa
            JOIN subjects s ON csa.subject_id = s.subject_id
            WHERE csa.class_id = ? AND csa.academic_year = ? AND csa.semester = ?
            ORDER BY s.subject_name
        `, [classId, academicYear, semester]);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/student/:studentId', markController.getStudentMarks);
router.get('/student/:studentId/stats', markController.getStudentStats);
router.get('/class', markController.getClassMarks);
// Teacher direct access to class marks (bypasses submission gate)
router.get('/class/teacher', protect, async (req, res) => {
    try {
        const MarkModel = require('../models/markModel');
        const { classId, academicYear, semester } = req.query;
        const marks = await MarkModel.findByClass(classId, academicYear, semester);
        res.json({ success: true, data: marks, submitted: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Check if marks are finalized for a class
router.get('/finalization-status', protect, async (req, res) => {
    try {
        const db = require('../config/database');
        const { classId, academicYear, semester } = req.query;
        const [rows] = await db.query(
            `SELECT finalized_at FROM mark_finalizations WHERE class_id = ? AND academic_year = ? AND semester = ?`,
            [classId, academicYear, semester]
        );
        res.json({ success: true, finalized: rows.length > 0, finalized_at: rows[0]?.finalized_at || null });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Admin finalizes (saves) marks - locks them from editing
router.post('/finalize', protect, authorize('admin'), async (req, res) => {
    try {
        const db = require('../config/database');
        const { class_id, academic_year, semester } = req.body;
        await db.query(
            `INSERT INTO mark_finalizations (class_id, academic_year, semester)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE finalized_at = CURRENT_TIMESTAMP`,
            [class_id, academic_year, semester]
        );
        res.json({ success: true, message: 'Marks finalized successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/', validateMark, validate, markController.upsertMark);
router.put('/:id', markController.updateMark);
router.delete('/:id', markController.deleteMark);

module.exports = router;
