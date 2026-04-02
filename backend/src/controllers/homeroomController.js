const HomeroomModel = require('../models/homeroomModel');

// Get all homeroom assignments
exports.getAllAssignments = async (req, res) => {
    try {
        const assignments = await HomeroomModel.findAll();
        res.json({ success: true, data: assignments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get homeroom assignment for a class
exports.getAssignmentByClass = async (req, res) => {
    try {
        const { classId, academicYear, semester } = req.query;
        const assignment = await HomeroomModel.findByClass(classId, academicYear, semester);
        res.json({ success: true, data: assignment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create or update homeroom assignment
exports.upsertAssignment = async (req, res) => {
    try {
        const assignmentId = await HomeroomModel.upsert(req.body);
        res.json({ success: true, data: { assignment_id: assignmentId } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete homeroom assignment
exports.deleteAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        await HomeroomModel.delete(id);
        res.json({ success: true, message: 'Homeroom assignment deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
