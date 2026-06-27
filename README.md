# Project Camp Backend

## Overview
Project Camp Backend is a RESTful project management API built with Node.js, Express, and MongoDB. The application supports user authentication, JWT-based authorization, project creation, member management, and health checking.

## What is implemented
- User authentication with registration, login, logout, JWT access tokens, refresh tokens, and password reset flows
- Email verification support via verification tokens
- Project CRUD operations: create, read, update, delete
- Project member management: add members, list members, update roles, remove members
- Role-based access control for project endpoints
- Health check endpoint

## Tech stack
- Node.js
- Express.js
- MongoDB with Mongoose
- JSON Web Tokens (JWT)
- Multer for file uploads (task attachment support present in models/controllers)
- Nodemailer + Mailgen for email notifications
- express-validator for request validation

## Project structure
- `src/index.js` — app entry point and database connection
- `src/app.js` — Express setup, middleware, route registration
- `src/routes/` — route definitions for auth, projects, and healthcheck
- `src/controllers/` — controller logic for auth, projects, tasks, and healthcheck
- `src/models/` — MongoDB schemas for users, projects, members, tasks, subtasks, and notes
- `src/middlewares/` — auth and validation middleware
- `src/utils/` — response and error helpers, email utilities, async handler
- `src/validators/` — validation rules for request payloads

## Setup
1. Install dependencies
   ```bash
   npm install
   ```
2. Create a `.env` file at the repository root with the required variables:
   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/project-management
   ACCESS_TOKEN_SECRET=your-access-token-secret
   ACCESS_TOKEN_EXPIRY=15m
   REFRESH_TOKEN_SECRET=your-refresh-token-secret
   REFRESH_TOKEN_EXPIRY=7d
   SERVER_URL=http://localhost:3000
   CORS_ORIGIN=http://localhost:5173
   MAIL_TRAP_SMTP_HOST=smtp.mailtrap.io
   MAIL_TRAP_SMTP_PORT=2525
   MAIL_TRAP_SMTP_USER=your-mailtrap-user
   MAIL_TRAP_SMTP_PASS=your-mailtrap-pass
   ```
3. Start the app
   ```bash
   npm run dev
   ```

## Available API endpoints

### Health Check
- `GET /api/v1/healthcheck/`
  - Returns server status

### Authentication
- `POST /api/v1/auth/register`
  - Body: `email`, `username`, `password`, optional `fullName`
- `POST /api/v1/auth/login`
  - Body: `email`, `password`
- `POST /api/v1/auth/logout`
  - Requires JWT access token
- `GET /api/v1/auth/verify-email/:verificationToken`
- `POST /api/v1/auth/refresh-token`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password/:resetToken`
- `POST /api/v1/auth/current-user`
  - Requires JWT access token
- `POST /api/v1/auth/change-password`
  - Requires JWT access token
- `POST /api/v1/auth/resend-email-varification`
  - Requires JWT access token

### Projects
All project routes require authentication.
- `GET /api/v1/projects/`
  - Get projects for the authenticated user
- `POST /api/v1/projects/`
  - Create a project
- `GET /api/v1/projects/:projectId`
  - Get project details
- `PUT /api/v1/projects/:projectId`
  - Update project (Admin only)
- `DELETE /api/v1/projects/:projectId`
  - Delete project (Admin only)
- `GET /api/v1/projects/:projectId/members`
  - List project members
- `POST /api/v1/projects/:projectId/members`
  - Add a member (Admin only)
- `PUT /api/v1/projects/:projectId/members/:userId`
  - Update member role (Admin only)
- `DELETE /api/v1/projects/:projectId/members/:userId`
  - Remove member (Admin only)



