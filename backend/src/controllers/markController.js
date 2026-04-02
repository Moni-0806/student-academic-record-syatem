const MarkModel = require('../models/markModel');

// Get marks for a student
exports.getStudentMarks = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { academicYear, semester } = req.query;
        const marks = await MarkModel.findByStudent(studentId, academicYear, semester);
        res.json({ success: true, data: marks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get marks for a class (admin only sees marks after homeroom teacher has submitted)
exports.getClassMarks = async (req, res) => {
    try {
        const { classId, academicYear, semester } = req.query;
        const db = require('../config/database');

        // If admin, check if homeroom has submitted first
        if (req.user.role === 'admin') {
            const [submission] = await db.query(
                `SELECT submission_id FROM homeroom_submissions WHERE class_id = ? AND academic_year = ? AND semester = ?`,
                [classId, academicYear, semester]
            );
            if (!submission.length) {
                return res.json({ success: true, data: [], submitted: false, message: 'Marks not yet submitted by homeroom teacher' });
            }
        }

        const marks = await MarkModel.findByClass(classId, academicYear, semester);
        res.json({ success: true, data: marks, submitted: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create or update mark
exports.upsertMark = async (req, res) => {
    try {
        const { student_id, subject_id, academic_year, semester } = req.body;
        const db = require('../config/database');

        // Get the class_id for this student
        const [studentRows] = await db.query(
            `SELECT class_id FROM students WHERE student_id = ?`, [student_id]
        );
        if (studentRows.length > 0) {
            const class_id = studentRows[0].class_id;
            // Check if marks are finalized for this class/year/semester
            const [finalized] = await db.query(
                `SELECT finalization_id FROM mark_finalizations WHERE class_id = ? AND academic_year = ? AND semester = ?`,
                [class_id, academic_year, semester]
            );
            if (finalized.length > 0) {
                return res.status(403).json({
                    success: false,
                    message: 'Marks for this class have been finalized by admin and cannot be edited.'
                });
            }
        }

        const result = await MarkModel.upsert(req.body);
        res.json({ success: true, message: 'Mark saved successfully', data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update mark
exports.updateMark = async (req, res) => {
    try {
        const { mark } = req.body;
        const affectedRows = await MarkModel.update(req.params.id, mark);
        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Mark not found' });
        }
        res.json({ success: true, message: 'Mark updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete mark
exports.deleteMark = async (req, res) => {
    try {
        const affectedRows = await MarkModel.delete(req.params.id);
        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Mark not found' });
        }
        res.json({ success: true, message: 'Mark deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get student statistics
exports.getStudentStats = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { academicYear, semester } = req.query;
        const stats = await MarkModel.getStudentStats(studentId, academicYear, semester);
        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
