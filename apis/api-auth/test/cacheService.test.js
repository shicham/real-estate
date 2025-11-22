const cacheService = require('../src/services/cacheService');
const { randomUUID } = require('crypto');

describe('CacheService', () => {
  beforeAll(async () => {
    await cacheService.init();
  });

  afterAll(async () => {
    await cacheService.disconnect();
  });

  test('should set and get cache value', async () => {
    const key = 'test:key';
    const value = { foo: 'bar' };
    await cacheService.set(key, value, 10);
    const result = await cacheService.get(key);
    expect(result).toEqual(value);
    await cacheService.del(key);
  });

  test('should set and get session', async () => {
  const sessionId = randomUUID();
  const userId = randomUUID();
    const data = { role: 'user' };
    await cacheService.setSession(sessionId, userId, data, 10);
    const session = await cacheService.getSession(sessionId);
    expect(session.userId).toBe(userId);
    expect(session.role).toBe('user');
    await cacheService.deleteSession(sessionId);
  });

  test('should track and get user activity', async () => {
  const userId = randomUUID();
    await cacheService.trackUserActivity(userId, 'login', { ip: '127.0.0.1' });
    const activities = await cacheService.getUserActivity(userId, 1);
    expect(activities[0].action).toBe('login');
    expect(activities[0].ip).toBe('127.0.0.1');
  });

  test('should track and clear failed login attempts', async () => {
  const identifier = randomUUID();
    const ip = '127.0.0.1';
    await cacheService.trackFailedLogin(identifier, ip);
    const attempts = await cacheService.getFailedLoginAttempts(identifier, ip);
    expect(attempts).toBeGreaterThanOrEqual(1);
    await cacheService.clearFailedLoginAttempts(identifier, ip);
    const cleared = await cacheService.getFailedLoginAttempts(identifier, ip);
    expect(cleared).toBe(0);
  });

  test('should pass health check', async () => {
    const healthy = await cacheService.healthCheck();
    expect(healthy).toBe(true);
  });
});
