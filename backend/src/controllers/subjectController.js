const SubjectModel = require('../models/subjectModel');

// Get all subjects
exports.getAllSubjects = async (req, res) => {
    try {
        const subjects = await SubjectModel.findAll();
        res.json({ success: true, data: subjects });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get subject by ID
exports.getSubjectById = async (req, res) => {
    try {
        const subject = await SubjectModel.findById(req.params.id);
        if (!subject) {
            return res.status(404).json({ success: false, message: 'Subject not found' });
        }
        res.json({ success: true, data: subject });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create new subject
exports.createSubject = async (req, res) => {
    try {
        const subjectId = await SubjectModel.create(req.body);
        const subject = await SubjectModel.findById(subjectId);
        res.status(201).json({ success: true, data: subject });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update subject
exports.updateSubject = async (req, res) => {
    try {
        const affectedRows = await SubjectModel.update(req.params.id, req.body);
        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Subject not found' });
        }
        const subject = await SubjectModel.findById(req.params.id);
        res.json({ success: true, data: subject });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete subject
exports.deleteSubject = async (req, res) => {
    try {
        const affectedRows = await SubjectModel.delete(req.params.id);
        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Subject not found' });
        }
        res.json({ success: true, message: 'Subject deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
