# Pendown - System Architecture

This document describes the architecture of the Pendown notes application, including system design, data flow, component relationships, and technical decisions.

## Table of Contents
- [System Overview](#system-overview)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Database Schema](#database-schema)
- [Authentication Flow](#authentication-flow)
- [Data Flow](#data-flow)
- [Component Structure](#component-structure)
- [State Management](#state-management)

---

## System Overview

Pendown is a full-stack MERN application with a clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                  Browser / Client                       │
│          (React App, Tailwind CSS, Vite)                │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP REST
                         │ JSON requests/responses
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Express.js REST API Server                 │
│    (Routing, Controllers, Middleware, Validation)       │
└────────────────────────┬────────────────────────────────┘
                         │ Mongoose ODM
                         │ Document queries
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  MongoDB Database                       │
│        (Users, Notes, Sessions, Tokens)                 │
└─────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Page Structure

```
App.jsx (Root)
├── Home (Landing page)
├── Login (Authentication)
├── Register (User signup)
├── ForgotPassword (Password recovery)
├── ResetPassword (Token-based password reset)
├── NotesList (Main notes view with sidebar)
│   ├── SearchBar (Find notes)
│   ├── TagFilter (Category selection)
│   ├── SortDropdown (Ordering options)
│   └── NoteGrid (Note cards)
├── NoteForm (Create/Edit note)
│   ├── RichTextEditor (TipTap editor)
│   └── ColorPickerModal (Note styling)
└── ComingSoon (Placeholder page)
```

### Component Hierarchy

**Layout Components:**
- `PrivateRoute.jsx` - Route protection with auth check
- Layout wrapper for consistent structure

**Feature Components:**
- `RichTextEditor.jsx` - TipTap V3 editor with formatting toolbar
- `ColorPickerModal.jsx` - Circular color palette (12 colors + hex input)
- `InputModal.jsx` - Generic modal for text input
- `ConfirmDialog.jsx` - Reusable confirmation dialog with isDangerous prop
- `Snackbar.jsx` - Toast notification renderer

**Context Providers:**
- `NotificationContext.jsx` - Global notification state
- `ThemeContext.jsx` - Light/dark mode state
- `authContext.jsx` - User authentication state and token management

### State Management

**React Context API:**
1. **AuthContext** - User login, logout, token storage, auto-logout
2. **ThemeContext** - Dark/light mode preference
3. **NotificationContext** - Toast notification queue and lifecycle

**React Query:**
- Handles server state (notes data, user profile)
- Caching and automatic refetching
- Loading and error states managed per endpoint

**Local Component State:**
- Form inputs in NoteForm
- Filter selections in NotesList (search, tags, sort, page)
- Modal visibility toggles
- Editor content in RichTextEditor

### Frontend API Client

**apiClient.js:**
- Base Axios configuration
- Automatic JWT token injection in headers
- Centralized base URL management
- Request/response interceptors

**api.js:**
- Service functions for all endpoints
- Abstracts HTTP calls into business logic functions
- Handles queryClient updates after mutations

### Data Flow in NotesList

1. Component mounts → fetches notes via React Query
2. User interacts with filters (search, tags, sort) → updates local state
3. Local filter state applied to raw data client-side
4. Filtered/sorted results displayed in grid
5. User clicks note → navigates to NoteForm with note ID
6. Changes confirmed before leaving unsaved note

---

## Backend Architecture

### Request Pipeline

```
HTTP Request
    │
    ▼
Router (Express)
    │
    ▼
Authentication Middleware (JWT verification)
    │
    ▼
Request Validation Middleware (express-validator)
    │
    ▼
Request Logging Middleware (Pino)
    │
    ▼
Controller (Business logic orchestration)
    │
    ├── Service Layer (Core business logic)
    │   │
    │   ├── Database queries via Mongoose
    │   │
    │   └── External services (Email)
    │
    ▼
Response/Error
    │
    ▼
Error Handler Middleware (Global exception handler)
    │
    ▼
HTTP Response
```

### API Routes

**Authentication Routes (/auth)**
- `POST /register` - Create user account
- `POST /login` - Authenticate and get JWT
- `POST /forgot-password` - Send reset email
- `POST /reset-password/:token` - Update password
- `GET /me` - Get current user profile

**Notes Routes (/notes)**
- `POST /` - Create note
- `GET /` - List user's notes (paginated, searchable, filterable)
- `GET /tags` - Get all user's tags
- `GET /:id` - Fetch single note
- `PUT /:id` - Update note
- `DELETE /:id` - Delete note

### Project Structure

```
src/
├── app.js                  # Express app configuration
├── server.js               # Entry point, environment setup
├── swagger.js             # OpenAPI 3.0 configuration
│
├── config/
│   ├── database.js       # MongoDB connection
│   ├── emailer.js        # SMTP email service
│   └── logger.js         # Pino logger setup
│
├── controllers/
│   ├── authController.js  # Auth endpoint handlers
│   └── notesController.js # Notes endpoint handlers
│
├── middleware/
│   ├── authMiddleware.js  # JWT verification
│   ├── errorHandler.js    # Global error handler
│   └── requestLogger.js   # Request logging with Pino
│
├── models/
│   ├── User.js           # User MongoDB schema
│   └── Note.js           # Note MongoDB schema
│
├── routes/
│   ├── authRoutes.js     # Auth routes with JSDoc comments
│   └── notesRoutes.js    # Notes routes with JSDoc comments
│
├── services/
│   ├── authService.js    # Auth business logic
│   └── notesService.js   # Notes CRUD logic
│
└── utils/
    └── errors.js         # Custom error classes
```

### Middleware Stack

**Authentication Middleware** (`authMiddleware.js`)
- Extracts JWT from Authorization header
- Verifies token validity
- Attaches user ID to request object
- Throws error if token missing or invalid

**Error Handler Middleware** (`errorHandler.js`)
- Catches all errors from routes and services
- Formats error responses consistently
- Logs errors with Pino
- Returns appropriate HTTP status codes

**Request Logger Middleware** (`requestLogger.js`)
- Logs all incoming requests with method, URL, user ID
- Logs response time and status code
- Useful for debugging and monitoring

**Validation Middleware** (express-validator)
- Applied per route definition
- Validates request body and parameters
- Returns 400 with validation file on failure
- Prevents invalid data from reaching controllers

---

## Database Schema

### User Collection

```javascript
{
  _id: ObjectId,
  username: String (unique, 3-50 chars),
  email: String (unique),
  firstName: String (optional),
  lastName: String (optional),
  password: String (hashed with bcryptjs),
  resetToken: String (optional, for password reset),
  resetTokenExpire: Date (optional),
  createdAt: Date,
  updatedAt: Date
}
```

### Note Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId (reference to User),
  title: String (required),
  content: String (HTML from TipTap editor),
  color: String (hex code, default "#FFFFFF"),
  tags: Array<String>,
  pinned: Boolean (default false),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `userId` index for fast user note queries
- Compound index on `userId + createdAt` for efficient sorting

---

## Authentication Flow

### Registration Flow

```
User Form Input
    │ (username, email, password)
    ▼
Frontend validation
    │
    ▼
POST /auth/register
    │
    ▼
Express validation (express-validator)
    │
    ▼
authController.register()
    │
    ▼
authService.register()
    ├── Check email uniqueness
    ├── Check username uniqueness
    ├── Hash password with bcryptjs
    └── Create user document
    │
    ▼
Response (user data, no token)
    │
    ▼
Frontend redirects to login
```

### Login Flow

```
User Credentials
    │ (email, password)
    ▼
Frontend validation
    │
    ▼
POST /auth/login
    │
    ▼
authController.login()
    │
    ▼
authService.login()
    ├── Find user by email
    ├── Compare password with hash
    ├── Generate JWT token (7 days expiry)
    └── Return token
    │
    ▼
Response (token, user data)
    │
    ▼
Frontend stores token in localStorage
    │
    ▼
Subsequent requests include token in Authorization header
```

### Protected Route Access

```
Request with JWT token
    │
    ▼
authMiddleware.authenticate()
    │
    ├── Check Authorization header
    ├── Extract token
    ├── Verify token signature and expiry
    ├── Extract user ID from token payload
    └── Attach user ID to request
    │
    ▼
Route handler executes with req.user.userId
    │
    ▼
Response
```

### Password Reset Flow

```
User requests reset (forgot-password page)
    │
    ▼
POST /auth/forgot-password (email)
    │
    ▼
authService.forgotPassword()
    ├── Find user by email
    ├── Generate reset token (crypto.randomBytes)
    ├── Set token expiry (30 minutes)
    ├── Save token hash to user document
    └── Send email with reset link
    │
    ▼
User clicks email link with token
    │
    ▼
Frontend validates token and shows reset form
    │
    ▼
POST /auth/reset-password/:token (new password)
    │
    ▼
authService.resetPassword()
    ├── Find user by reset token
    ├── Verify token not expired
    ├── Hash new password
    ├── Save new password, clear reset token
    └── Return success
    │
    ▼
Frontend redirects to login
```

---

## Data Flow

### Creating a Note

```
Frontend (NoteForm)
    │
    ├── User fills title, selects color, writes content in editor
    ├── User clicks Save
    │
    ▼
Form validation (title and content required)
    │
    ▼
POST /api/notes (with JWT token)
    │ {title, content, color, tags}
    │
    ▼
authMiddleware (verify JWT)
    │
    ▼
Express validation (title/content not empty)
    │
    ▼
notesController.createNote(req, res)
    │
    ▼
notesService.createNote(userId, noteData)
    │
    ├── Create Note document
    │   {userId, title, content, color, tags, pinned: false}
    │
    └── Save to MongoDB
        │
        ▼
Response (new note object with _id)
    │
    ▼
Frontend (showNotification for success)
    │
    ▼
React Query invalidates notes cache
    │
    ▼
NotesList component refetches notes
```

### Fetching Notes with Filters

```
Frontend (NotesList)
    │
    ├── useQuery fetches GET /api/notes?page=1&limit=10&search=...&tag=...
    │ (with JWT token)
    │
    ▼
authMiddleware (verify JWT)
    │
    ▼
Express validation (page/limit are integers)
    │
    ▼
notesController.getNotes(req, res)
    │
    ▼
notesService.getNotes(userId, filters)
    │
    ├── Build MongoDB query:
    │   { userId, title: {$regex}, tags: {$in} }
    │
    ├── Execute query with pagination
    │
    └── Return paginated results
        │
        ▼
Response (notes array + total count)
    │
    ▼
Frontend receives raw data
    │
    ▼
Client-side filtering/sorting applied:
    ├── Filter by selected tags (JavaScript Array.filter)
    ├── Filter by search term
    ├── Sort by: newest/oldest/A-Z/Z-A
    │
    ▼
Display filtered notes in grid
```

### Updating a Note

```
Frontend (NoteForm) with existing note
    │
    ├── User modifies title/content/color
    ├── hasChanges() detects modifications
    ├── User clicks Save
    │
    ▼
Unsaved changes warning (if leaving without save)
    │
    ▼
PUT /api/notes/:id (with JWT token)
    │ {title, content, color, tags}
    │
    ▼
authMiddleware (verify JWT)
    │
    ▼
notesController.updateNote(req, res)
    │
    ▼
notesService.updateNote(userId, noteId, updates)
    │
    ├── Find note by ID and verify ownership
    ├── Update document fields
    └── Save to MongoDB
        │
        ▼
Response (updated note object)
    │
    ▼
Frontend (showNotification for success)
    │
    ▼
React Query cache updated
```

### Deleting a Note

```
Frontend (NotesList)
    │
    ├── User clicks delete icon
    │
    ▼
ConfirmDialog appears
    │ (isDangerous=true for red styling)
    │ "Are you sure? This cannot be undone."
    │
    ▼
User confirms deletion
    │
    ▼
DELETE /api/notes/:id (with JWT token)
    │
    ▼
authMiddleware (verify JWT)
    │
    ▼
notesController.deleteNote(req, res)
    │
    ▼
notesService.deleteNote(userId, noteId)
    │
    ├── Find note by ID and verify ownership
    ├── Delete from MongoDB
    │
    ▼
Response (success message)
    │
    ▼
Frontend (showNotification for success)
    │
    ▼
React Query invalidates cache
    │
    ▼
NotesList refetches notes
```

---

## Component Structure

### Context Flow

```
App.jsx
├── ThemeProvider (Light/Dark mode)
├── AuthProvider (User login state, token, auto-logout)
├── NotificationProvider (Toast notifications)
├── QueryClientProvider (React Query)
└── Routes
    ├── <PrivateRoute>
    │   ├── NotesList (Main view with sidebar)
    │   ├── NoteForm (Create/Edit)
    │   └── ComingSoon
    └── <Public Routes>
        ├── Home
        ├── Login
        ├── Register
        ├── ForgotPassword
        └── ResetPassword
```

### Notification System

```
notesController/frontend action
    │
    ▼
showNotification(message, type, duration)
    │ (type: 'success', 'error', 'warning', 'info')
    │ (duration: ms before auto-dismiss)
    │
    ▼
NotificationContext updates state
    │
    ▼
Snackbar component renders toast
    │ (Position: bottom-right)
    │ (Auto-dismisses after duration)
    │
    ▼
User sees feedback
```

### Confirmation Dialog System

```
User action (delete, leave unsaved)
    │
    ▼
Component state: showDialog = true
    │
    ▼
ConfirmDialog component renders modal
    │ Props:
    │ - title
    │ - message
    │ - isDangerous (red styling flag)
    │ - onConfirm (callback)
    │ - onCancel (callback)
    │
    ▼
User clicks Confirm or Cancel
    │
    ▼
Callback executed
    │
    ▼
Dialog closed
```

---

## Technical Decisions

### Why Client-Side Filtering?

**Decision:** Filter and sort notes client-side after fetch, not server-side

**Rationale:**
- Most users have <1000 notes, client-side filtering is fast
- Better UX: instant filter responses (no network latency)
- Simpler backend (no complex query building)
- Reduces server load
- Works offline if data cached

**Trade-off:** Won't scale to millions of notes per user, but acceptable for this use case

### Why beforeunload for Auto-Logout?

**Decision:** Auto-logout user when browser/tab closes without explicit logout

**Rationale:**
- Security: prevents token theft from abandoned sessions
- Explicit action: only triggers on actual close (not navigation)
- Browser API: `beforeunload` is reliable across browsers
- Minimal overhead

**Implementation:** Stored in authContext, runs on component mount

### Why Context + React Query?

**Decision:** Combine React Context (auth/theme) with React Query (server state)

**Rationale:**
- Context: Global state (user, theme) - infrequently updated
- React Query: Server state (notes) - frequently updated, needs caching/refetching
- Separation of concerns: Local state, global state, server state all separated
- Better performance: Query cache prevents unnecessary network calls

### Why TipTap V3?

**Decision:** Use TipTap V3 for rich text editing

**Rationale:**
- Headless editor: full styling control with Tailwind
- Modern API: React hooks integration
- Feature-rich: formatting, lists, tables, links, etc.
- Community: active development and support

---

## Security Architecture

### Authentication
- JWT tokens with 7-day expiry
- Tokens stored in localStorage (acceptable for single-user apps)
- Token auto-removed on logout or browser close
- No refresh token (simplicity vs. security trade-off)

### Authorization
- All protected endpoints require valid JWT
- Controllers verify user ownership before CRUD operations
- Users cannot modify/delete other users' notes

### Password Security
- Passwords hashed with bcryptjs (10 salt rounds)
- Password reset tokens are cryptographically random
- Reset tokens expire after 30 minutes

### Data Validation
- Input validation on all endpoints with express-validator
- Type checking with Mongoose schemas
- Sanitization through Mongoose + React rendering

### Network Security
- HTTPS recommended for production
- CORS configured for frontend origin
- Rate limiting recommended (future enhancement)

---

## Performance Considerations

### Frontend
- Code splitting with Vite
- React Query caching reduces API calls
- Tailwind CSS for small bundle size
- Lazy loading of components (future enhancement)

### Backend
- MongoDB indexes on userId and timestamps
- Pagination to limit data transfer
- Efficient query selection (avoid N+1 queries)
- Request logging without blocking (Pino async)

### Database
- Mongoose lean queries where projection needed
- Connection pooling via MongoDB driver
- No select N+1 patterns

---

## Monitoring & Debugging

### Logging
- Pino logger in backend (request/response logs)
- Console logs in development mode
- Error stack traces captured

### Swagger Documentation
- Interactive API docs at `/api/docs`
- Auto-generated from JSDoc comments in routes
- Useful for API testing without frontend

---

## Future Enhancements

1. **Rate Limiting** - Prevent brute force attacks
2. **Refresh Tokens** - Improve security with token rotation
3. **WebSockets** - Real-time note sync across devices
4. **Offline Support** - Service workers for offline access
5. **Rich Media** - Image uploads in notes
6. **Collaborative Editing** - Multiple users per note
7. **Export** - PDF/Markdown export functionality
8. **Search Optimization** - Full-text search with MongoDB Atlas
9. **Analytics** - Track user engagement
10. **API Rate Limiting** - Prevent abuse

---

**Last Updated:** Feb 2024  
**Architecture Version:** 1.0  
**Framework Versions:** React 19, Express.js 4.x, MongoDB 5.x+
