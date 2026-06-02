// services/authService.js
const User = require('../models/userSchema');
const AppError = require('../utils/AppError');
const bcrypt = require('bcrypt');

exports.authenticateUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError('Incorrect email or password.', 400);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError('Incorrect email or password.', 400);
  }

  return user;
};

exports.registerNewUser = async ({ username, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    // Instantly communicates a 400 Bad Request to the error middleware
    throw new AppError('A user with that email already exists.', 400); 
  }

  const newUser = new User({ username, email, password });
  await newUser.save(); // If Mongo throws a 11000 duplicate error, it bubbles up cleanly

  const userObj = newUser.toObject();
  delete userObj.password;
  
  return userObj;
};
