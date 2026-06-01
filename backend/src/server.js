// server.js
const express = require('express');
const app = express();
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const cors = require('cors');
const PORT = process.env.PORT || 5000;
const errorHandler = require('./middleware/errorHandler');

// Enable CORS for all routes (adjust as needed for production)
app.use(cors());

// Parse global middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount central routers
app.use('/api/auth', authRouter); // Accessible via: /api/auth/register and /api/auth/login
app.use('/api/users', userRouter); // Accessible via: /api/users, /api/users/:id

// Global error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
