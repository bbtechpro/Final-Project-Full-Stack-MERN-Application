// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegistration } = require('../middleware/validate'); // Import

// Drop the validation middleware right before the controller function
router.post('/register', validateRegistration, authController.registerUser);
router.post('/login', authController.loginUser);

// Map logout endpoint to controller action
router.post('/logout', authController.logoutUser);
router.all('/logout', authController.methodNotAllowed);

// Explicitly handle invalid methods for the auth paths
router.all('/register', authController.methodNotAllowed);
router.all('/login', authController.methodNotAllowed);

module.exports = router;

