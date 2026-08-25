jest.mock('../src/db/pool');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const pool = require('../src/db/pool');
const app = require('../src/app');

beforeEach(() => {
  pool.query.mockReset();
});

describe('POST /api/auth/register', () => {
  it('rejects a missing email with 400, not a 500', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Divya', password: 'password123' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('rejects a short password with 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Divya', email: 'divya@example.com', password: '123' });
    expect(res.status).toBe(400);
  });

  it('registers a valid student and returns a token', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [{ id: 1, name: 'Divya', email: 'divya@example.com', role: 'student', student_id: null }],
      });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Divya', email: 'divya@example.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('divya@example.com');
  });

  it('rejects a duplicate email with 409', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Divya', email: 'divya@example.com', password: 'password123' });

    expect(res.status).toBe(409);
  });
});

describe('POST /api/auth/login', () => {
  it('rejects an invalid email format with 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'not-an-email', password: 'password123' });
    expect(res.status).toBe(400);
  });

  it('returns 401 for a wrong password', async () => {
    const hash = await bcrypt.hash('correct-password', 10);
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, email: 'divya@example.com', password_hash: hash, role: 'student' }],
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'divya@example.com', password: 'wrong-password' });

    expect(res.status).toBe(401);
  });

  it('logs in successfully with the correct password', async () => {
    const hash = await bcrypt.hash('correct-password', 10);
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, email: 'divya@example.com', password_hash: hash, role: 'student', name: 'Divya' }],
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'divya@example.com', password: 'correct-password' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.password_hash).toBeUndefined();
  });
});
