const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ValidationError, AuthenticationError, ConflictError } = require('../utils/errors');
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
    try {
      const existingEmail = await User.findOne({ email: userData.email });
      if (existingEmail) {
        throw new ConflictError('Email already registered');
      }
      const existingUsername = await User.findOne({ username: userData.username });
      if (existingUsername) {
        throw new ConflictError('Username already taken');
      }

      // Create user
      const user = await User.create(userData);
      const token = this.generateToken(user._id);

      logger.info({ userId: user._id, email: userData.email }, 'User registered successfully');

      return { user, token };
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new ValidationError(Object.values(error.errors)[0].message);
      }
      throw error;
    }
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

    logger.info({ userId: user._id }, 'User logged in successfully');

    return { user, token };
  }

  static async getCurrentUser(userId) {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    return user;
  }
}

module.exports = AuthService;
