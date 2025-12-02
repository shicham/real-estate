const express = require('express');
const { body } = require('express-validator');

const StatsController = require('../controllers/statsController');
const { auth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for sensitive routes (désactivé en test)
const statsLimiter = process.env.NODE_ENV === 'test' ? (req, res, next) => next() : rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    message: 'Too many stats attempts, please try again later.'
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


// Public routes
router.post('/dailystats', StatsController.getDailyStats);
router.post('/generatedailyreport', StatsController.generateDailyReport);
router.post('/statsrange', StatsController.getStatsRange);

// Health check route for stats service (public route)
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Stats Routes',
    timestamp: new Date().toISOString(),
    authenticated: !!req.user
  });
});

// Protected routes (require authentication)
router.use(auth); // Apply auth middleware to all routes below

module.exports = router;