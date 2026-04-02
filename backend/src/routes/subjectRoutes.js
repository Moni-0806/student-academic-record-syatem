const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');
const { protect } = require('../middleware/authMiddleware');
const { validateSubject, validate } = require('../middleware/validationMiddleware');

// All routes require authentication
router.use(protect);

router.get('/', subjectController.getAllSubjects);
router.get('/:id', subjectController.getSubjectById);
router.post('/', validateSubject, validate, subjectController.createSubject);
router.put('/:id', validateSubject, validate, subjectController.updateSubject);
router.delete('/:id', subjectController.deleteSubject);

module.exports = router;
