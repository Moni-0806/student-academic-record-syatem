const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Class report with all calculations (Total, Average, Rank, Status)
router.get('/class', reportController.getClassReport);

// Individual student report
router.get('/student/:studentId', reportController.getStudentReport);

// Subject-wise performance analysis
router.get('/subject-performance', reportController.getSubjectPerformance);

// Overall statistics
router.get('/statistics', reportController.getOverallStatistics);

module.exports = router;
