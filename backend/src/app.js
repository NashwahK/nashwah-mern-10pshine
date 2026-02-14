
const express = require('express');
const cors = require('cors');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const notesRoutes = require('./routes/notesRoutes');
const { swaggerUi, specs } = require('./swagger');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);


// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Swagger API docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: { 
      message: 'Route not found',
      path: req.path
    } 
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
