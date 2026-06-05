// app.js
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();

// Read the variable you set in Heroku
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:3000'; 

app.use(cors({
  origin: allowedOrigin,
  credentials: true // Allow cookies/sessions if your app uses them
}));

// Import Custom Global Middlewares
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/appError');

// Import Layered Routers
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const projectRouter = require('./routes/projectRoutes');
const taskRouter = require('./routes/taskRoutes');

// 1. GLOBAL MIDDLEWARE
app.use(express.json()); // Parses application/json incoming payloads
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded bodies
app.use(cookieParser()); // Parses HTTP-Only cookies for refresh token tracking

// 2. MOUNT ROUTE MODULES
app.use('/api/auth', authRouter);     // Login, Register, Logout, Refresh
app.use('/api/users', userRouter);     // User profiles management
app.use('/api/projects', projectRouter); // Project creation & retrieval
app.use('/api', taskRouter);          // Tasks endpoints (handles nested & direct routes)

// 3. FALLBACK: UNHANDLED ROUTE CATCHER
// If a request falls through all the routers above, it doesn't exist
app.all('/*splat', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 4. CENTRAL OVERRIDE: GLOBAL ERROR HANDLER
// MUST BE AT THE VERY BOTTOM OF THE CHAIN
app.use(errorHandler);

module.exports = app;
