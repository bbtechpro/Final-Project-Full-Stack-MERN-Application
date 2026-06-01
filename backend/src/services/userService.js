// services/userService.js
const User = require('../models/userSchema');
const AppError = require('../utils/AppError'); // Import the AppError class

exports.fetchAllUsers = async () => {
  return await User.find().select('-password');
};

exports.createNewUser = async ({ username, email, password }) => {
  // Business/Domain Rule Validation
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    throw new AppError('User already exists');
  }

  const newUser = new User({ username, email, password });
  await newUser.save();

  const userObj = newUser.toObject();
  delete userObj.password;
  return userObj;
};

exports.fetchUserById = async (id) => {
  return await User.findById(id).select('-password');
};

exports.replaceUser = async (id, updates) => {
  return await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).select('-password');
};

exports.modifyUser = async (id, updates) => {
  return await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).select('-password');
};

exports.removeUser = async (id) => {
  return await User.findByIdAndDelete(id);
};
