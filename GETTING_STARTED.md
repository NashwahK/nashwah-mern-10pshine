# Notes App - Quick Start Guide

## Week 1 Getting Started Checklist

### Prerequisites Setup
Before starting Week 1, ensure you have:

- [ ] **Node.js** installed (v18 or higher)
  - Download from: https://nodejs.org/
  - Verify: `node --version`

- [ ] **MongoDB** installed and running
  - Download from: https://www.mongodb.com/try/download/community
  - OR use MongoDB Atlas (cloud)
  - Verify: `mongod --version`

- [ ] **Git** installed
  - Download from: https://git-scm.com/
  - Verify: `git --version`

- [ ] **VS Code** (recommended IDE)
  - Download from: https://code.visualstudio.com/

- [ ] **Postman** or Thunder Client (VS Code extension)
  - For API testing

---

## Day 1-2: Initial Setup

### Step 1: Create Project Structure

Create the following folder structure:
```
nashwah-mern-10pshine/
├── backend/
└── frontend/
```

### Step 2: Initialize Backend Project

```bash
# Navigate to backend folder
cd backend

# Initialize Node.js project
npm init -y

# Install dependencies
npm install express mongoose bcryptjs jsonwebtoken dotenv cors pino pino-pretty express-validator

# Install dev dependencies
npm install --save-dev nodemon mocha chai supertest eslint
```

### Step 3: Create Basic Backend Files

Create these files in `backend/`:

**backend/package.json** - Add scripts:
```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "mocha tests/**/*.test.js"
  }
}
```

**backend/.env.example**
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/notes_app
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRATION=24h
LOG_LEVEL=info
```

**backend/.gitignore**
```
node_modules/
.env
*.log
coverage/
.DS_Store
```

### Step 4: Set Up MongoDB Database

MongoDB will automatically create the database when you first connect.
No manual database creation needed!

### Step 5: Verify MongoDB is Running

```bash
# Check if MongoDB service is running
# On Windows (if installed as service):
net start MongoDB

# Or start MongoDB manually:
mongod
```

The collections (users, notes) will be created automatically by Mongoose.

---

## Day 3-4: Database Connection & Configuration

### Step 1: Create Database Config

**backend/src/config/database.js**
```javascript
const mongoose = require('mongoose');
const logger = require('./logger');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('✅ MongoDB connected successfully');
  } catch (err) {
    logger.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### Step 2: Create Logger Config

**backend/src/config/logger.js**
```javascript
const pino = require('pino');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  }
});

module.exports = logger;
```

### Step 3: Create Express Server

**backend/src/server.js**
```javascript
require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');
const logger = require('./config/logger');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📝 Environment: ${process.env.NODE_ENV}`);
});
```

**backend/src/app.js**
```javascript
const express = require('express');
const cors = require('cors');
const logger = require('./config/logger');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info({
    method: req.method,
    url: req.url,
    ip: req.ip
  }, 'Incoming request');
  next();
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Routes will be added here
// app.use('/api/auth', authRoutes);
// app.use('/api/notes', notesRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: { message: 'Route not found' } 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error(err);
  res.status(err.status || 500).json({
    success: false,
    error: {
      message: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

module.exports = app;
```

### Step 4: Test the Setup

1. Copy `.env.example` to `.env` and update MongoDB URI if needed
2. Make sure MongoDB is running
3. Run: `npm run dev`
4. Visit: http://localhost:5000/health
5. You should see: `{"status":"OK","message":"Server is running"}`

---

## Day 5-7: Authentication Implementation

### Step 1: Create Utility Files

**backend/src/utils/errors.js**
```javascript
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError
};
```

### Step 2: Create User Model

**backend/src/models/User.js**
```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
```

### Step 3: Create Auth Service

**backend/src/services/authService.js**
```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ValidationError, AuthenticationError } = require('../utils/errors');
const logger = require('../config/logger');

class AuthService {
  static generateToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION }
    );
  }

  static async register(userData) {
    // Check if user exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new ValidationError('Email already registered');
    }

    // Create user
    const user = await User.create(userData);
    const token = this.generateToken(user._id);

    logger.info({ userId: user._id, email: userData.email }, 'User registered');

    return { user, token };
  }

  static async login(email, password) {
    const user = await User.findOne({ email });
    
    if (!user) {
      logger.warn({ email }, 'Login attempt - user not found');
      throw new AuthenticationError('Invalid credentials');
    }

    const isValidPassword = await user.comparePassword(password);
    
    if (!isValidPassword) {
      logger.warn({ userId: user._id }, 'Login attempt - invalid password');
      throw new AuthenticationError('Invalid credentials');
    }

    const token = this.generateToken(user._id);

    logger.info({ userId: user._id }, 'User logged in');

    return { user, token };
  }
}

module.exports = AuthService;
```

### Step 4: Create Auth Controller

**backend/src/controllers/authController.js**
```javascript
const AuthService = require('../services/authService');
const { validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errors');

exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed');
    }

    const { username, email, password, firstName, lastName } = req.body;
    const { user, token } = await AuthService.register({
      username,
      email,
      password,
      firstName,
      lastName
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { user, token }
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await AuthService.login(email, password);

    res.json({
      success: true,
      message: 'Login successful',
      data: { user, token }
    });
  } catch (error) {
    next(error);
  }
};

exports.getCurrentUser = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: { user: req.user }
    });
  } catch (error) {
    next(error);
  }
};
```

### Step 5: Create Auth Middleware

**backend/src/middleware/authMiddleware.js**
```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AuthenticationError } = require('../utils/errors');

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw new AuthenticationError('No token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      throw new AuthenticationError('Invalid token');
    }

    req.user = user;
    next();
  } catch (error) {
    next(new AuthenticationError('Invalid or expired token'));
  }
};
```

### Step 6: Create Auth Routes

**backend/src/routes/authRoutes.js**
```javascript
const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const loginValidation = [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// Routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.get('/me', authenticate, authController.getCurrentUser);

module.exports = router;
```

### Step 7: Update app.js to Include Routes

Add to **backend/src/app.js** (after middleware, before 404 handler):
```javascript
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
```

---

## Testing Week 1 Work

### Test with Postman/Thunder Client

1. **Register User**
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "firstName": "Test",
  "lastName": "User"
}
```

2. **Login**
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

3. **Get Current User** (use token from login response)
```
GET http://localhost:5000/api/auth/me
Authorization: Bearer your_token_here
```

---

## Week 1 Completion Checklist

- [ ] Backend project initialized with all dependencies
- [ ] MySQL database created with users and notes tables
- [ ] Database connection working
- [ ] Pino logger configured
- [ ] User registration endpoint working
- [ ] User login endpoint working
- [ ] JWT authentication working
- [ ] Get current user endpoint working
- [ ] All authentication tests passing
- [ ] Code committed to Git

---

## Common Issues & Solutions

### Issue: MongoDB Connection Error
**Solution:** Check if MongoDB is running (`mongod` command) and MONGODB_URI in `.env` is correct

### Issue: Port already in use
**Solution:** Change PORT in `.env` or kill the process using the port

### Issue: JWT Secret Error
**Solution:** Make sure JWT_SECRET is set in `.env`

### Issue: bcrypt installation error
**Solution:** Try `npm install bcryptjs` instead of `bcrypt`

---

## Next Steps

Once Week 1 is complete:
1. Commit all code to Git
2. Create a new branch for Week 2 work
3. Move on to implementing Notes CRUD API (Week 2 in PROJECT_PLAN.md)

**Great job on completing Week 1! 🎉**
