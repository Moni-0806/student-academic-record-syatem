const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const { protect } = require('../middleware/authMiddleware');
const { validateClass, validate } = require('../middleware/validationMiddleware');

// All routes require authentication
router.use(protect);

router.get('/', classController.getAllClasses);
router.get('/:id', classController.getClassById);
router.get('/:id/homeroom', classController.getClassWithHomeroom);
router.post('/', validateClass, validate, classController.createClass);
router.put('/:id', validateClass, validate, classController.updateClass);
router.delete('/:id', classController.deleteClass);

module.exports = router;
