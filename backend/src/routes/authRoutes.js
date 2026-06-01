// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Map clean auth endpoints to controller handlers
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);

// Explicitly handle invalid methods for the auth paths
router.all('/register', authController.methodNotAllowed);
router.all('/login', authController.methodNotAllowed);

module.exports = router;
