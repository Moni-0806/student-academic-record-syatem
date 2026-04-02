const express = require('express');
const router = express.Router();
const homeroomController = require('../controllers/homeroomController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

router.get('/', homeroomController.getAllAssignments);
router.get('/class', homeroomController.getAssignmentByClass);
router.post('/', homeroomController.upsertAssignment);
router.delete('/:id', homeroomController.deleteAssignment);

module.exports = router;
