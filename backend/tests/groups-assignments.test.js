jest.mock('../src/db/pool');
const request = require('supertest');
const app = require('../src/app');
const { signToken } = require('../src/utils/jwt');
const pool = require('../src/db/pool');

const studentToken = signToken({ id: 1, role: 'student', name: 'Divya', email: 'd@x.com' });
const adminToken = signToken({ id: 9, role: 'admin', name: 'Prof', email: 'p@x.com' });

beforeEach(() => {
  pool.query.mockReset();
  pool.connect.mockReset();
});

describe('POST /api/groups', () => {
  it('rejects an empty group name with 400', async () => {
    const res = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ name: '' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/groups/:groupId/members', () => {
  it('rejects a request with neither email nor student_id', async () => {
    const res = await request(app)
      .post('/api/groups/1/members')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({});
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/groups/:groupId/members/:userId', () => {
  it('refuses to let a non-leader remove a member', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1, leader_id: 99 }] });
    const res = await request(app)
      .delete('/api/groups/1/members/5')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(403);
  });

  it('refuses to remove the leader themselves', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1, leader_id: 1 }] });
    const res = await request(app)
      .delete('/api/groups/1/members/1')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(400);
  });
});

describe('POST /api/groups/:groupId/leave', () => {
  it('refuses to let the leader leave', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1, leader_id: 1 }] });
    const res = await request(app)
      .post('/api/groups/1/leave')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(400);
  });
});

describe('POST /api/assignments', () => {
  it('rejects an invalid OneDrive URL with 400', async () => {
    const res = await request(app)
      .post('/api/assignments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'HW1', due_date: '2026-09-01T00:00:00Z', onedrive_link: 'not-a-url' });
    expect(res.status).toBe(400);
  });

  it('rejects a missing due_date with 400', async () => {
    const res = await request(app)
      .post('/api/assignments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'HW1', onedrive_link: 'https://onedrive.live.com/abc' });
    expect(res.status).toBe(400);
  });
});
