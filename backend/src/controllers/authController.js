// controllers/authController.js
const authService = require('../services/authService');
const catchAsync = require('../utils/catchAsync'); 

exports.registerUser = catchAsync(async (req, res) => {
  const body = req.body || {};
  const query = req.query || {};
    const combinedData = { ...query, ...body };

    console.log('Register route hit:', req.method, req.originalUrl, 'content-type=', req.headers['content-type'], 'body=', body, 'query=', query, 'combined=', combinedData);

    // Normalize incoming input fields from varying keys/casings
    const username = combinedData.username || combinedData.Username || combinedData.userName;
    const email = (combinedData.email || combinedData.Email || '').toLowerCase().trim();
    const password = combinedData.password || combinedData.Password;

    // Fast-fail: Required field validation (HTTP Layer responsibility)
    if (!username || !email || !password) {
      return res.status(400).json({ 
        message: 'Username, email and password are required.', 
        receivedKeys: Object.keys(combinedData), 
        expectedKeys: ['username', 'email', 'password'],
        note: 'Send as JSON body with Content-Type: application/json, or as query parameters' 
      });
    }

    // Fast-fail: Password format validation
    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }

    // Delegate creation to the Business Logic Layer
    const registeredUser = await authService.registerNewUser({ username, email, password });
    return res.status(201).json(registeredUser);

  } catch (err) {
    console.error('Registration processing error:', err);

    // Handle distinct operational errors thrown by Mongoose or the Service Layer
    if (err.message === 'Email already exists') {
      return res.status(400).json({ message: 'A user with that email already exists.' });
    }
    
    if (err.code === 11000) {
      return res.status(400).json({ message: 'A user with that username or email already exists.' });
    }

    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message).join(', ');
      return res.status(400).json({ message: messages });
    }

    return res.status(500).json({ message: 'Server error', error: err.message });
  };

exports.loginUser = catchAsync(async (req, res) => {
  const body = req.body || {};
  const query = req.query || {};
  const combinedData = { ...query, ...body };

    const { email: rawEmail, password } = combinedData;
    const email = (rawEmail || '').toLowerCase().trim();

    // Fast-fail: Required input validation
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required.', 
        receivedKeys: Object.keys(combinedData), 
        expectedKeys: ['email', 'password'],
        note: 'Send data as JSON body with Content-Type: application/json, or as query parameters' 
      });
    }

    // Delegate verification and token signing to the Service Layer
    const authData = await authService.authenticateUser({ email, password });
    return res.status(200).json(authData);

  } catch (err) {
    console.error('Login processing error:', err);

    // Security practice: Return a generic "Incorrect email or password" error
    if (err.message === 'Invalid credentials') {
      return res.status(400).json({ message: 'Incorrect email or password.' });
    }

    return res.status(500).json({ message: 'Server error', error: err.message });
  };  

exports.logoutUser = catchAsync(async (req, res) => {
  try {
    // If you use cookies, clear them here:
    // res.clearCookie('token'); 

    return res.status(200).json({ 
      success: true, 
      message: 'Logged out successfully.' 
    });
  } catch (err) {
    console.error('Logout processing error:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during logout' 
    });
  }
});

exports.methodNotAllowed = (req, res) => {
  return res.status(405).json({ 
    success: false, 
    message: `Method ${req.method} not allowed on this endpoint.` 
  });
};
