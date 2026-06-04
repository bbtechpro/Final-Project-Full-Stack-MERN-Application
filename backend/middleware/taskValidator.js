// middleware/taskValidator.js
const { z } = require('zod');

// 1. Define the reusable Zod Task Schema shape
const taskCreateSchema = z.object({
  title: z.string({ error: 'Task title is required.' })
    .min(3, 'Task title must be at least 3 characters long.')
    .trim(),
    
  description: z.string({ error: 'Task description is required.' })
    .min(5, 'Task description must be at least 5 characters long.')
    .trim(),

  // Enforce the strict Mongoose enum array constraint
  status: z.enum(['To Do', 'In Progress', 'Done'], {
    error: "Status must be exactly 'To Do', 'In Progress', or 'Done'."
  }).default('To Do')
});

// 2. Define an update schema where all fields are optional (for PUT/PATCH updates)
const taskUpdateSchema = taskCreateSchema.partial();

// 3. Middleware for handling Creation Validation
const validateTaskCreation = (req, res, next) => {
  try {
    req.validatedBody = taskCreateSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        messages: error.issues.map(err => err.message) 
      });
    }
    next(error);
  }
};

// 4. Middleware for handling Update Validation
const validateTaskUpdate = (req, res, next) => {
  try {
    req.validatedBody = taskUpdateSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        messages: error.issues.map(err => err.message) 
      });
    }
    next(error);
  }
};

module.exports = { validateTaskCreation, validateTaskUpdate };
