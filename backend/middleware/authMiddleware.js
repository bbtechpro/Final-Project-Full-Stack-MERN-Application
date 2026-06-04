// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/userSchema');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const util = require('util'); // 🌟 Node.js built-in utility

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  // 1. Extract the token from auth headers or cookies
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]; // 🌟 Ensure index [1] to grab only the hash string
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw new AppError('You are not logged in. Please log in to get access.', 401);
  }

  // 2. Safely verify token using a clean async wrapper instead of "new Promise"
  // This forces any secret mismatch or expiration errors to immediately go to your global handler
  const verifyJwt = util.promisify(jwt.verify);
  const decoded = await verifyJwt(token, process.env.JWT_SECRET);

  // console.log('🔍 Decoded inside updated protect:', decoded);

  // 3. Confirm target database user account exists (Checking both id and _id formats)
  const targetId = decoded.id || decoded._id;
  const currentUser = await User.findById(targetId);
  
  if (!currentUser) {
    throw new AppError('The user belonging to this token no longer exists.', 401);
  }

  // 4. Attach identity information for controllers down the pipeline
  req.user = currentUser;

  // 5. Move forward safely
  next(); 
});


// Higher-order function to restrict access based on roles
exports.restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    // 1. Double check that protect middleware ran first
    if (!req.user) {
      return next(new AppError('Authentication context missing. Run protect middleware first.', 500));
    }

    // 2. Check if the logged-in user's role is included in the allowedRoles array
    if (!allowedRoles.includes(req.user.role)) {
      // 403 Forbidden means authenticated, but explicitly lacks authorization clearance
      return next(new AppError('You do not have permission to perform this action.', 403));
    }

    // 3. User has the correct role, proceed to the controller
    next();
  };
};


