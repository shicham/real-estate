/**
 * Tests d'exemple (style class) pour /health et /
 * Mocke les modules redis et mongo avant d'importer l'app pour éviter I/O pendant l'import.
 */
jest.mock('../src/lib/redis', () => {
    const fakeRedis = {
        set: jest.fn().mockResolvedValue('OK'),
        get: jest.fn().mockResolvedValue(null),
        del: jest.fn().mockResolvedValue(1),
        incr: jest.fn().mockResolvedValue(1),
        expire: jest.fn().mockResolvedValue(1)
    };
    return {
        connectRedis: jest.fn().mockImplementation(() => fakeRedis),
        getRedis: jest.fn().mockImplementation(() => fakeRedis)
    };
});
jest.mock('../src/lib/mongo', () => {
    return {
        connectMongo: jest.fn().mockResolvedValue(undefined)
    };
});
import request from 'supertest';
import app from '../src/app';
class HealthTestSuite {
    constructor(appInstance) {
        this.app = appInstance;
    }
    async checkHealth() {
        const res = await request(this.app).get('/health');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ status: 'ok' });
    }
    async checkRoot() {
        const res = await request(this.app).get('/');
        expect(res.status).toBe(200);
        expect(res.text).toBe('api-auth service');
    }
}
describe('api-auth - basic endpoints (class style)', () => {
    const suite = new HealthTestSuite(app);
    it('GET /health returns { status: "ok" }', async () => {
        await suite.checkHealth();
    });
    it('GET / returns the service greeting', async () => {
        await suite.checkRoot();
    });
});
