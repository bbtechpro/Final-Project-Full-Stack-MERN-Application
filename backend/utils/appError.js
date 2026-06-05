// utils/appError.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Marks it as a known application error, not a crash
    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = AppError;
