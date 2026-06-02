// routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { validateTaskCreation, validateTaskUpdate } = require('../middleware/taskValidator');

// Project-nested endpoints (Creation and List reading)
router.post('/projects/:projectId/tasks', protect, validateTaskCreation, taskController.createTask);
router.get('/projects/:projectId/tasks', protect, taskController.getProjectTasks);

// Direct Task manipulation endpoints
router.put('/tasks/:taskId', protect, validateTaskUpdate, taskController.updateTask);
router.delete('/tasks/:taskId', protect, taskController.deleteTask);

module.exports = router;
