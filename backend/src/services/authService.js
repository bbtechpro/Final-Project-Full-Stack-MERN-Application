// services/authService.js
const User = require('../models/userSchema');

/**
 * Registers a user with validated, pre-formatted data fields.
 * @param {Object} userData - Contains sanitized username, email, and password.
 * @returns {Promise<Object>} The newly created user object without password field.
 */
exports.registerNewUser = async ({ username, email, password }) => {
  // Domain validation: verify target email is unique
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('Email already exists');
  }

  // Persist schema to MongoDB
  const newUser = new User({ username, email, password });
  await newUser.save();

  // Strip secure credentials from database model object output
  const userObj = newUser.toObject();
  delete userObj.password;
  
  return userObj;
};
