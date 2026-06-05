// server.js
const mongoose = require('mongoose')
const app = require('./app');
const dotenv = require('dotenv');
const path = require('path');
// This finds your .env file relative to server.js regardless of where you open your terminal
dotenv.config({ path: path.join(__dirname, './.env') }); 


// 1. CATCH UNCAUGHT EXCEPTIONS (Synchronous code bugs, e.g., using an undefined variable)
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down gracefully...');
  console.error(err.name, err.message, err.stack);
  process.exit(1); 
});

// 2. LOAD ENVIRONMENT VARIABLES
dotenv.config({ path: './.env' });
const app = require('./app');

// 3. ESTABLISH MONGODB CONNECTION
const DB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/project_manager';

mongoose.connect(DB_URI)
  .then(() => console.log('DB Connection Successful!'))
  .catch((err) => {
    console.error('DB Connection Error:', err);
    process.exit(1);
  });

// 4. START THE SERVER LISTENER
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Application running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
});

// 5. CATCH UNHANDLED REJECTIONS (Asynchronous code bugs like failed DB queries outside try/catch)
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down server...');
  console.error(err.name, err.message);
  
  // Close the server cleanly before killing the process
  server.close(() => {
    process.exit(1);
  });
});
