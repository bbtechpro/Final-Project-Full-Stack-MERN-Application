// controllers/taskController.js
const taskService = require('../services/taskService');
const catchAsync = require('../utils/catchAsync');

exports.createTask = catchAsync(async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user._id;

  const task = await taskService.createNewTask({
    projectId,
    userId,
    taskData: req.validatedBody
  });

  return res.status(201).json(task);
});

exports.getProjectTasks = catchAsync(async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user._id;

  const tasks = await taskService.fetchTasksByProject({ projectId, userId });
  return res.status(200).json(tasks);
});

exports.updateTask = catchAsync(async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user._id;

  const updatedTask = await taskService.modifyTask({
    taskId,
    userId,
    updateData: req.validatedBody
  });

  return res.status(200).json(updatedTask);
});

exports.deleteTask = catchAsync(async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user._id;

  await taskService.removeTask({ taskId, userId });
  return res.status(200).json({ message: 'Task deleted!' });
});
