const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/models/User');

const { expect } = chai;
chai.use(chaiHttp);

describe('Auth API', () => {
  before(async () => {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  });

  after(async () => {
    await User.deleteMany({ email: /mocha-test/ });
    await mongoose.disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await chai.request(app)
        .post('/api/auth/register')
        .send({
          username: 'mocha_test_user',
          email: 'mocha-test-user@example.com',
          password: 'testpass123',
          firstName: 'Mocha',
          lastName: 'Test'
        });
      expect(res).to.have.status(201);
      expect(res.body).to.have.property('success', true);
      expect(res.body.data).to.have.property('user');
      expect(res.body.data.user).to.have.property('email', 'mocha-test-user@example.com');
      expect(res.body.data).to.have.property('token');
    });

    it('should not register with duplicate email', async () => {
      const res = await chai.request(app)
        .post('/api/auth/register')
        .send({
          username: 'mocha_test_user2',
          email: 'mocha-test-user@example.com',
          password: 'testpass123',
          firstName: 'Mocha',
          lastName: 'Test'
        });
      expect(res).to.have.status(409);
      expect(res.body.success).to.be.false;
      expect(res.body.error.message).to.match(/email/i);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with correct credentials', async () => {
      const res = await chai.request(app)
        .post('/api/auth/login')
        .send({
          email: 'mocha-test-user@example.com',
          password: 'testpass123'
        });
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body.data).to.have.property('token');
    });

    it('should not login with wrong password', async () => {
      const res = await chai.request(app)
        .post('/api/auth/login')
        .send({
          email: 'mocha-test-user@example.com',
          password: 'wrongpass'
        });
      expect(res).to.have.status(401);
      expect(res.body.success).to.be.false;
      expect(res.body.error.message).to.match(/invalid credentials/i);
    });
  });
});
