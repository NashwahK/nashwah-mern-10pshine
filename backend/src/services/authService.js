const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ValidationError, AuthenticationError, ConflictError } = require('../utils/errors');
const logger = require('../config/logger');
const { sendResetPasswordEmail } = require('../config/emailer');

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

  static async forgotPassword(email) {
    const user = await User.findOne({ email });
    
    if (!user) {
      // Don't reveal if email exists for security
      logger.warn({ email }, 'Forgot password attempt - user not found');
      return;
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user._id, type: 'reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Send email with reset link
    try {
      await sendResetPasswordEmail(user.email, resetToken);
      logger.info({ userId: user._id }, 'Password reset email sent successfully');
    } catch (error) {
      logger.error({ userId: user._id, error: error.message }, 'Failed to send reset password email');
      throw new Error('Failed to send reset email. Please try again later.');
    }

    return resetToken;
  }

  static async resetPassword(token, newPassword) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (decoded.type !== 'reset') {
        throw new AuthenticationError('Invalid token');
      }

      const user = await User.findById(decoded.userId);
      
      if (!user) {
        throw new AuthenticationError('User not found');
      }

      user.password = newPassword;
      await user.save();

      logger.info({ userId: user._id }, 'Password reset successfully');

      return user;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new AuthenticationError('Reset link has expired');
      }
      throw error;
    }
  }
}

module.exports = AuthService;
