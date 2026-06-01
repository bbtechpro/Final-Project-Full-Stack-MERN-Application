// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/userSchema');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  // 1. Check if the token arrives via the Authorization Header (Bearer Token)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // 2. Fallback: Check if the token arrives via an HTTP-Only Cookie
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // If no token is found, block access immediately
  if (!token) {
    throw new AppError('You are not logged in. Please log in to get access.', 401);
  }

  // 3. Verify the token signature against your server environment secret
  // Note: jwt.verify is typically callback-based, so we wrap it or use util.promisify
  const decoded = await new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
      if (err) return reject(new AppError('Invalid or expired token. Please log in again.', 401));
      resolve(payload);
    });
  });

  // 4. Check if the user associated with the token still exists in MongoDB
  const currentUser = await User.findById(decoded._id || decoded.id);
  if (!currentUser) {
    throw new AppError('The user belonging to this token no longer exists.', 401);
  }

  // SUCCESS: Grant access and attach the user record to the request object
  req.user = currentUser;
  next();
});
