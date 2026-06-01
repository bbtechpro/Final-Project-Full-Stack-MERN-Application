// controllers/userController.js
const userService = require('../services/userService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await userService.fetchAllUsers();
  return res.status(200).json({ success: true, data: users });
});

exports.createUser = catchAsync(async (req, res) => {
  const { username, email, password } = req.body || {};
  
  if (!username || !email || !password) {
    throw new AppError('Please provide username, email and password', 400);
  }

  const newUser = await userService.createNewUser({ username, email, password });
  return res.status(201).json({ success: true, data: newUser });
});

exports.getUserById = catchAsync(async (req, res) => {
  const user = await userService.fetchUserById(req.params.id);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  return res.status(200).json({ success: true, data: user });
});

exports.updateUser = catchAsync(async (req, res) => {
  const updates = { username: req.body.username, email: req.body.email };
  const user = await userService.replaceUser(req.params.id, updates);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  return res.status(200).json({ success: true, data: user });
});

exports.patchUser = catchAsync(async (req, res) => {
  const updates = {};
  if (req.body.username !== undefined) updates.username = req.body.username;
  if (req.body.email !== undefined) updates.email = req.body.email;
  if (req.body.password !== undefined) updates.password = req.body.password;

  const user = await userService.modifyUser(req.params.id, updates);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  return res.status(200).json({ success: true, data: user });
});

exports.deleteUser = catchAsync(async (req, res) => {
  const user = await userService.removeUser(req.params.id);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  return res.status(200).json({ success: true, message: 'User deleted successfully' });
});
