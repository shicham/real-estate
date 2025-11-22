const request = require('supertest');
const app = require('../src/app');

describe('API Health Check', () => {
  test('GET /health should return 200', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('service', 'Authentication API');
  });

  test('GET /api/v1/auth/health should return 200', async () => {
    const response = await request(app)
      .get('/api/v1/auth/health')
      .expect(200);
    
    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('service', 'Authentication Routes');
  });
});

describe('API Endpoints', () => {
  test('POST /api/v1/auth/register should return validation error for missing data', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({})
      .expect(400);
    
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('errors');
    expect(Array.isArray(response.body.errors)).toBe(true);
  });

  test('POST /api/v1/auth/login should return validation error for missing data', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({})
      .expect(400);
    
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('errors');
    expect(Array.isArray(response.body.errors)).toBe(true);
  });

  test('GET /api/v1/auth/profile should return 401 without token', async () => {
    await request(app)
      .get('/api/v1/auth/profile')
      .expect(401);
  });
});