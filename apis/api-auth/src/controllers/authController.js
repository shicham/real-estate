const LocationService = require('../services/locationService');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');

const User = require('../models/User');
const logger = require('../utils/logger');
const emailService = require('../services/emailService');
const analyticsService = require('../services/analyticsService');
const AppError = require('../utils/AppError');

// AuthController - Version 1.0.6 - Updated domain to viridial.com
class AuthController {
  // Register new user
  static async register(req, res, next) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { email, password, firstName, lastName, role, lang, country } = req.body;

      // Détection automatique du pays et de la ville via LocationService si non fournis
      const location = LocationService.getLocationFromIp(req.ip);
      const detectedCountry = country || location.country;
      const detectedCity = location.city;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      // Create new user
      const user = new User({
        email,
        password,
        firstName,
        lastName,
        role: role || 'user',
        profile: {
          city: detectedCity,
          country: detectedCountry,
          preferences: {
            language: lang || 'fr'
          }
        }
      });

      // Generate email verification token
      const verificationToken = user.generateEmailVerificationToken();
      await user.save();

      // Send verification email (don't wait for it)
      emailService.sendVerificationEmail(user.email, verificationToken)
        .catch(error => logger.error('Failed to send verification email:', error));

      // Generate tokens
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();

      // Store refresh token
      user.refreshTokens.push({
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        device: req.headers['user-agent'] || 'Unknown',
        ip: req.ip
      });
      await user.save();

      logger.info(`New user registered: ${user.email}`);

      // Track analytics event
      analyticsService.trackEvent(
        analyticsService.events.USER_REGISTERED,
        user._id,
        {
          userAgent: req.headers['user-agent'],
          ip: req.ip,
          endpoint: req.originalUrl,
          method: req.method,
          country: user.country,
          language: user.preferences?.language,
          city: detectedCity
        }
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please check your email for verification.',
        data: {
          user,
          accessToken,
          refreshToken
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Login user
  static async login(req, res, next) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { email, password, rememberMe } = req.body;

      // Find user with password
      const user = await User.findByEmailWithPassword(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check if account is locked
      if (user.isLocked) {
        return res.status(423).json({
          success: false,
          message: 'Account temporarily locked due to too many failed login attempts'
        });
      }

      // Check if account is active
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Account is deactivated. Please contact support.'
        });
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        await user.handleFailedLogin();
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Handle successful login
      await user.handleSuccessfulLogin();
      user.lastLogin = new Date();
      await user.save();

      // Generate tokens
      const accessToken = user.generateAccessToken();
      const refreshTokenExpiry = rememberMe ? '30d' : '7d';
      const refreshToken = jwt.sign(
        { id: user._id, tokenVersion: user.refreshTokens.length },
        process.env.JWT_REFRESH_SECRET || 'refresh-secret',
        { expiresIn: refreshTokenExpiry }
      );

      // Store refresh token
      user.refreshTokens.push({
        token: refreshToken,
        expiresAt: new Date(Date.now() + (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000),
        device: req.headers['user-agent'] || 'Unknown',
        ip: req.ip
      });

      // Clean old refresh tokens (keep only last 5)
      if (user.refreshTokens.length > 5) {
        user.refreshTokens = user.refreshTokens.slice(-5);
      }

      await user.save();

      logger.info(`User logged in: ${user.email}`);

      // Track analytics event
      analyticsService.trackEvent(
        analyticsService.events.USER_LOGIN,
        user._id,
        {
          userAgent: req.headers['user-agent'],
          ip: req.ip,
          endpoint: req.originalUrl,
          method: req.method
        }
      );

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user,
          accessToken,
          refreshToken
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Refresh access token
  static async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token is required'
        });
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh-secret');

