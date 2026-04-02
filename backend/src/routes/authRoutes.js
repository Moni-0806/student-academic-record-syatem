const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validateLogin, validate } = require('../middleware/validationMiddleware');

router.post('/login', validateLogin, validate, authController.login);
router.post('/register', authController.register);
router.get('/me', protect, authController.getCurrentUser);
router.post('/change-password', protect, authController.changePassword);

module.exports = router;
