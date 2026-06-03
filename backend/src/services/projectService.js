// services/projectService.js
const { Project } = require('../models/projectSchema');
const AppError = require('../utils/AppError');

exports.fetchAllProjects = async (userId) => {
  // Only return projects owned by the requesting user
  return await Project.find({ user: userId }).populate('user', 'username email');
};

exports.fetchProjectById = async (id, userId) => {
  // Only return the project if it belongs to the requesting user
  return await Project.findOne({ _id: id, user: userId }).populate('user', 'username email');
};

exports.createNewProject = async ({ name, description, userId }) => {
  console.log('Step 2: Creating project with:', { name, description, userId }); // Trace the inputs
  const newProject = new Project({
    name,
    description,
    user: userId // Map ownership to the requesting user
  });
  console.log('Step 3: New project instance created:', newProject); // Confirm instance creation before save
  await newProject.save();
  console.log('Step 4: Project saved to DB with ID:', newProject._id); // Confirm DB save and ID assignment
  return newProject;
};

exports.modifyProject = async (projectId, userId, updates) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  // Enforce Authorization Check: Does this user own this project?
  if (project.user.toString() !== userId.toString()) {
    throw new AppError('You do not have permission to modify this project', 403);
  }

  // Apply updates safely
  if (updates.name !== undefined) project.name = updates.name;
  if (updates.description !== undefined) project.description = updates.description;

  await project.save();
  return project;
};

exports.removeProject = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  // Enforce Authorization Check: Does this user own this project?
  if (project.user.toString() !== userId.toString()) {
    throw new AppError('You do not have permission to delete this project', 403);
  }

  await Project.findByIdAndDelete(projectId);
};
