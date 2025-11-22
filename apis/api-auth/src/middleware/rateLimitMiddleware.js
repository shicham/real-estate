const cacheService = require('../services/cacheService');
const logger = require('../utils/logger');

class RateLimitMiddleware {
  // Rate limiting par IP
  static ipRateLimit(options = {}) {
    const {
      windowMs = 15 * 60 * 1000, // 15 minutes
      max = 100, // requests per window
      message = 'Too many requests from this IP'
    } = options;

    return async (req, res, next) => {
      try {
        const ip = req.ip || req.connection.remoteAddress;
        const key = `ip_rate_limit:${ip}`;
        const windowSeconds = Math.floor(windowMs / 1000);

        const result = await cacheService.checkRateLimit(key, max, windowSeconds);
        
        // Headers informatifs
        res.set({
          'X-RateLimit-Limit': max,
          'X-RateLimit-Remaining': result.remaining,
          'X-RateLimit-Reset': new Date(result.resetTime || Date.now() + windowMs)
        });

        if (!result.allowed) {
          logger.warn(`Rate limit exceeded for IP ${ip}`);
          return res.status(429).json({
            error: 'Too Many Requests',
            message,
            retryAfter: Math.ceil(windowMs / 1000)
          });
        }

        next();
      } catch (error) {
        logger.error('Rate limit middleware error:', error);
        next(); // Continuer en cas d'erreur du cache
      }
    };
  }

  // Rate limiting par utilisateur
  static userRateLimit(options = {}) {
    const {
      windowMs = 15 * 60 * 1000,
      max = 200,
      message = 'Too many requests for this user'
    } = options;

    return async (req, res, next) => {
      try {
        if (!req.user?.id) {
          return next();
        }

        const userId = req.user.id;
        const key = `user_rate_limit:${userId}`;
        const windowSeconds = Math.floor(windowMs / 1000);

        const result = await cacheService.checkRateLimit(key, max, windowSeconds);
        
        res.set({
          'X-RateLimit-User-Limit': max,
          'X-RateLimit-User-Remaining': result.remaining,
          'X-RateLimit-User-Reset': new Date(result.resetTime || Date.now() + windowMs)
        });

        if (!result.allowed) {
          logger.warn(`User rate limit exceeded for user ${userId}`);
          return res.status(429).json({
            error: 'Too Many Requests',
            message,
            retryAfter: Math.ceil(windowMs / 1000)
          });
        }

        next();
      } catch (error) {
        logger.error('User rate limit middleware error:', error);
        next();
      }
    };
  }

  // Rate limiting spécifique pour l'authentification
  static authRateLimit(options = {}) {
    const {
      windowMs = 15 * 60 * 1000,
      max = 5,
      message = 'Too many authentication attempts',
      blockDuration = 15 * 60 * 1000 // 15 minutes de blocage
    } = options;

    return async (req, res, next) => {
      try {
        const ip = req.ip || req.connection.remoteAddress;
        const identifier = req.body.email || req.body.username || 'unknown';
        
        // Vérifier les tentatives échouées
        const failedAttempts = await cacheService.getFailedLoginAttempts(identifier, ip);
        
        if (failedAttempts >= max) {
          logger.warn(`Authentication blocked for ${identifier} from ${ip} - too many failed attempts`);
          return res.status(429).json({
            error: 'Account Temporarily Locked',
            message: 'Too many failed login attempts. Please try again later.',
            retryAfter: Math.ceil(blockDuration / 1000),
            remainingAttempts: 0
          });
        }

        // Rate limiting normal
        const key = `auth_rate_limit:${ip}`;
        const windowSeconds = Math.floor(windowMs / 1000);
        const result = await cacheService.checkRateLimit(key, max, windowSeconds);
        
        const remainingAttempts = max - failedAttempts;
        
        res.set({
          'X-RateLimit-Auth-Limit': max,
          'X-RateLimit-Auth-Remaining': Math.min(result.remaining, remainingAttempts),
          'X-RateLimit-Auth-Reset': new Date(result.resetTime || Date.now() + windowMs)
        });

        if (!result.allowed) {
          logger.warn(`Auth rate limit exceeded for ${identifier} from ${ip}`);
          return res.status(429).json({
            error: 'Too Many Authentication Attempts',
            message,
            retryAfter: Math.ceil(windowMs / 1000),
            remainingAttempts
          });
        }

        req.authAttemptInfo = {
          failedAttempts,
          remainingAttempts,
          identifier,
          ip
        };

        next();
      } catch (error) {
        logger.error('Auth rate limit middleware error:', error);
        next();
      }
    };
  }

  // Rate limiting pour les endpoints d'email
  static emailRateLimit(options = {}) {
    const {
      windowMs = 60 * 60 * 1000, // 1 heure
      max = 3 // 3 emails par heure
    } = options;

    return async (req, res, next) => {
      try {
        const email = req.body.email || req.user?.email;
        if (!email) return next();

        const key = `email_rate_limit:${email}`;
        const windowSeconds = Math.floor(windowMs / 1000);

        const result = await cacheService.checkRateLimit(key, max, windowSeconds);
        
        res.set({
          'X-RateLimit-Email-Limit': max,
          'X-RateLimit-Email-Remaining': result.remaining,
          'X-RateLimit-Email-Reset': new Date(result.resetTime || Date.now() + windowMs)
        });

        if (!result.allowed) {
          logger.warn(`Email rate limit exceeded for ${email}`);
          return res.status(429).json({
            error: 'Too Many Email Requests',
            message: 'You have exceeded the maximum number of email requests per hour.',
            retryAfter: Math.ceil(windowMs / 1000)
          });
        }

        next();
      } catch (error) {
        logger.error('Email rate limit middleware error:', error);
        next();
      }
    };
  }

  // Middleware pour nettoyer les tentatives après succès
  static clearFailedAttemptsOnSuccess() {
    return async (req, res, next) => {
      const originalSend = res.send;
      
      res.send = function(data) {
        // Si la réponse est un succès (2xx) et qu'on a les infos d'auth
        if (res.statusCode >= 200 && res.statusCode < 300 && req.authAttemptInfo) {
          const { identifier, ip } = req.authAttemptInfo;
          cacheService.clearFailedLoginAttempts(identifier, ip)
            .catch(error => logger.error('Failed to clear login attempts:', error));
        }
        
        return originalSend.call(this, data);
      };
      
      next();
    };
  }

  // Middleware pour tracker les échecs
  static trackFailedAttempts() {
    return async (req, res, next) => {
      const originalSend = res.send;
      
      res.send = function(data) {
        // Si la réponse est un échec d'auth (401/403) et qu'on a les infos
        if ((res.statusCode === 401 || res.statusCode === 403) && req.authAttemptInfo) {
          const { identifier, ip } = req.authAttemptInfo;
          cacheService.trackFailedLogin(identifier, ip)
            .catch(error => logger.error('Failed to track failed login:', error));
        }
        
        return originalSend.call(this, data);
      };
      
      next();
    };
  }
}

module.exports = RateLimitMiddleware;