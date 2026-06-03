// middleware/validate.js
const { z } = require('zod');

// 1. Define the shape of a valid registration payload (Zod v4 syntax)
const registerSchema = z.object({
  username: z.string({ error: 'Username is required' })
    .min(3, 'Username must be at least 3 characters long')
    .trim(),
  email: z.string({ error: 'Email is required' })
    .email('Invalid email format')
    .trim()
    .toLowerCase(),
  password: z.string({ error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters long'),
});

// 2. Generic validation middleware runner
const validateRegistration = (req, res, next) => {
  try {
    // Standardize input from body or query string, just like your old setup did
    const combinedData = { ...(req.query || {}), ...(req.body || {}) };
    
    // Normalize keys so Zod can validate them reliably
    const normalizedData = {
      username: combinedData.username || combinedData.Username || combinedData.userName,
      email: combinedData.email || combinedData.Email,
      password: combinedData.password || combinedData.Password
    };

    // Parse data against schema. Throws error if validation fails.
    registerSchema.parse(normalizedData);
    
    // Attach validated, clean data back to the request object for the controller
    req.validatedBody = normalizedData; 
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Extract clean error messages to send back to client
      // Zod v4 uses .issues instead of .errors
      const errorMessages = error.issues.map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        messages: errorMessages 
      });
    }
    next(error);
  }
};

module.exports = { validateRegistration };
