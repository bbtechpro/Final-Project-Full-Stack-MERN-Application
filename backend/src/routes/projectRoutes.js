// routes/projectRoutes.js
const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
// Validation middleware for project creation and updates
const validateProjectCreation = (req, res, next) => {
  const { name, description } = req.validatedBody || {};
  next();
  // This function will be implemented in the middleware file
};  

// Protected Endpoints (user must be logged in to see their projects)
router.get('/', protect, projectController.getAllProjects);
router.get('/:id', protect, projectController.getProjectById);

// Protected Endpoints (Requires Login)
// Note: We inject the 'protect' middleware to automatically populate req.user
router.post('/', protect, validateProjectCreation, projectController.createProject);
router.put('/:id', protect, validateProjectCreation, projectController.updateProject);
router.delete('/:id', protect, validateProjectCreation, projectController.deleteProject);

module.exports = router;
