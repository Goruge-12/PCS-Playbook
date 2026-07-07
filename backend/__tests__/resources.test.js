jest.mock('../config/db', () => ({ query: jest.fn() }));
jest.mock('../utils/emailService', () => ({
  sendEmail: jest.fn(),
  sendTemporaryPassword: jest.fn(),
}));

const request = require('supertest');
const app = require('../app');
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

const adminToken = jwt.sign({ user_id: 1, role: 'admin' }, 'test-secret');
const menteeToken = jwt.sign({ user_id: 2, role: 'mentee' }, 'test-secret');

afterEach(() => jest.clearAllMocks());

const fakeResource = { resource_id: 1, title: 'MilConnect', category: 'Benefits', is_active: 1 };

describe('GET /api/resources', () => {
  it('returns active resources', async () => {
    pool.query.mockResolvedValueOnce([[fakeResource]]);

    const res = await request(app).get('/api/resources');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('returns 500 on database error', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).get('/api/resources');
    expect(res.status).toBe(500);
  });
});

describe('GET /api/resources/admin', () => {
  it('admin gets all resources including inactive', async () => {
    pool.query.mockResolvedValueOnce([[fakeResource]]);

    const res = await request(app)
      .get('/api/resources/admin')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/resources/admin');
    expect(res.status).toBe(401);
  });

  it('returns 403 for non-admin', async () => {
    const res = await request(app)
      .get('/api/resources/admin')
      .set('Authorization', `Bearer ${menteeToken}`);

    expect(res.status).toBe(403);
  });
});

describe('POST /api/resources', () => {
  const body = { category: 'Housing', title: 'BAH Calculator', description: 'Calc', website_url: 'https://example.com' };

  it('admin creates a resource', async () => {
    pool.query.mockResolvedValueOnce([{ insertId: 3 }]);

    const res = await request(app)
      .post('/api/resources')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(body);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/added/i);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).post('/api/resources').send(body);
    expect(res.status).toBe(401);
  });
});

describe('PUT /api/resources/:resourceId', () => {
  it('admin updates a resource', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .put('/api/resources/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Updated', category: 'Housing', description: 'Desc', website_url: 'https://x.com', display_order: 1, is_active: 1 });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/updated/i);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).put('/api/resources/1').send({});
    expect(res.status).toBe(401);
  });
});

describe('DELETE /api/resources/:resourceId', () => {
  it('admin deletes a resource', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .delete('/api/resources/1')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).delete('/api/resources/1');
    expect(res.status).toBe(401);
  });
});
