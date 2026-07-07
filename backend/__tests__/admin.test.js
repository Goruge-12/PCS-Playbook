jest.mock('../config/db', () => ({ query: jest.fn() }));
jest.mock('../utils/emailService', () => ({
  sendEmail: jest.fn(),
  sendTemporaryPassword: jest.fn(),
}));

const request = require('supertest');
const app = require('../app');
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

const adminToken = jwt.sign({ user_id: 99, role: 'admin' }, 'test-secret');
const menteeToken = jwt.sign({ user_id: 1, role: 'mentee' }, 'test-secret');

afterEach(() => jest.clearAllMocks());

describe('GET /api/admin/users', () => {
  it('admin gets all users', async () => {
    pool.query.mockResolvedValueOnce([[{ user_id: 1, first_name: 'John' }]]);

    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/admin/users');
    expect(res.status).toBe(401);
  });

  it('returns 403 for non-admin', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${menteeToken}`);

    expect(res.status).toBe(403);
  });
});

describe('PUT /api/admin/users/:id', () => {
  it('admin updates a user', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .put('/api/admin/users/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ first_name: 'Jane', last_name: 'Doe', email: 'jane@test.com', phone: '555', rank: 'Sgt', assigned_installation_id: 1 });

    expect(res.status).toBe(200);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).put('/api/admin/users/1').send({});
    expect(res.status).toBe(401);
  });
});

describe('PUT /api/admin/users/:id/role', () => {
  it('changes a user role to mentor (creates new mentor_profile)', async () => {
    pool.query
      .mockResolvedValueOnce([[{ role: 'mentee', assigned_installation_id: 1 }]])
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([{ insertId: 1 }])
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([{ insertId: 1 }]);

    const res = await request(app)
      .put('/api/admin/users/1/role')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'mentor' });

    expect(res.status).toBe(200);
  });

  it('maps "marine" to "mentee" and succeeds', async () => {
    pool.query
      .mockResolvedValueOnce([[{ role: 'mentor', assigned_installation_id: 1 }]])
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([{ insertId: 1 }])
      .mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .put('/api/admin/users/1/role')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'marine' });

    expect(res.status).toBe(200);
  });

  it('returns 400 for an invalid role', async () => {
    const res = await request(app)
      .put('/api/admin/users/1/role')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'superuser' });

    expect(res.status).toBe(400);
  });

  it('returns 404 when user is not found', async () => {
    pool.query.mockResolvedValueOnce([[]]);

    const res = await request(app)
      .put('/api/admin/users/999/role')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'mentor' });

    expect(res.status).toBe(404);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).put('/api/admin/users/1/role').send({ role: 'mentor' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/admin/requests', () => {
  it('admin gets all mentor requests', async () => {
    pool.query.mockResolvedValueOnce([[{ request_id: 1 }]]);

    const res = await request(app)
      .get('/api/admin/requests')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/admin/requests');
    expect(res.status).toBe(401);
  });
});

describe('PUT /api/admin/requests/:id/status', () => {
  it('admin updates request status', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .put('/api/admin/requests/1/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'approved' });

    expect(res.status).toBe(200);
  });
});

describe('PUT /api/admin/requests/:id/assign', () => {
  it('admin assigns a mentor to a request', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .put('/api/admin/requests/1/assign')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ mentor_user_id: 5 });

    expect(res.status).toBe(200);
  });

  it('returns 400 when mentor_user_id is missing', async () => {
    const res = await request(app)
      .put('/api/admin/requests/1/assign')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});

    expect(res.status).toBe(400);
  });
});

describe('GET /api/admin/mentors', () => {
  it('admin gets mentor list', async () => {
    pool.query.mockResolvedValueOnce([[{ user_id: 5, first_name: 'Jane' }]]);

    const res = await request(app)
      .get('/api/admin/mentors')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });
});

describe('GET /api/admin/installations', () => {
  it('admin gets all installations', async () => {
    pool.query.mockResolvedValueOnce([[{ installation_id: 1 }]]);

    const res = await request(app)
      .get('/api/admin/installations')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });
});

describe('GET /api/admin/units', () => {
  it('admin gets all units', async () => {
    pool.query.mockResolvedValueOnce([[{ unit_id: 1 }]]);

    const res = await request(app)
      .get('/api/admin/units')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });
});

describe('PUT /api/admin/installations/:id', () => {
  it('admin updates installation details', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .put('/api/admin/installations/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ installation_name: 'Updated Base', state: 'CA', zip_code: '92055' });

    expect(res.status).toBe(200);
  });
});

describe('PUT /api/admin/units/:id', () => {
  it('admin updates unit details', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .put('/api/admin/units/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ unit_name: 'Updated Unit' });

    expect(res.status).toBe(200);
  });
});
