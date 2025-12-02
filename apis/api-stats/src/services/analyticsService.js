const cacheService = require('./cacheService');
const logger = require('../utils/logger');

class AnalyticsService {
  constructor() {
    this.events = {
      USER_REGISTERED: 'user_registered',
      USER_LOGIN: 'user_login',
      USER_LOGOUT: 'user_logout',
      EMAIL_VERIFIED: 'email_verified',
      PASSWORD_RESET_REQUESTED: 'password_reset_requested',
      PASSWORD_RESET_COMPLETED: 'password_reset_completed',
      FAILED_LOGIN_ATTEMPT: 'failed_login_attempt',
      SUSPICIOUS_ACTIVITY: 'suspicious_activity',
      API_CALL: 'api_call',
      ERROR_OCCURRED: 'error_occurred'
    };
  }

  // Tracker un événement 
  async trackEvent(eventType, userId, metadata = {}) {
    try {
      const event = {
        type: eventType,
        userId: userId || 'anonymous',
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        metadata: {
          userAgent: metadata.userAgent,
          ip: metadata.ip,
          endpoint: metadata.endpoint,
          method: metadata.method,
          responseTime: metadata.responseTime,
          statusCode: metadata.statusCode,
          ...metadata
        }
      };

      // Stocker l'événement dans Redis avec TTL de 30 jours
      const eventKey = `event:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
      await cacheService.set(eventKey, event, 86400 * 30);

      // Incrémenter les compteurs quotidiens
      await this.incrementDailyCounter(eventType, event.date);
      
      // Incrémenter les compteurs par utilisateur
      if (userId) {
        await this.incrementUserCounter(eventType, userId, event.date);
      }

      logger.info(`Event tracked: ${eventType}`, { userId, metadata });
      
      return true;
    } catch (error) {
      logger.error('Failed to track event:', error);
      return false;
    }
  }

  // Incrémenter les compteurs quotidiens
  async incrementDailyCounter(eventType, date) {
    try {
      const key = `counter:daily:${eventType}:${date}`;
      await cacheService.client?.incr(key);
      await cacheService.client?.expire(key, 86400 * 30); // 30 jours
      
      // Compteur global
      const globalKey = `counter:daily:total:${date}`;
      await cacheService.client?.incr(globalKey);
      await cacheService.client?.expire(globalKey, 86400 * 30);
      
      return true;
    } catch (error) {
      logger.error('Failed to increment daily counter:', error);
      return false;
    }
  }

  // Incrémenter les compteurs par utilisateur
  async incrementUserCounter(eventType, userId, date) {
    try {
      const key = `counter:user:${userId}:${eventType}:${date}`;
      await cacheService.client?.incr(key);
      await cacheService.client?.expire(key, 86400 * 30);
      
      return true;
    } catch (error) {
      logger.error('Failed to increment user counter:', error);
      return false;
    }
  }

  // Obtenir les statistiques quotidiennes
  async getDailyStats(date, eventTypes = null) {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      const events = eventTypes || Object.values(this.events);
      
      const stats = {};
      
      for (const eventType of events) {
        const key = `counter:daily:${eventType}:${targetDate}`;
        const count = await cacheService.client?.get(key) || 0;
        stats[eventType] = parseInt(count);
      }
      
      // Total global
      const totalKey = `counter:daily:total:${targetDate}`;
      const total = await cacheService.client?.get(totalKey) || 0;
      stats.total = parseInt(total);
      
      return stats;
    } catch (error) {
      logger.error('Failed to get daily stats:', error);
      return {};
    }
  }

  // Obtenir les statistiques sur une période
  async getStatsRange(startDate, endDate, eventType = null) {
    try {
      // Si aucune date n’est fournie → utiliser la date du jour (YYYY-MM-DD)
      const todayStr = new Date().toISOString().split('T')[0];
      const start = new Date(startDate || todayStr);
      const end = new Date(endDate || todayStr);
      const stats = {};
      
      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const dateStr = date.toISOString().split('T')[0];
        
        if (eventType) {
          const key = `counter:daily:${eventType}:${dateStr}`;
          const count = await cacheService.client?.get(key) || 0;
          stats[dateStr] = parseInt(count);
        } else {
          stats[dateStr] = await this.getDailyStats(dateStr);
        }
      }
      
      return stats;
    } catch (error) {
      logger.error('Failed to get stats range:', error);
      return {};
    }
  }

  // Obtenir les statistiques utilisateur
  async getUserStats(userId, days = 30) {
    try {
      const stats = {};
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
      
      for (const eventType of Object.values(this.events)) {
        stats[eventType] = 0;
        
        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
          const dateStr = date.toISOString().split('T')[0];
          const key = `counter:user:${userId}:${eventType}:${dateStr}`;
          const count = await cacheService.client?.get(key) || 0;
          stats[eventType] += parseInt(count);
        }
      }
      
      return stats;
    } catch (error) {
      logger.error('Failed to get user stats:', error);
      return {};
    }
  }

  // Détecter une activité suspecte
  async detectSuspiciousActivity(userId, ip, userAgent) {
    try {
      const suspicious = [];
      
      // Vérifier les tentatives de connexion échouées
      const failedAttempts = await cacheService.getFailedLoginAttempts(userId, ip);
      if (failedAttempts > 3) {
        suspicious.push({
          type: 'excessive_failed_logins',
          severity: 'high',
          details: `${failedAttempts} failed login attempts`
        });
      }
      
      // Vérifier les connexions depuis des IPs multiples
      const userLoginKey = `user_ips:${userId}`;
      await cacheService.client?.sAdd(userLoginKey, ip);
      await cacheService.client?.expire(userLoginKey, 86400); // 24h
      
      const ipCount = await cacheService.client?.sCard(userLoginKey) || 0;
      if (ipCount > 5) {
        suspicious.push({
          type: 'multiple_ip_access',
          severity: 'medium',
          details: `Access from ${ipCount} different IPs in 24h`
        });
      }
      
      // Vérifier les connexions rapides successives
      const rapidLoginKey = `rapid_login:${userId}`;
      const rapidLogins = await cacheService.client?.incr(rapidLoginKey) || 0;
      await cacheService.client?.expire(rapidLoginKey, 300); // 5 minutes
      
      if (rapidLogins > 10) {
        suspicious.push({
          type: 'rapid_successive_logins',
          severity: 'high',
          details: `${rapidLogins} logins in 5 minutes`
        });
      }
      
      // Si activité suspecte détectée, tracker l'événement
      if (suspicious.length > 0) {
        await this.trackEvent(this.events.SUSPICIOUS_ACTIVITY, userId, {
          ip,
          userAgent,
          suspiciousActivities: suspicious,
          severity: suspicious.some(s => s.severity === 'high') ? 'high' : 'medium'
        });
      }
      
      return suspicious;
    } catch (error) {
      logger.error('Failed to detect suspicious activity:', error);
      return [];
    }
  }

  // Générer un rapport quotidien
  async generateDailyReport(date = null) {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      const stats = await this.getDailyStats(targetDate);
      
      // Calculer les métriques dérivées
      const metrics = {
        date: targetDate,
        totalEvents: stats.total || 0,
        newUsers: stats[this.events.USER_REGISTERED] || 0,
        totalLogins: stats[this.events.USER_LOGIN] || 0,
        failedLogins: stats[this.events.FAILED_LOGIN_ATTEMPT] || 0,
        emailVerifications: stats[this.events.EMAIL_VERIFIED] || 0,
        passwordResets: stats[this.events.PASSWORD_RESET_REQUESTED] || 0,
        suspiciousActivities: stats[this.events.SUSPICIOUS_ACTIVITY] || 0,
        errors: stats[this.events.ERROR_OCCURRED] || 0
      };
      
      // Calculer les taux
      metrics.loginSuccessRate = metrics.totalLogins > 0 
        ? ((metrics.totalLogins / (metrics.totalLogins + metrics.failedLogins)) * 100).toFixed(2)
        : 100;
        
      metrics.verificationRate = metrics.newUsers > 0
        ? ((metrics.emailVerifications / metrics.newUsers) * 100).toFixed(2)
        : 0;
      
      // Comparer avec la veille
      const yesterday = new Date(new Date(targetDate).getTime() - 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];
      const yesterdayStats = await this.getDailyStats(yesterday);
      
      metrics.trends = {
        newUsers: this.calculateTrend(stats[this.events.USER_REGISTERED], yesterdayStats[this.events.USER_REGISTERED]),
        logins: this.calculateTrend(stats[this.events.USER_LOGIN], yesterdayStats[this.events.USER_LOGIN]),
        errors: this.calculateTrend(stats[this.events.ERROR_OCCURRED], yesterdayStats[this.events.ERROR_OCCURRED])
      };
      
      return metrics;
    } catch (error) {
      logger.error('Failed to generate daily report:', error);
      return null;
    }
  }

  // Calculer la tendance entre deux valeurs
  calculateTrend(current, previous) {
    if (!previous || previous === 0) {
      return current > 0 ? '+100%' : '0%';
    }
    
    const change = ((current - previous) / previous) * 100;
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  }

  // Middleware pour tracker automatiquement les appels API
  static trackApiCall() {
    return async (req, res, next) => {
      const startTime = Date.now();
      
      // Override res.end to capture response
      const originalEnd = res.end;
      res.end = function(...args) {
        const responseTime = Date.now() - startTime;
        
        // Track the API call
        const analyticsService = new AnalyticsService();
        analyticsService.trackEvent(analyticsService.events.API_CALL, req.user?.id, {
          method: req.method,
          endpoint: req.originalUrl || req.url,
          statusCode: res.statusCode,
          responseTime,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        }).catch(error => logger.error('Failed to track API call:', error));
        
        return originalEnd.apply(this, args);
      };
      
      next();
    };
  }

  // Middleware pour tracker les erreurs
  static trackErrors() {
    return (error, req, res, next) => {
      const analyticsService = new AnalyticsService();
      analyticsService.trackEvent(analyticsService.events.ERROR_OCCURRED, req.user?.id, {
        error: error.message,
        stack: error.stack,
        endpoint: req.originalUrl || req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }).catch(err => logger.error('Failed to track error:', err));
      
      next(error);
    };
  }
}

module.exports = new AnalyticsService();