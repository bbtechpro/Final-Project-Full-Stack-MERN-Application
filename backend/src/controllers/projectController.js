// controllers/projectController.js
const projectService = require('../services/projectService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getAllProjects = catchAsync(async (req, res) => {
  const projects = await projectService.fetchAllProjects();
  return res.status(200).json({ success: true, data: projects });
});

exports.getProjectById = catchAsync(async (req, res) => {
  const project = await projectService.fetchProjectById(req.params.id);
  if (!project) {
    throw new AppError('Project not found', 404);
  }
  return res.status(200).json({ success: true, data: project });
});

exports.createProject = catchAsync(async (req, res) => {
  // console.log('Step 1: Received project creation request with body:', req.body); // Debug log to trace incoming data
  // console.log(req.validatedBody); // Confirm that validation middleware is populating this field correctly
  const { name, description } = req.body || {};

  // console.log('Step 1.5: Validated body extracted:', { name, description }); // Confirm validation output
  if (!name || !description) {
    throw new AppError('Project name and description are required', 400);
  }

  // Grab the logged-in user's ID directly from the auth middleware assignment
  const userId = req.user._id;

  const newProject = await projectService.createNewProject({ name, description, userId });
  return res.status(201).json({ success: true, data: newProject });
});

exports.updateProject = catchAsync(async (req, res) => {
  const { name, description } = req.body || {};
  const projectId = req.params.id;
  const userId = req.user._id;

  const updatedProject = await projectService.modifyProject(projectId, userId, { name, description });
  return res.status(200).json({ success: true, data: updatedProject });
});

exports.deleteProject = catchAsync(async (req, res) => {
  const projectId = req.params.id;
  const userId = req.user._id;

  await projectService.removeProject(projectId, userId);
  return res.status(200).json({ success: true, message: 'Project deleted successfully' });
});
