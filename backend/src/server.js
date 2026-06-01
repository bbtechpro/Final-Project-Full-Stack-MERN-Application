// server.js
const express = require('express');
const app = express();
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');

// Parse global middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount central routers
app.use('/api/auth', authRouter); // Accessible via: /api/auth/register and /api/auth/login
app.use('/api/users', userRouter); // Accessible via: /api/users, /api/users/:id

module.exports = app;
