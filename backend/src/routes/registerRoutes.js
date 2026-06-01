// routes/registerRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Map endpoints directly to the controller actions
router.post('/', authController.registerUser);
router.all('/', authController.methodNotAllowed);

module.exports = router;