      // Find user and check if refresh token exists
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token'
        });
      }

      const tokenExists = user.refreshTokens.find(
        tokenObj => tokenObj.token === refreshToken && tokenObj.expiresAt > new Date()
      );

      if (!tokenExists) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired refresh token'
        });
      }

      // Generate new access token
      const accessToken = user.generateAccessToken();

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken
        }
      });

    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token'
        });
      }
      next(error);
    }
  }

  // Logout user
  static async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const userId = req.user?.id;

      if (userId && refreshToken) {
        // Remove specific refresh token
        await User.findByIdAndUpdate(userId, {
          $pull: { refreshTokens: { token: refreshToken } }
        });
      }

      // Track analytics event
      await analyticsService.trackEvent(
        analyticsService.events.USER_LOGOUT,
        userId,
        {
          userAgent: req.headers['user-agent'],
          ip: req.ip,
          endpoint: req.originalUrl,
          method: req.method
        }
      );
      res.json({
        success: true,
        message: 'Logout successful'
      });

    } catch (error) {
      next(error);
    }
  }

  // Logout from all devices
  static async logoutAll(req, res, next) {
    try {
      const userId = req.user.id;

      // Remove all refresh tokens
      await User.findByIdAndUpdate(userId, {
        $set: { refreshTokens: [] }
      });

      res.json({
        success: true,
        message: 'Logged out from all devices successfully'
      });

      // Track analytics event
      await analyticsService.trackEvent(
        analyticsService.events.USER_LOGOUT,
        userId,
        {
          userAgent: req.headers['user-agent'],
          ip: req.ip,
          endpoint: req.originalUrl,
          method: req.method,
          logoutAll: true
        }
      );
    } catch (error) {
      next(error);
    }
  }
  // Get current user profile
  static async getProfile(req, res, next) {
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: { user }
      });

    } catch (error) {
      next(error);
    }
  }

  // Update user profile
  static async updateProfile(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const userId = req.user.id;
      const updates = req.body;

      // Remove sensitive fields
      delete updates.password;
      delete updates.email;
      delete updates.role;
      delete updates.isActive;

      const user = await User.findByIdAndUpdate(userId, updates, {
        new: true,
        runValidators: true
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user }
      });

      // Track analytics event
      analyticsService.trackEvent(
        analyticsService.events.API_CALL,
        userId,
        {
          userAgent: req.headers['user-agent'],
          ip: req.ip,
          endpoint: req.originalUrl,
          method: req.method,
          action: 'updateProfile'
        }
      );

    } catch (error) {
      next(error);
    }
  }

  // Change password
  static async changePassword(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      // Get user with password
      const user = await User.findById(userId).select('+password');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Update password
      user.password = newPassword;

      // Invalidate all refresh tokens (logout from all devices)
      user.refreshTokens = [];

      await user.save();

      logger.info(`Password changed for user: ${user.email}`);

      // Track analytics event
      analyticsService.trackEvent(
        analyticsService.events.PASSWORD_RESET_COMPLETED,
        user._id,
        {
          userAgent: req.headers['user-agent'],
          ip: req.ip,
          endpoint: req.originalUrl,
          method: req.method,
          action: 'changePassword'
        }
      );

      res.json({
        success: true,
        message: 'Password changed successfully. Please login again.'
      });

    } catch (error) {
      next(error);
    }
  }

  // Request password reset
  static async forgotPassword(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        // Don't reveal if email exists or not
        return res.json({
          success: true,
          message: 'If the email exists, you will receive password reset instructions.'
        });
      }

      // Generate reset token
      const resetToken = user.generatePasswordResetToken();
      await user.save();

      // Send reset email
      try {
        await emailService.sendPasswordResetEmail(user.email, resetToken);
      } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        logger.error('Failed to send password reset email:', error);
        throw new AppError('Email could not be sent. Please try again later.', 500);
      }

      res.json({
        success: true,
        message: 'Password reset instructions sent to your email.'
      });

      // Track analytics event
      analyticsService.trackEvent(
        analyticsService.events.PASSWORD_RESET_REQUESTED,
        user._id,
        {
          userAgent: req.headers['user-agent'],
          ip: req.ip,
          endpoint: req.originalUrl,
          method: req.method,
          action: 'forgotPassword'
        }
      );

    } catch (error) {
      next(error);
    }
  }

  // Reset password with token
  static async resetPassword(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { token, newPassword } = req.body;

      // Hash the token
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      // Find user with valid reset token
      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token'
        });
      }

      // Update password and clear reset token
      user.password = newPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.refreshTokens = []; // Logout from all devices

      await user.save();

      logger.info(`Password reset for user: ${user.email}`);

      // Track analytics event
      analyticsService.trackEvent(
        analyticsService.events.PASSWORD_RESET_COMPLETED,
        user._id,
        {
          userAgent: req.headers['user-agent'],
          ip: req.ip,
          endpoint: req.originalUrl,
          method: req.method,
          action: 'resetPassword'
        }
      );

      res.json({
        success: true,
        message: 'Password reset successful. Please login with your new password.'
      });

    } catch {
      next();
    }
  }

  // Verify email
  static async verifyEmail(req, res, next) {
    try {
      const { token } = req.params;

      // Hash the token
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      // Find user with valid verification token
      const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired verification token'
        });
      }

      // Update user verification status
      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;

      await user.save();

      logger.info(`Email verified for user: ${user.email}`);

      // Track analytics event
      analyticsService.trackEvent(
        analyticsService.events.EMAIL_VERIFIED,
        user._id,
        {
          userAgent: req.headers['user-agent'],
          ip: req.ip,
          endpoint: req.originalUrl,
          method: req.method
        }
      );

      res.json({
        success: true,
        message: 'Email verified successfully'
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;