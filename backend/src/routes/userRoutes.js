// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Mount sub-routers early to avoid /:id conflicts
router.use('/register', require('./registerRoutes'));
router.use('/login', require('./loginRoutes'));

// Route definitions mapped directly to controllers
router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);

router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.patch('/:id', userController.patchUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
