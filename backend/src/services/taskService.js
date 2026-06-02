// services/taskService.js
const { Task } = require('../models/taskSchema');
const { Project } = require('../models/projectSchema');
const AppError = require('../utils/AppError');

/**
 * Helper function to verify that a project exists and belongs to the active user.
 */
async function verifyProjectOwnership(projectId, userId) {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new AppError('No project found with this id!', 404);
  }
  if (project.user.toString() !== userId.toString()) {
    throw new AppError('User is not authorized to manage tasks for this project.', 403);
  }
  return project;
}

exports.createNewTask = async ({ projectId, userId, taskData }) => {
  // Ensure project exists and belongs to user
  const project = await verifyProjectOwnership(projectId, userId);

  // Combine validated project identity with incoming title/description/status payload
  const task = await Task.create({
    ...taskData,
    project: project._id,
  });

  return task;
};

exports.fetchTasksByProject = async ({ projectId, userId }) => {
  // Ensure user has rights to view this project's tasks
  const project = await verifyProjectOwnership(projectId, userId);

  return await Task.find({ project: project._id });
};

exports.modifyTask = async ({ taskId, userId, updateData }) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new AppError('No task found with this id!', 404);
  }

  // Find parent project and confirm user owns it
  await verifyProjectOwnership(task.project, userId);

  // Return the updated document directly
  return await Task.findByIdAndUpdate(taskId, updateData, {
    new: true,
    runValidators: true,
  });
};

exports.removeTask = async ({ taskId, userId }) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new AppError('No task found with this id!', 404);
  }

  // Find parent project and confirm user owns it
  await verifyProjectOwnership(task.project, userId);

  await Task.findByIdAndDelete(taskId);
};
