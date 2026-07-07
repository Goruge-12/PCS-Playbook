jest.mock('../config/db', () => ({ query: jest.fn() }));
jest.mock('../utils/emailService', () => ({
  sendEmail: jest.fn(),
  sendTemporaryPassword: jest.fn(),
}));

const request = require('supertest');
const app = require('../app');
const pool = require('../config/db');

afterEach(() => jest.clearAllMocks());

describe('GET /api/mentors', () => {
  it('returns list of mentors', async () => {
    pool.query.mockResolvedValueOnce([[
      {
        mentor_id: 1,
        user_id: 5,
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane@test.com',
        installation_name: 'Camp Pendleton',
      },
    ]]);

    const res = await request(app).get('/api/mentors');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].first_name).toBe('Jane');
  });

  it('returns an empty array when no mentors exist', async () => {
    pool.query.mockResolvedValueOnce([[]]);

    const res = await request(app).get('/api/mentors');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns 500 on database error', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).get('/api/mentors');
    expect(res.status).toBe(500);
  });
});
