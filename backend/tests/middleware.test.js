jest.mock('../src/db/pool');
const request = require('supertest');
const app = require('../src/app');
const { signToken } = require('../src/utils/jwt');
const pool = require('../src/db/pool');

beforeEach(() => {
  pool.query.mockReset();
});

describe('auth middleware', () => {
  it('rejects a request with no Authorization header', async () => {
    const res = await request(app).get('/api/groups/mine');
    expect(res.status).toBe(401);
  });

  it('rejects a malformed token', async () => {
    const res = await request(app)
      .get('/api/groups/mine')
      .set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
  });

  it('rejects a student calling an admin-only route', async () => {
    const token = signToken({ id: 1, role: 'student', name: 'Divya', email: 'd@x.com' });
    const res = await request(app)
      .get('/api/groups')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('allows an admin to reach an admin-only route', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const token = signToken({ id: 2, role: 'admin', name: 'Prof', email: 'p@x.com' });
    const res = await request(app)
      .get('/api/groups')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});
