const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

router.get('/', departmentController.getAllDepartments);
router.get('/:id', departmentController.getDepartmentById);
router.post('/', departmentController.createDepartment);
router.put('/:id', departmentController.updateDepartment);
router.delete('/:id', departmentController.deleteDepartment);

module.exports = router;
