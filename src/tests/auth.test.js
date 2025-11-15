const request = require('supertest');
const app = require('../server');
const { User, OTP } = require('../models');
const { sequelize } = require('../config/database');

describe('Auth API', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/auth/send-otp', () => {
    it('should send OTP successfully', async () => {
      const res = await request(app)
        .post('/api/auth/send-otp')
        .send({ phoneNumber: '+1234567890' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('OTP sent successfully');

      // In development, OTP should be returned
      if (process.env.NODE_ENV === 'development') {
        expect(res.body.otp).toBeDefined();
      }
    });

    it('should fail with invalid phone number', async () => {
      const res = await request(app)
        .post('/api/auth/send-otp')
        .send({ phoneNumber: 'invalid' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/verify-otp', () => {
    beforeEach(async () => {
      await OTP.destroy({ where: {} });
      await User.destroy({ where: {} });
    });

    it('should verify OTP and return token', async () => {
      const phoneNumber = '+1234567890';

      // First send OTP
      await request(app)
        .post('/api/auth/send-otp')
        .send({ phoneNumber });

      // Then verify with correct OTP (123456 in dev)
      const res = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          phoneNumber,
          otp: process.env.OTP_MOCK || '123456'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.phoneNumber).toBe(phoneNumber);
    });

    it('should fail with invalid OTP', async () => {
      const phoneNumber = '+1234567890';

      // First send OTP
      await request(app)
        .post('/api/auth/send-otp')
        .send({ phoneNumber });

      // Then verify with wrong OTP
      const res = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          phoneNumber,
          otp: '999999'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid OTP');
    });
  });

  describe('GET /api/auth/profile', () => {
    let token;

    beforeEach(async () => {
      await User.destroy({ where: {} });
      await OTP.destroy({ where: {} });

      const phoneNumber = '+1234567890';

      // Send OTP
      await request(app)
        .post('/api/auth/send-otp')
        .send({ phoneNumber });

      // Verify and get token
      const res = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          phoneNumber,
          otp: process.env.OTP_MOCK || '123456'
        });

      token = res.body.data.token;
    });

    it('should get user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
    });

    it('should fail without token', async () => {
      const res = await request(app)
        .get('/api/auth/profile');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
