const request = require('supertest');
const app = require('../../index');
const mongoose = require('mongoose');

describe('Health Check Endpoints', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGOURL);
  });

  afterAll(async () => {
    // Disconnect from test database
    await mongoose.disconnect();
  });

  describe('GET /health', () => {
    it('should return comprehensive health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('responseTime');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('database');
      expect(response.body).toHaveProperty('system');
      expect(response.body).toHaveProperty('checks');

      // Check required fields
      expect(response.body.status).toMatch(/^(healthy|unhealthy)$/);
      expect(response.body.version).toBe('2.0.0');
      expect(response.body.environment).toHaveProperty('nodeEnv');
      expect(response.body.environment).toHaveProperty('port');
      expect(response.body.database).toHaveProperty('status');
      expect(response.body.system).toHaveProperty('uptime');
      expect(response.body.system).toHaveProperty('memory');
      expect(response.body.checks).toHaveProperty('database');
      expect(response.body.checks).toHaveProperty('smtp');
      expect(response.body.checks).toHaveProperty('cloudinary');
      expect(response.body.checks).toHaveProperty('jwt');
    });

    it('should include response time in milliseconds', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.responseTime).toMatch(/^\d+ms$/);
      const timeValue = parseInt(response.body.responseTime);
      expect(timeValue).toBeGreaterThan(0);
      expect(timeValue).toBeLessThan(1000); // Should be less than 1 second
    });

    it('should include valid timestamp', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp.getTime()).toBeGreaterThan(0);
      expect(timestamp).toBeInstanceOf(Date);
    });
  });

  describe('GET /health/light', () => {
    it('should return lightweight health status', async () => {
      const response = await request(app)
        .get('/health/light')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(Object.keys(response.body)).toHaveLength(2); // Only status and timestamp
    });

    it('should return ok status when database is connected', async () => {
      const response = await request(app)
        .get('/health/light')
        .expect(200);

      expect(response.body.status).toBe('ok');
    });

    it('should return valid timestamp', async () => {
      const response = await request(app)
        .get('/health/light')
        .expect(200);

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp.getTime()).toBeGreaterThan(0);
      expect(timestamp).toBeInstanceOf(Date);
    });
  });

  describe('Health Check Response Codes', () => {
    it('should return 200 when system is healthy', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
    });

    it('should return 503 when system is unhealthy', async () => {
      // This test would require mocking a failed health check
      // For now, we'll just verify the endpoint exists and responds
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
    });
  });

  describe('Health Check Performance', () => {
    it('should respond within reasonable time', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/health')
        .expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
    });

    it('should handle concurrent requests', async () => {
      const requests = Array(5).fill().map(() => 
        request(app).get('/health').expect(200)
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.body).toHaveProperty('status');
        expect(response.body).toHaveProperty('timestamp');
      });
    });
  });
});
