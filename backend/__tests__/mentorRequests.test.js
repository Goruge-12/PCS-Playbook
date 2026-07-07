jest.mock('../config/db', () => ({ query: jest.fn() }));
jest.mock('../utils/emailService', () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
  sendTemporaryPassword: jest.fn().mockResolvedValue(undefined),
}));

const request = require('supertest');
const app = require('../app');
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

const menteeToken = jwt.sign({ user_id: 1, role: 'mentee' }, 'test-secret');
const mentorToken = jwt.sign({ user_id: 2, role: 'mentor' }, 'test-secret');

const menteeRow = {
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@test.com',
  phone: '555-1234',
  rank: 'Cpl',
};

afterEach(() => jest.clearAllMocks());

describe('POST /api/mentor-requests', () => {
  it('creates a request when no mentor is available', async () => {
    pool.query
      .mockResolvedValueOnce([[menteeRow]])     // user lookup
      .mockResolvedValueOnce([[]])              // no mentor found
      .mockResolvedValueOnce([{ insertId: 1 }]); // insert request

    const res = await request(app)
      .post('/api/mentor-requests')
      .set('Authorization', `Bearer ${menteeToken}`)
      .send({ installation_id: 1, message: 'Please help me PCS.' });

    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/submitted/i);
  });

  it('creates a request and assigns a mentor when one is available', async () => {
    pool.query
      .mockResolvedValueOnce([[menteeRow]])
      .mockResolvedValueOnce([[{ user_id: 5, email: 'mentor@test.com', first_name: 'Mark', last_name: 'Adams', rank: 'SSgt' }]])
      .mockResolvedValueOnce([{ insertId: 2 }]);

    const res = await request(app)
      .post('/api/mentor-requests')
      .set('Authorization', `Bearer ${menteeToken}`)
      .send({ installation_id: 1, message: 'Help needed.' });

    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/assigned/i);
  });

  it('returns 401 when no token is provided', async () => {
    const res = await request(app)
      .post('/api/mentor-requests')
      .send({ installation_id: 1, message: 'Test' });

    expect(res.status).toBe(401);
  });

  it('returns 404 when the requesting user is not found', async () => {
    pool.query.mockResolvedValueOnce([[]]);

    const res = await request(app)
      .post('/api/mentor-requests')
      .set('Authorization', `Bearer ${menteeToken}`)
      .send({ installation_id: 1, message: 'Test' });

    expect(res.status).toBe(404);
  });
});

describe('GET /api/mentor-requests/my-requests', () => {
  it('returns the current user\'s requests', async () => {
    pool.query.mockResolvedValueOnce([[{ request_id: 1, status: 'pending' }]]);

    const res = await request(app)
      .get('/api/mentor-requests/my-requests')
      .set('Authorization', `Bearer ${menteeToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/mentor-requests/my-requests');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/mentor-requests/mentor-queue', () => {
  it('returns empty array when user has no mentor profile', async () => {
    pool.query.mockResolvedValueOnce([[]]); // no mentor_profiles row

    const res = await request(app)
      .get('/api/mentor-requests/mentor-queue')
      .set('Authorization', `Bearer ${mentorToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns queued requests for an active mentor', async () => {
    pool.query
      .mockResolvedValueOnce([[{ installation_id: 1 }]])  // mentor_profiles
      .mockResolvedValueOnce([[{ request_id: 3, status: 'pending' }]]); // requests

    const res = await request(app)
      .get('/api/mentor-requests/mentor-queue')
      .set('Authorization', `Bearer ${mentorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/mentor-requests/mentor-queue');
    expect(res.status).toBe(401);
  });
});

describe('PUT /api/mentor-requests/:id/reply', () => {
  it('saves a mentor reply', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .put('/api/mentor-requests/1/reply')
      .set('Authorization', `Bearer ${mentorToken}`)
      .send({ mentor_reply: 'Happy to help!' });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/saved/i);
  });

  it('returns 401 without auth', async () => {
    const res = await request(app)
      .put('/api/mentor-requests/1/reply')
      .send({ mentor_reply: 'Hi' });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/mentor-requests/:id/messages', () => {
  it('returns messages for a request', async () => {
    pool.query.mockResolvedValueOnce([[{ message_id: 1, message: 'Hello' }]]);

    const res = await request(app)
      .get('/api/mentor-requests/1/messages')
      .set('Authorization', `Bearer ${menteeToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/mentor-requests/1/messages');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/mentor-requests/:id/messages', () => {
  it('creates a message on a request', async () => {
    pool.query
      .mockResolvedValueOnce([{ insertId: 1 }])  // insert message
      .mockResolvedValueOnce([[{ mentee_email: 'john@test.com', mentee_name: 'Cpl Doe', mentor_user_id: 2, mentor_email: 'mentor@test.com' }]])  // request lookup
      .mockResolvedValueOnce([[{ first_name: 'Mark', last_name: 'Adams', rank: 'SSgt' }]]);  // sender lookup

    const res = await request(app)
      .post('/api/mentor-requests/1/messages')
      .set('Authorization', `Bearer ${mentorToken}`)
      .send({ message: 'Ready when you are.' });

    expect(res.status).toBe(201);
  });

  it('returns 401 without auth', async () => {
    const res = await request(app)
      .post('/api/mentor-requests/1/messages')
      .send({ message: 'Test' });

    expect(res.status).toBe(401);
  });
});
