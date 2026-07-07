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

afterEach(() => jest.clearAllMocks());

describe('GET /api/city-info/installation/:installationId', () => {
  it('returns city info and attractions', async () => {
    pool.query
      .mockResolvedValueOnce([[{ city_info_id: 1, city_summary: 'Nice city' }]])
      .mockResolvedValueOnce([[{ attraction_id: 1, title: 'Beach' }]]);

    const res = await request(app).get('/api/city-info/installation/1');
    expect(res.status).toBe(200);
    expect(res.body.cityInfo).toBeDefined();
    expect(Array.isArray(res.body.attractions)).toBe(true);
  });

  it('returns null cityInfo when none exists for the installation', async () => {
    pool.query
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[]]);

    const res = await request(app).get('/api/city-info/installation/999');
    expect(res.status).toBe(200);
    expect(res.body.cityInfo).toBeNull();
    expect(res.body.attractions).toEqual([]);
  });

  it('returns 500 on database error', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).get('/api/city-info/installation/1');
    expect(res.status).toBe(500);
  });
});

describe('PUT /api/city-info/installation/:installationId', () => {
  const body = { city_summary: 'Great place', weather: 'Sunny', transportation: 'Good', local_vibe: 'Chill', hidden_gems: 'Park', schools: 'A-rated', medical_facilities: 'Naval Hospital', housing: 'BAH-based' };

  it('creates city info when none exists', async () => {
    pool.query
      .mockResolvedValueOnce([[]])             // no existing record
      .mockResolvedValueOnce([{ insertId: 1 }]); // insert

    const res = await request(app)
      .put('/api/city-info/installation/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(body);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/saved/i);
  });

  it('updates city info when a record exists', async () => {
    pool.query
      .mockResolvedValueOnce([[{ city_info_id: 1 }]])  // existing record
      .mockResolvedValueOnce([{ affectedRows: 1 }]);    // update

    const res = await request(app)
      .put('/api/city-info/installation/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(body);

    expect(res.status).toBe(200);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).put('/api/city-info/installation/1').send(body);
    expect(res.status).toBe(401);
  });
});

describe('POST /api/city-info/installation/:installationId/attractions', () => {
  const body = { title: 'Del Mar Beach', description: 'Beautiful beach', image_url: '', website_url: 'https://example.com', display_order: 1 };

  it('admin adds an attraction', async () => {
    pool.query.mockResolvedValueOnce([{ insertId: 5 }]);

    const res = await request(app)
      .post('/api/city-info/installation/1/attractions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(body);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/added/i);
  });

  it('returns 401 without token', async () => {
    const res = await request(app)
      .post('/api/city-info/installation/1/attractions')
      .send(body);

    expect(res.status).toBe(401);
  });
});

describe('DELETE /api/city-info/attractions/:attractionId', () => {
  it('admin deletes an attraction', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .delete('/api/city-info/attractions/1')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/removed/i);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).delete('/api/city-info/attractions/1');
    expect(res.status).toBe(401);
  });
});

describe('PUT /api/city-info/attractions/:attractionId', () => {
  it('admin updates attraction display order', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .put('/api/city-info/attractions/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ display_order: 3 });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/updated/i);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).put('/api/city-info/attractions/1').send({ display_order: 1 });
    expect(res.status).toBe(401);
  });
});
