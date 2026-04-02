const StudentModel = require('../models/studentModel');

// Get all students
exports.getStudents = async (req, res) => {
    try {
        const students = await StudentModel.findAll();
        res.json({ success: true, data: students });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get student by ID
exports.getStudentById = async (req, res) => {
    try {
        const student = await StudentModel.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        res.json({ success: true, data: student });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get students by class
exports.getStudentsByClass = async (req, res) => {
    try {
        const classId = req.params.classId;
        const students = await StudentModel.findByClass(classId);
        res.json({ success: true, data: students });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create new student
exports.createStudent = async (req, res) => {
    try {
        const studentId = await StudentModel.create(req.body);
        const student = await StudentModel.findById(studentId);
        res.status(201).json({ success: true, data: student });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update student
exports.updateStudent = async (req, res) => {
    try {
        const affectedRows = await StudentModel.update(req.params.id, req.body);
        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        const student = await StudentModel.findById(req.params.id);
        res.json({ success: true, data: student });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete student
exports.deleteStudent = async (req, res) => {
    try {
        const affectedRows = await StudentModel.delete(req.params.id);
        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        res.json({ success: true, message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
