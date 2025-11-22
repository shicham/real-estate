const express = require('express');
const { body } = require('express-validator');

const AuthController = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for sensitive routes (désactivé en test)
const authLimiter = process.env.NODE_ENV === 'test' ? (req, res, next) => next() : rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const passwordResetLimiter = process.env.NODE_ENV === 'test' ? (req, res, next) => next() : rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    success: false,
    message: 'Too many password reset attempts, please try again later.'
  }
});

// Validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('role')
    .optional()
    .isIn(['user', 'agent', 'admin'])
    .withMessage('Role must be user, agent, or admin')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
];

const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
];

const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('profile.phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('profile.address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address cannot exceed 200 characters'),
  body('profile.city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City cannot exceed 100 characters'),
  body('profile.country')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Country cannot exceed 100 characters')
];

// Public routes
router.post('/register', authLimiter, registerValidation, AuthController.register);
router.post('/login', authLimiter, loginValidation, AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/forgot-password', passwordResetLimiter, forgotPasswordValidation, AuthController.forgotPassword);
router.post('/reset-password', resetPasswordValidation, AuthController.resetPassword);
router.get('/verify-email/:token', AuthController.verifyEmail);

// Health check route for auth service (public route)
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Authentication Routes',
    timestamp: new Date().toISOString(),
    authenticated: !!req.user
  });
});

// Protected routes (require authentication)
router.use(auth); // Apply auth middleware to all routes below

router.post('/logout', AuthController.logout);
router.post('/logout-all', AuthController.logoutAll);
router.get('/profile', AuthController.getProfile);
router.put('/profile', updateProfileValidation, AuthController.updateProfile);
router.post('/change-password', changePasswordValidation, AuthController.changePassword);

module.exports = router;