const express = require('express');
const router = express.Router();
const {
    getStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
    getStudentsByClass
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateStudent } = require('../middleware/validationMiddleware');

router.route('/')
    .get(protect, getStudents)
    .post(protect, authorize('admin', 'homeroom_teacher'), validateStudent, createStudent);

router.get('/class/:classId', protect, getStudentsByClass);

router.route('/:id')
    .get(protect, getStudentById)
    .put(protect, authorize('admin', 'homeroom_teacher'), validateStudent, updateStudent)
    .delete(protect, authorize('admin'), deleteStudent);

module.exports = router;
