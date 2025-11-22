const analyticsService = require('../src/services/analyticsService');

describe('AnalyticsService', () => {
  test('should have events object with USER_LOGIN', () => {
    expect(analyticsService.events).toBeDefined();
    expect(analyticsService.events.USER_LOGIN).toBe('user_login');
  });

  test('should track an event and return true', async () => {
    const result = await analyticsService.trackEvent(
      analyticsService.events.USER_LOGIN,
      'test-user-id',
      { ip: '127.0.0.1', userAgent: 'jest-test' }
    );
    expect(result).toBe(true);
  });

  test('should get daily stats', async () => {
    const stats = await analyticsService.getDailyStats();
    expect(stats).toBeDefined();
    expect(typeof stats).toBe('object');
  });

  test('should get user stats', async () => {
    const stats = await analyticsService.getUserStats('test-user-id', 1);
    expect(stats).toBeDefined();
    expect(typeof stats).toBe('object');
  });
});
