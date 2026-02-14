
# Pendown - Your ideas, all for you.

A full-stack MERN application for managing personal notes with rich text editing, user authentication, dark mode support, and professional UI/UX.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Architecture](#architecture)
- [Contributing](#contributing)

---

## Features

### Core Features
✅ **User Authentication**
- Secure registration and login with JWT tokens
- Password reset via email
- Auto-logout on browser close for security

✅ **Note Management**
- Create, read, update, delete notes (full CRUD)
- Rich text editor with formatting options
- Note color customization (7 color options)
- Tagging system for organization
- Pin important notes
- Search notes by title or content
- Filter notes by tags
- Sort by newest, oldest, alphabetical
- Pagination support

✅ **Modern UI/UX**
- Dark mode / Light mode toggle
- Responsive design (mobile, tablet, desktop)
- Glassmorphism and modern design elements
- Circular color palette for note colors
- Notification system with auto-dismiss
- Confirmation dialogs for destructive actions
- Auto-save detection for unsaved changes
- Smooth animations and transitions

✅ **Professional Features**
- Comprehensive error handling
- Input validation
- Loading states and spinners
- Toast notifications (success, error, warning, info)
- Accessibility support
- Security best practices (JWT, secure storage)

---

## Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (JSON Web Tokens), bcryptjs
- **Validation:** Custom middleware validation
- **Logging:** Pino logger
- **Testing:** Mocha, Chai
- **Code Quality:** SonarQube

### Frontend
- **Framework:** React 19 with Vite
- **Styling:** Tailwind CSS
- **Rich Text Editor:** TipTap V3
- **State Management:** React Context API + React Query
- **HTTP Client:** Axios
- **Icons:** Lucide React
- **Testing:** Jest, Vitest
- **Code Quality:** ESLint, Prettier

#### Key Dependencies
- `@tanstack/react-query`: Server state management
- `react-router-dom`: Client-side routing
- `@tiptap/react`: Rich text editing
- `lucide-react`: Icon library
- `tailwindcss`: Utility-first CSS framework

---

## Project Structure

```
nashwah-mern-10pshine/
├── backend/
│   ├── src/
│   │   ├── app.js                 # Express app setup
│   │   ├── server.js              # Server entry point
│   │   ├── config/
│   │   │   ├── database.js        # MongoDB connection
│   │   │   ├── emailer.js         # Email configuration
│   │   │   └── logger.js          # Pino logger setup
│   │   ├── controllers/
│   │   │   ├── authController.js  # Auth logic
│   │   │   └── notesController.js # Notes CRUD logic
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js  # JWT verification
│   │   │   ├── errorHandler.js    # Global error handler
│   │   │   └── requestLogger.js   # Request logging
│   │   ├── models/
│   │   │   ├── User.js            # User schema
│   │   │   └── Note.js            # Note schema
│   │   ├── routes/
│   │   │   ├── authRoutes.js      # Auth endpoints
│   │   │   └── notesRoutes.js     # Notes endpoints
│   │   ├── services/
│   │   │   ├── authService.js     # Auth business logic
│   │   │   └── notesService.js    # Notes business logic
│   │   └── utils/
│   │       └── errors.js          # Custom error classes
│   ├── test/                      # Test files
│   ├── package.json
│   └── sonar-project.properties   # SonarQube config
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                # Main app component
│   │   ├── main.jsx               # Entry point
│   │   ├── components/
│   │   │   ├── ColorPickerModal.jsx
│   │   │   ├── ConfirmDialog.jsx
│   │   │   ├── InputModal.jsx
│   │   │   ├── PrivateRoute.jsx
│   │   │   ├── RichTextEditor.jsx
│   │   │   └── Snackbar.jsx
│   │   ├── contexts/
│   │   │   ├── ThemeContext.jsx
│   │   │   └── NotificationContext.jsx
│   │   ├── pages/
│   │   │   ├── ComingSoon.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── NoteForm.jsx
│   │   │   ├── NotesList.jsx
│   │   │   ├── Register.jsx
│   │   │   └── ResetPassword.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── apiClient.js
│   │   │   └── authContext.jsx
│   │   └── assets/                # Images, fonts, etc
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── vitest.config.js
│   └── sonar-project.properties
│
├── GETTING_STARTED.md             # Quick start guide
├── PROJECT_PLAN.md                # Development plan (5 weeks)
└── README.md                       # This file
```

---

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB (local or MongoDB Atlas)
- Git

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create `.env` file:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pendown
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
LOG_LEVEL=info

# Email configuration (for password reset)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password
SMTP_FROM=noreply@pendown.app

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

4. **Start the backend server:**
```bash
npm run dev
```
Default: `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create `.env.local` file:**
```env
VITE_API_URL=http://localhost:5000/api
```

4. **Start the development server:**
```bash
npm run dev
```
Default: `http://localhost:5173`

---

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Then navigate to `http://localhost:5173` in your browser.

### Build for Production

**Backend:**
```bash
# No build needed, Node.js runs directly
npm start
```

**Frontend:**
```bash
npm run build
# Output in dist/ directory
```

### Running Tests

**Backend:**
```bash
cd backend
npm test
```

**Frontend:**
```bash
cd frontend
npm run test
```

### Code Quality

**Backend SonarQube:**
```bash
cd backend
npm run sonar
```

**Frontend SonarQube:**
```bash
cd frontend
npm run sonar
```

---

## API Documentation

### Interactive API Documentation

Once the backend server is running, access the interactive API documentation at:

**[http://localhost:5000/api/docs](http://localhost:5000/api/docs)**

The Swagger UI provides:
- Complete endpoint reference with schemas
- Try-it-out functionality for testing endpoints
- Request/response examples
- Authentication details (JWT Bearer token)
- Real-time API testing

### Quick API Overview

Base URL: `http://localhost:5000/api`

**Authentication Endpoints:**
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user  
- `GET /auth/me` - Get current user (protected)
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password/:token` - Reset password with token

**Notes Endpoints:**
- `GET /notes` - Get all notes (with pagination, search, tag filter)
- `POST /notes` - Create new note
- `GET /notes/:id` - Get single note
- `PUT /notes/:id` - Update note
- `DELETE /notes/:id` - Delete note
- `GET /notes/tags` - Get all user's tags

All notes endpoints require authentication via JWT token in Authorization header.

### Authentication

Include JWT token in request headers:
```
Authorization: Bearer <your_jwt_token>
```

Obtain JWT by logging in via `/auth/login` endpoint.

---

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed system architecture, data flow diagrams, and component relationships.

### High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│          Browser / Client Application           │
│  (React App with Context API + React Query)     │
└──────────────────┬──────────────────────────────┘
                   │ HTTP/REST
                   ▼
┌─────────────────────────────────────────────────┐
│         Express.js REST API Server              │
│  - Authentication Middleware (JWT)              │
│  - Request Logging (Pino)                       │
│  - Error Handling                               │
│  - Route Controllers                            │
└──────────────────┬──────────────────────────────┘
                   │ Mongoose ODM
                   ▼
┌─────────────────────────────────────────────────┐
│        MongoDB Database                         │
│  - Users Collection                             │
│  - Notes Collection                             │
└─────────────────────────────────────────────────┘
```

---

## User Guide

See [USER_GUIDE.md](./USER_GUIDE.md) for detailed user documentation including:
- Getting started with the app
- Creating and managing notes
- Using the rich text editor
- Tagging and organizing notes
- Customization options (themes, colors)
- Troubleshooting

---

## Features Implemented

### Authentication & Security
- ✅ JWT-based authentication
- ✅ Secure password hashing (bcryptjs)
- ✅ Password reset via email
- ✅ Protected routes
- ✅ Auto-logout on browser close
- ✅ Token refresh mechanism

### Note Management
- ✅ Full CRUD operations
- ✅ Rich text editing (TipTap)
- ✅ Note tagging system
- ✅ Pin/unpin notes
- ✅ Color customization
- ✅ Search functionality
- ✅ Tag-based filtering
- ✅ Sorting options
- ✅ Pagination

### UI/UX
- ✅ Dark mode support
- ✅ Responsive design
- ✅ Loading states
- ✅ Toast notifications
- ✅ Confirmation dialogs
- ✅ Unsaved changes detection
- ✅ Auto-save indication
- ✅ Accessibility features
- ✅ Modern animations

### Quality & Testing
- ✅ Backend test coverage >80%
- ✅ Frontend test coverage >80%
- ✅ SonarQube analysis
- ✅ ESLint/Prettier formatting
- ✅ Error logging with Pino

---

## Troubleshooting

### Common Issues

**MongoDB Connection Fails:**
- Ensure MongoDB is running locally or MongoDB Atlas URL is correct
- Check connection string in `.env`
- Verify firewall allows connection

**Frontend can't reach backend:**
- Ensure backend server is running on correct port
- Check `VITE_API_URL` in frontend `.env.local`
- Verify no CORS issues (check backend CORS config)

**JWT token errors:**
- Clear localStorage and re-login
- Check JWT_SECRET matches in backend `.env`
- Verify token hasn't expired

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for more detailed assistance.

---

## Performance Metrics

- Average API response time: <200ms
- Initial page load: <2s
- Bundle size: ~400KB (gzipped)
- Lighthouse score: 95+

---

## Security Considerations

- Passwords hashed with bcryptjs (10 salt rounds)
- JWT tokens signed with secret key
- HTTPS recommended for production
- CORS properly configured
- Input validation on all endpoints
- Rate limiting recommended (to be added)
- SQL injection protection (MongoDB injection prevention)
- XSS prevention through React's built-in sanitization

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Follow commit conventions: `feat:`, `fix:`, `docs:`, etc.
4. Write tests for new features
5. Ensure tests pass: `npm test`
6. Push to your fork
7. Create a Pull Request to `develop` branch

### Code Standards
- Use ESLint configurations (provided)
- Follow Prettier formatting
- Write descriptive commit messages
- Update documentation for new features
- Maintain >80% test coverage

---

## License

This project is part of the 10Pearls Shine Internship Cohort 7.

---

## Support & Questions

For questions or issues:
1. Check the [USER_GUIDE.md](./USER_GUIDE.md)
2. Review [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
3. Check GitHub Issues
4. Contact the development team

---

**Happy Note-Taking! 📝✨**