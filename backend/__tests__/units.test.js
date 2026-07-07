jest.mock('../config/db', () => ({ query: jest.fn() }));
jest.mock('../utils/emailService', () => ({
  sendEmail: jest.fn(),
  sendTemporaryPassword: jest.fn(),
}));

const request = require('supertest');
const app = require('../app');
const pool = require('../config/db');

afterEach(() => jest.clearAllMocks());

const fakeUnit = {
  unit_id: 1,
  unit_name: '3rd Marine Regiment',
  unit_type: 'Infantry',
  installation_id: 1,
  installation_name: 'Camp Pendleton',
};

describe('GET /api/units/search', () => {
  it('returns all units without a search term', async () => {
    pool.query.mockResolvedValueOnce([[fakeUnit]]);

    const res = await request(app).get('/api/units/search');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('filters by search term', async () => {
    pool.query.mockResolvedValueOnce([[fakeUnit]]);

    const res = await request(app).get('/api/units/search?search=regiment');
    expect(res.status).toBe(200);
  });

  it('returns 500 on database error', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).get('/api/units/search');
    expect(res.status).toBe(500);
  });
});

describe('GET /api/units/installation/:installationId', () => {
  it('returns units for an installation', async () => {
    pool.query.mockResolvedValueOnce([[fakeUnit]]);

    const res = await request(app).get('/api/units/installation/1');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('returns empty array for installation with no units', async () => {
    pool.query.mockResolvedValueOnce([[]]);

    const res = await request(app).get('/api/units/installation/999');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('GET /api/units/:unitId', () => {
  it('returns a unit when found', async () => {
    pool.query.mockResolvedValueOnce([[fakeUnit]]);

    const res = await request(app).get('/api/units/1');
    expect(res.status).toBe(200);
    expect(res.body.unit_name).toBe('3rd Marine Regiment');
  });

  it('returns 404 when unit is not found', async () => {
    pool.query.mockResolvedValueOnce([[]]);

    const res = await request(app).get('/api/units/999');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/units', () => {
  const body = { unit_name: 'New Unit', unit_type: 'Aviation', installation_id: 1 };

  it('creates a unit without requiring auth', async () => {
    pool.query.mockResolvedValueOnce([{ insertId: 10 }]);

    const res = await request(app).post('/api/units').send(body);
    expect(res.status).toBe(201);
  });

  it('returns 500 on database error', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).post('/api/units').send(body);
    expect(res.status).toBe(500);
  });
});

describe('DELETE /api/units/:unitId', () => {
  it('deletes a unit without requiring auth', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app).delete('/api/units/1');
    expect(res.status).toBe(200);
  });

  it('returns 404 when unit does not exist', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

    const res = await request(app).delete('/api/units/999');
    expect(res.status).toBe(404);
  });
});
