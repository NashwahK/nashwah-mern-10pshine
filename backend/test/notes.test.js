const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Note = require('../src/models/Note');

const { expect } = chai;
chai.use(chaiHttp);

let token;
let noteId;

// Test user credentials
const testUser = {
  username: 'mocha_note_user',
  email: 'mocha-note-user@example.com',
  password: 'testpass123',
  firstName: 'Mocha',
  lastName: 'Note'
};

describe('Notes API', () => {
  before(async () => {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    await User.deleteMany({ email: /mocha-note-user/ });
    await Note.deleteMany({});
    // Register and login test user
    await chai.request(app).post('/api/auth/register').send(testUser);
    const res = await chai.request(app).post('/api/auth/login').send({ email: testUser.email, password: testUser.password });
    token = res.body.data.token;
  });

  after(async () => {
    await User.deleteMany({ email: /mocha-note-user/ });
    await Note.deleteMany({});
    await mongoose.disconnect();
  });

  describe('POST /api/notes', () => {
    it('should create a new note', async () => {
      const res = await chai.request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test Note', content: 'This is a test note.' });
      expect(res).to.have.status(201);
      expect(res.body.success).to.be.true;
      expect(res.body.data.note).to.have.property('title', 'Test Note');
      noteId = res.body.data.note._id;
    });
  });

  describe('GET /api/notes', () => {
    it('should get all notes for user', async () => {
      const res = await chai.request(app)
        .get('/api/notes')
        .set('Authorization', `Bearer ${token}`);
      expect(res).to.have.status(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data.notes).to.be.an('array');
    });
  });

  describe('GET /api/notes/:id', () => {
    it('should get a single note by id', async () => {
      const res = await chai.request(app)
        .get(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res).to.have.status(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data.note).to.have.property('title', 'Test Note');
    });
  });

  describe('PUT /api/notes/:id', () => {
    it('should update a note', async () => {
      const res = await chai.request(app)
        .put(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated Note', content: 'Updated content.' });
      expect(res).to.have.status(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data.note).to.have.property('title', 'Updated Note');
    });
  });

  describe('DELETE /api/notes/:id', () => {
    it('should delete a note', async () => {
      const res = await chai.request(app)
        .delete(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res).to.have.status(200);
      expect(res.body.success).to.be.true;
      expect(res.body.message).to.match(/deleted/i);
    });
  });
});
