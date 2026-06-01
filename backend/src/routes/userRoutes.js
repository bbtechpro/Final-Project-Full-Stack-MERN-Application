// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Mount sub-routers early to avoid /:id conflicts
router.use('/register', require('./registerRoutes'));
router.use('/login', require('./loginRoutes'));

// Route definitions mapped directly to controllers
router.get('/', protect, restrictTo('admin'),  userController.getAllUsers);
router.post('/', protect, restrictTo('admin'), userController.createUser);

router.get('/:id', protect, restrictTo('admin'), userController.getUserById);
router.put('/:id', protect, restrictTo('admin'), userController.updateUser);
router.patch('/:id', protect, restrictTo('admin'), userController.patchUser);
router.delete('/:id', protect, restrictTo('admin'), userController.deleteUser);

module.exports = router;
