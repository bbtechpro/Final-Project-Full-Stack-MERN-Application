// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error('Global Error Intercepted:', err);

  // Set default fallback values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'An unexpected server error occurred';
  let errors = null;

  // Handle Mongoose Duplicate Key Errors (MongoDB code 11000)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `A user with that ${field} already exists.`;
  }

  // Handle Mongoose Schema Validation Errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Database validation failed';
    errors = Object.values(err.errors).map(e => e.message);
  }

  // Handle Operational Application Errors (like "Email already exists")
  if (err.isOperational) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Send uniform JSON response back to client
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }), // Only include errors array if it exists
    // Include stack trace only during local development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
