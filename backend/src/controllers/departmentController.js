const DepartmentModel = require('../models/departmentModel');

// Get all departments
exports.getAllDepartments = async (req, res) => {
    try {
        const departments = await DepartmentModel.findAll();
        res.json({ success: true, data: departments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get department by ID
exports.getDepartmentById = async (req, res) => {
    try {
        const department = await DepartmentModel.findById(req.params.id);
        if (!department) {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }
        res.json({ success: true, data: department });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create new department
exports.createDepartment = async (req, res) => {
    try {
        const departmentId = await DepartmentModel.create(req.body);
        const department = await DepartmentModel.findById(departmentId);
        res.status(201).json({ success: true, data: department });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update department
exports.updateDepartment = async (req, res) => {
    try {
        const affectedRows = await DepartmentModel.update(req.params.id, req.body);
        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }
        const department = await DepartmentModel.findById(req.params.id);
        res.json({ success: true, data: department });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete department
exports.deleteDepartment = async (req, res) => {
    try {
        const affectedRows = await DepartmentModel.delete(req.params.id);
        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }
        res.json({ success: true, message: 'Department deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
