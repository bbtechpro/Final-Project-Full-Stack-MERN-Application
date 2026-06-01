// controllers/userController.js
const userService = require('../services/userService');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await userService.fetchAllUsers();
    return res.status(200).json({ success: true, data: users });
  } catch (err) {
    console.error('Error fetching users:', err);
    return res.status(500).json({ success: false, message: 'Error fetching users' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { username, email, password } = req.body || {};
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide username, email and password' });
    }

    const newUser = await userService.createNewUser({ username, email, password });
    return res.status(201).json({ success: true, data: newUser });
  } catch (err) {
    console.error('Error creating user:', err);
    if (err.message === 'User already exists') {
      return res.status(400).json({ success: false, message: 'A user with that username or email already exists.' });
    }
    return res.status(500).json({ success: false, message: 'Error creating user' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await userService.fetchUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error('Error fetching user by ID:', err);
    return res.status(500).json({ success: false, message: 'Error fetching user' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const updates = { username: req.body.username, email: req.body.email };
    const user = await userService.replaceUser(req.params.id, updates);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error('Error updating user:', err);
    return res.status(500).json({ success: false, message: 'Error updating user' });
  }
};

exports.patchUser = async (req, res) => {
  try {
    const updates = {};
    if (req.body.username !== undefined) updates.username = req.body.username;
    if (req.body.email !== undefined) updates.email = req.body.email;
    if (req.body.password !== undefined) updates.password = req.body.password;

    const user = await userService.modifyUser(req.params.id, updates);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error('Error patching user:', err);
    return res.status(500).json({ success: false, message: 'Error patching user' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await userService.removeUser(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    return res.status(500).json({ success: false, message: 'Error deleting user' });
  }
};
