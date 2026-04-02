const { body, validationResult } = require('express-validator');

// Validation error handler
exports.validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
};

// Student validation rules
exports.validateStudent = [
    body('student_name').notEmpty().withMessage('Student name is required'),
    body('gender').isIn(['M', 'F']).withMessage('Gender must be M or F'),
    body('class_id').isInt().withMessage('Valid class ID is required'),
    body('academic_year').notEmpty().withMessage('Academic year is required'),
    body('semester').isIn([1, 2]).withMessage('Semester must be 1 or 2')
];

// Mark validation rules
exports.validateMark = [
    body('student_id').isInt().withMessage('Valid student ID is required'),
    body('subject_id').isInt().withMessage('Valid subject ID is required'),
    body('mark_value').isFloat({ min: 0, max: 100 }).withMessage('Mark must be between 0 and 100'),
    body('academic_year').notEmpty().withMessage('Academic year is required'),
    body('semester').isIn([1, 2]).withMessage('Semester must be 1 or 2')
];

// Teacher validation rules
exports.validateTeacher = [
    body('teacher_name').notEmpty().withMessage('Teacher name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('department_id').isInt().withMessage('Valid department ID is required')
];

// Subject validation rules
exports.validateSubject = [
    body('subject_name').notEmpty().withMessage('Subject name is required'),
    body('max_marks').optional().isInt({ min: 1, max: 100 }).withMessage('Max marks must be between 1 and 100'),
    body('department_id').isInt().withMessage('Valid department ID is required')
];

// Class validation rules
exports.validateClass = [
    body('class_name').notEmpty().withMessage('Class name is required'),
    body('grade_level').notEmpty().withMessage('Grade level is required'),
    body('academic_year').notEmpty().withMessage('Academic year is required')
];

// Login validation rules
exports.validateLogin = [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
];
