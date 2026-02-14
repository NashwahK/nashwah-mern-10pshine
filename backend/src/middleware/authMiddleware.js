const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AuthenticationError } = require('../utils/errors');
const logger = require('../config/logger');

exports.authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');

      if (!user) {
        throw new AuthenticationError('User not found');
      }

      req.user = user;
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        throw new AuthenticationError('Token expired');
      }
      throw new AuthenticationError('Invalid token');
    }
  } catch (error) {
    logger.warn({ error: error.message }, 'Authentication failed');
    next(error);
  }
};
