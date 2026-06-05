This capstone project is the culmination of your journey through the MERN stack curriculum. It is designed to challenge you to integrate everything you have learned — from backend architecture and database design to frontend state management and deployment — into a single, polished, and real-world application. You are expected to reuse and expand upon the patterns and code you developed in previous modules, particularly the “TaskMaster” API and the deployment labs.

Core Features & User Stories
“User Stories” are a way to capture the requirements of the project from the perspective of the user.

Here are the user stories for this project:

User Management:
As a new user, I can create an account and log in.
As a logged-in user, my session is managed securely, and I can log out.
Project Management:
As a logged-in user, I can create new projects, giving them a name and description.
I can view a dashboard of all the projects I have created.
I can view the details of a single project.
I can update or delete only the projects that I own.
Task Management:
Within a project I own, I can create new tasks with a title, description, and status (e.g., ‘To Do’, ‘In Progress’, ‘Done’).
I can view all tasks belonging to a specific project.
I can update the details or status of any task within a project I own.
I can delete tasks from a project I own.
Collaboration (Stretch Goal):
As a project owner, I can invite other registered users to collaborate on my project.
As a collaborator, I can view and update tasks within a project I’ve been invited to.
Technical Requirements
Backend (Node.js, Express, MongoDB)
Modular API: Structure your API with a clear separation of concerns (e.g., models, routes, controllers, middleware).
RESTful Endpoints: Design and implement a full suite of RESTful API endpoints for Users, Projects, and Tasks.
Database Schemas: Create robust Mongoose schemas for User, Project, and Task models, establishing clear relationships using ref.
Authentication: Implement secure user registration and login using JWTs. All sensitive routes must be protected.
Authorization: Implement strict, ownership-based authorization. A user must only be able to view or modify data they own. This is the most critical security requirement.
Password Security: Hash all user passwords using bcrypt before storing them in the database, preferably using a pre-save hook in your User model.
Frontend (React)
Component-Based Architecture: Build the UI using small, reusable functional components.
State Management: Use useState for local component state and the Context API for managing global state (like user authentication).
Client-Side Routing: Use a library like react-router-dom to create a single-page application (SPA) experience with distinct pages/views for login, registration, a project dashboard, and individual project details.
API Integration: Fetch data from your backend API to dynamically render content. All authenticated requests must include the user’s JWT.
User Experience: The application should provide clear feedback for loading and error states.
Responsive Design: The UI must be fully responsive and usable on desktop, tablet, and mobile screen sizes.

Document your API design in your README.md.
Setup & Structure: Ensure your backend has a clean, modular structure and that all secrets are managed via a .env file (which must be in .gitignore).
Authentication: Implement robust user registration and login. Create reusable authentication middleware to protect your API routes.
Phase 2: Core Backend API
Project API: Build the full CRUD API for projects (/api/projects). Every endpoint must verify that the logged-in user is the owner of the resource being requested.
Task API: Build the full CRUD API for tasks. These routes should be nested under projects (e.g., POST /api/projects/:projectId/tasks) and must include authorization checks to ensure the user owns the parent project.
Phase 3: Frontend Development
Project Setup: Create a new React application using a tool like Vite.
Routing & Pages: Set up client-side routing and create page components for all the main views (Dashboard, Project Page, Login, etc.).
Authentication Flow: Implement the full login/registration flow. Use the Context API to provide authentication status and user data throughout the application. Store the JWT securely in the browser.
Build UI Components: Develop a library of reusable components for displaying projects, tasks, forms, buttons, etc.
Connect to API: Integrate your components with your live backend API to perform all CRUD operations. Implement loading and error states for a smooth user experience.

Deployed Frontend: [Pro-Tasker-Mission-Control](https://tasker-pro-mission-control.onrender.com/).

Deployed Backend: [Pro-Tasker-Mission-Control-Bac](https://tasker-pro-mission-control-bac-563fdce478ba.herokuapp.com/).

[] Add future feture
^ Drag and Drop

Share a Challenge: Deployment was my biggest challenge dur to using a monorepo and not having the proper file structure.

Share a Success: I learned about using Zod: Zod is a schema declaration and validation library for JavaScript and TypeScript. It allows you to build a "blueprint" (schema) of what your data should look like, and then checks unknown data at runtime to guarantee it matches that blueprint.
Why Developers Use It
While tools like TypeScript check your data types during development, they vanish once code is compiled into raw JavaScript. Zod fills this gap by acting as a security guard for live data entering your application from unpredictable external sources.
Common validation use cases include:
•	User Input: Verifying web form submissions before processing them.
•	API Responses: Ensuring an external server payload actually has the exact properties your code expects.
•	Environment Variables: Confirming crucial server config variables are loaded and formatted correctly.
•	AI Ecosystems: Parsing unstructured data streams from LLMs into reliable, structured JSON objects.

Project structure:

project-management-app/
├── backend/
│   ├── config/          # Database and external connections

│   ├── controllers/     # Request handlers and business logic, request & response handling (The Manager)

│   ├── middleware/      # Auth protection and validation schemas, global error handlers

│   ├── models/          # Mongoose database schemas
│   ├── routes/          # Express API route definitions, purely endpoint definitions (The Map)
services/           # Core business & domain logic (The Worker)
│   ├── server.js        # App entry point

│   └── .env             # Environment variables (secrets)
└── frontend/            # React application
└── app.js              # Server initialization and middleware mounting 
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
// If a request falls through all the routers above.
// 4. CENTRAL OVERRIDE: GLOBAL ERROR HANDLER
// MUST BE AT THE VERY BOTTOM OF THE CHAIN

frontend\src\components\Badge.tsx
frontend\src\components\Button.tsx
frontend\src\components\ConfirmModal.tsx
frontend\src\components\Input.tsx
frontend\src\components\ProtectedRoute.tsx

frontend\src\context\AuthContext.tsx

frontend\src\interfaces\index.ts

frontend\src\pages\AuthPage.tsx
frontend\src\pages\Dashboard.tsx
frontend\src\pages\LandingPage.tsx
frontend\src\pages\ProjectPage.tsx

frontend\src\App.css
frontend\src\App.tsx
frontend\src\index.css
frontend\src\main.tsx


