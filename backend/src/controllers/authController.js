const AuthService = require('../services/authService');
const { validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errors');

exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg).join(', ');
      throw new ValidationError(errorMessages);
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg).join(', ');
      throw new ValidationError(errorMessages);
    }

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
    const user = await AuthService.getCurrentUser(req.user._id);
    
    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      throw new ValidationError('Email is required');
    }

    await AuthService.forgotPassword(email);

    res.json({
      success: true,
      message: 'Password reset link sent to your email'
    });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      throw new ValidationError('Password and confirmation are required');
    }

    if (password !== confirmPassword) {
      throw new ValidationError('Passwords do not match');
    }

    if (password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters');
    }

    await AuthService.resetPassword(token, password);

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    next(error);
  }
};
