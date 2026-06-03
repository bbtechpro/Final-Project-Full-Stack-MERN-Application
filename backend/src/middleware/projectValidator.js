// middlewares/projectValidator.js
const { z } = require('zod');

// Regex pattern to catch basic HTML elements (<script>, <div>, etc.)
const htmlSanitizeRegex = /<[^>]*>/g;

const projectCreateSchema = z.object({
  name: z.string({ error: 'Project name is required.' })
    .min(3, 'Project name must be at least 3 characters long.')
    .max(50, 'Project name cannot exceed 50 characters.')
    .trim()
    .refine((val) => !htmlSanitizeRegex.test(val), {
      message: 'Project name cannot contain HTML or script tags.'
    }),
    
  description: z.string({ error: 'Project description is required.' })
    .min(10, 'Project description must be at least 10 characters long.')
    .max(1000, 'Project description cannot exceed 1000 characters.')
    .trim()
    .refine((val) => !htmlSanitizeRegex.test(val), {
      message: 'Project description cannot contain HTML or script tags.'
    })
});

// STREAMLINED & TRACEABLE VALIDATOR
const validateProjectCreation = (req, res, next) => {
  try {
    // console.log('VALIDATOR DETECTED: Scanning req.body...', req.body);

    // Parse and validate the incoming request body
    const validatedData = projectCreateSchema.parse(req.body);
    
    // Attach the clean, validated data directly to the request object
    req.validatedBody = validatedData;
    
    // console.log('VALIDATOR SUCCESS: Data matches schema. Forwarding to controller...');
    
    // THIS MUST RUN TO MOVE TO THE CONTROLLER (STEP 1)
    return next(); 
    
  } catch (error) {
    // console.log('VALIDATOR FAILED: Trapped validation or parsing error.');

    if (error instanceof z.ZodError) {
      // Collect all validation issues into an array and return an immediate response
      const errorMessages = error.issues.map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        messages: errorMessages 
      });
    }
    
    // Pass other unexpected errors to global error handler
    return next(error);
  }
};

module.exports = { validateProjectCreation };
