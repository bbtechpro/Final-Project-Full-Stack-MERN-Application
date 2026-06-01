// routes/loginRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Map login endpoint directly to the controller action
router.post('/', authController.loginUser);

module.exports = router;
