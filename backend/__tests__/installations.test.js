jest.mock('../config/db', () => ({ query: jest.fn() }));
jest.mock('../config/s3', () => ({
  uploadToS3: jest.fn().mockResolvedValue('https://s3.test/image.jpg'),
}));
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

const fakeInstallation = {
  installation_id: 1,
  installation_name: 'Camp Pendleton',
  state: 'CA',
  zip_code: '92055',
};

describe('GET /api/installations', () => {
  it('returns all installations', async () => {
    pool.query.mockResolvedValueOnce([[fakeInstallation]]);

    const res = await request(app).get('/api/installations');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('accepts a search query parameter', async () => {
    pool.query.mockResolvedValueOnce([[fakeInstallation]]);

    const res = await request(app).get('/api/installations?search=pendleton');
    expect(res.status).toBe(200);
    const [sql] = pool.query.mock.calls[0];
    expect(sql).toContain('WHERE');
  });

  it('returns 500 on database error', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).get('/api/installations');
    expect(res.status).toBe(500);
  });
});

describe('GET /api/installations/regions', () => {
  it('returns region data', async () => {
    pool.query.mockResolvedValueOnce([[{ region_name: 'West', map_top: 10, map_left: 20 }]]);

    const res = await request(app).get('/api/installations/regions');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('GET /api/installations/:id', () => {
  it('returns the installation when found', async () => {
    pool.query.mockResolvedValueOnce([[fakeInstallation]]);

    const res = await request(app).get('/api/installations/1');
    expect(res.status).toBe(200);
    expect(res.body.installation_name).toBe('Camp Pendleton');
  });

  it('returns 404 when installation is not found', async () => {
    pool.query.mockResolvedValueOnce([[]]);

    const res = await request(app).get('/api/installations/999');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/installations', () => {
  const body = {
    installation_name: 'New Base',
    slug: 'new-base',
    state: 'TX',
    zip_code: '78201',
  };

  it('admin can create an installation', async () => {
    pool.query.mockResolvedValueOnce([{ insertId: 5 }]);

    const res = await request(app)
      .post('/api/installations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(body);

    expect(res.status).toBe(201);
    expect(res.body.installation_id).toBe(5);
  });

  it('returns 401 with no token', async () => {
    const res = await request(app).post('/api/installations').send(body);
    expect(res.status).toBe(401);
  });

  it('returns 403 for non-admin users', async () => {
    const res = await request(app)
      .post('/api/installations')
      .set('Authorization', `Bearer ${menteeToken}`)
      .send(body);

    expect(res.status).toBe(403);
  });
});

describe('PUT /api/installations/:id', () => {
  it('admin can update an installation', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .put('/api/installations/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ installation_name: 'Updated Name' });

    expect(res.status).toBe(200);
  });

  it('returns 401 with no token', async () => {
    const res = await request(app).put('/api/installations/1').send({});
    expect(res.status).toBe(401);
  });

  it('returns 404 when installation does not exist', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

    const res = await request(app)
      .put('/api/installations/999')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ installation_name: 'X' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/installations/:id', () => {
  it('admin can delete an installation', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .delete('/api/installations/1')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });

  it('returns 401 with no token', async () => {
    const res = await request(app).delete('/api/installations/1');
    expect(res.status).toBe(401);
  });

  it('returns 404 when installation does not exist', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

    const res = await request(app)
      .delete('/api/installations/999')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });
});
