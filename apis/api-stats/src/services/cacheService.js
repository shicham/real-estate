const redis = require('redis');
const logger = require('../utils/logger');

class CacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.init();
  }

  async init() {
    try {
      this.client = redis.createClient({
        socket: {
          host: process.env.REDIS_HOST || 'localhost',
          port: process.env.REDIS_PORT || 6379
        },
        username: process.env.REDIS_USERNAME || 'hsassa',
        password: process.env.REDIS_PASSWORD,
        database: process.env.REDIS_DB || 0,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true
      });

      this.client.on('connect', () => {
        logger.info('🔥 Redis client connected');
        this.isConnected = true;
      });

      this.client.on('error', (err) => {
        logger.error('Redis client error:', err);
        this.isConnected = false;
      });

      this.client.on('end', () => {
        logger.warn('Redis client disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      logger.error('Failed to initialize Redis:', error);
      this.isConnected = false;
    }
  }

  // Session management
  async setSession(sessionId, userId, data, ttlSeconds = 86400) {
    if (!this.isConnected) return false;
    
    try {
      const sessionData = {
        userId,
        ...data,
        lang: data.lang || 'fr',
        createdAt: new Date().toISOString(),
        lastAccess: new Date().toISOString()
      };
      
      await this.client.setEx(`session:${sessionId}`, ttlSeconds, JSON.stringify(sessionData));
      
      // Track user sessions
      await this.client.sAdd(`user:${userId}:sessions`, sessionId);
      await this.client.expire(`user:${userId}:sessions`, ttlSeconds);
      
      return true;
    } catch (error) {
      logger.error('Failed to set session:', error);
      return false;
    }
  }

  async getSession(sessionId) {
    if (!this.isConnected) return null;
    
    try {
      const data = await this.client.get(`session:${sessionId}`);
      if (!data) return null;
      
      const sessionData = JSON.parse(data);
      
      // Update last access
      sessionData.lastAccess = new Date().toISOString();
      await this.client.setEx(`session:${sessionId}`, 86400, JSON.stringify(sessionData));
      
      return sessionData;
    } catch (error) {
      logger.error('Failed to get session:', error);
      return null;
    }
  }

  async deleteSession(sessionId) {
    if (!this.isConnected) return false;
    
    try {
      const sessionData = await this.getSession(sessionId);
      if (sessionData) {
        await this.client.sRem(`user:${sessionData.userId}:sessions`, sessionId);
      }
      
      await this.client.del(`session:${sessionId}`);
      return true;
    } catch (error) {
      logger.error('Failed to delete session:', error);
      return false;
    }
  }

  // Rate limiting
  async checkRateLimit(key, limit, windowSeconds) {
    if (!this.isConnected) return { allowed: true, remaining: limit };
    
    try {
      const pipeline = this.client.multi();
      const now = Date.now();
      const window = windowSeconds * 1000;
      const cutoff = now - window;
      
      // Remove old entries
      pipeline.zRemRangeByScore(`rate:${key}`, 0, cutoff);
      
      // Count current requests
      pipeline.zCard(`rate:${key}`);
      
      // Add current request
      pipeline.zAdd(`rate:${key}`, now, `${now}-${Math.random()}`);
      
      // Set expiration
      pipeline.expire(`rate:${key}`, windowSeconds);
      
      const results = await pipeline.exec();
      const currentCount = results[1][1];
      
      const allowed = currentCount < limit;
      const remaining = Math.max(0, limit - currentCount - 1);
      
      return { allowed, remaining, resetTime: now + window };
    } catch (error) {
      logger.error('Rate limit check failed:', error);
      return { allowed: true, remaining: limit };
    }
  }

  // Cache general purpose
  async set(key, value, ttlSeconds = 3600) {
    if (!this.isConnected) return false;
    
    try {
      const data = typeof value === 'string' ? value : JSON.stringify(value);
      await this.client.setEx(key, ttlSeconds, data);
      return true;
    } catch (error) {
      logger.error('Failed to set cache:', error);
      return false;
    }
  }

  async get(key) {
    if (!this.isConnected) return null;
    
    try {
      const data = await this.client.get(key);
      if (!data) return null;
      
      try {
        return JSON.parse(data);
      } catch {
        return data;
      }
    } catch (error) {
      logger.error('Failed to get cache:', error);
      return null;
    }
  }

  async del(key) {
    if (!this.isConnected) return false;
    
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Failed to delete cache:', error);
      return false;
    }
  }

  // User activity tracking
  async trackUserActivity(userId, action, metadata = {}) {
    if (!this.isConnected) return false;
    
    try {
      const activity = {
        action,
        timestamp: new Date().toISOString(),
        ...metadata
      };
      
      // Add to user activity log (keep last 100 activities)
      await this.client.lPush(`user:${userId}:activity`, JSON.stringify(activity));
      await this.client.lTrim(`user:${userId}:activity`, 0, 99);
      await this.client.expire(`user:${userId}:activity`, 86400 * 30); // 30 days
      
      return true;
    } catch (error) {
      logger.error('Failed to track user activity:', error);
      return false;
    }
  }

  async getUserActivity(userId, limit = 10) {
    if (!this.isConnected) return [];
    
    try {
      const activities = await this.client.lRange(`user:${userId}:activity`, 0, limit - 1);
      return activities.map(activity => JSON.parse(activity));
    } catch (error) {
      logger.error('Failed to get user activity:', error);
      return [];
    }
  }

  // Authentication attempts tracking
  async trackFailedLogin(identifier, ip) {
    if (!this.isConnected) return false;
    
    try {
      const key = `failed_login:${identifier}:${ip}`;
      const attempts = await this.client.incr(key);
      await this.client.expire(key, 900); // 15 minutes
      
      return attempts;
    } catch (error) {
      logger.error('Failed to track failed login:', error);
      return 0;
    }
  }

  async getFailedLoginAttempts(identifier, ip) {
    if (!this.isConnected) return 0;
    
    try {
      const attempts = await this.client.get(`failed_login:${identifier}:${ip}`);
      return parseInt(attempts) || 0;
    } catch (error) {
      logger.error('Failed to get failed login attempts:', error);
      return 0;
    }
  }

  async clearFailedLoginAttempts(identifier, ip) {
    if (!this.isConnected) return false;
    
    try {
      await this.client.del(`failed_login:${identifier}:${ip}`);
      return true;
    } catch (error) {
      logger.error('Failed to clear failed login attempts:', error);
      return false;
    }
  }

  // Health check
  async healthCheck() {
    try {
      if (!this.isConnected) return false;
      
      const testKey = 'health_check';
      await this.client.set(testKey, 'ok', { EX: 1 });
      const result = await this.client.get(testKey);
      await this.client.del(testKey);
      
      return result === 'ok';
    } catch (error) {
      logger.error('Redis health check failed:', error);
      return false;
    }
  }

  async disconnect() {
    try {
      if (this.client) {
        await this.client.quit();
        this.isConnected = false;
        logger.info('Redis client disconnected');
      }
    } catch (error) {
      logger.error('Failed to disconnect Redis:', error);
    }
  }
}

module.exports = new CacheService();