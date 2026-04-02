const ClassModel = require('../models/classModel');

// Get all classes
exports.getAllClasses = async (req, res) => {
    try {
        const classes = await ClassModel.findAll();
        res.json({ success: true, data: classes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get class by ID
exports.getClassById = async (req, res) => {
    try {
        const classData = await ClassModel.findById(req.params.id);
        if (!classData) {
            return res.status(404).json({ success: false, message: 'Class not found' });
        }
        res.json({ success: true, data: classData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get class with homeroom teacher
exports.getClassWithHomeroom = async (req, res) => {
    try {
        const { academicYear, semester } = req.query;
        const classData = await ClassModel.findWithHomeroom(req.params.id, academicYear, semester);
        if (!classData) {
            return res.status(404).json({ success: false, message: 'Class not found' });
        }
        res.json({ success: true, data: classData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create new class
exports.createClass = async (req, res) => {
    try {
        const classId = await ClassModel.create(req.body);
        const classData = await ClassModel.findById(classId);
        res.status(201).json({ success: true, data: classData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update class
exports.updateClass = async (req, res) => {
    try {
        const affectedRows = await ClassModel.update(req.params.id, req.body);
        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Class not found' });
        }
        const classData = await ClassModel.findById(req.params.id);
        res.json({ success: true, data: classData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete class
exports.deleteClass = async (req, res) => {
    try {
        const affectedRows = await ClassModel.delete(req.params.id);
        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Class not found' });
        }
        res.json({ success: true, message: 'Class deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
