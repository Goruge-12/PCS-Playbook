jest.mock('../config/db', () => ({ query: jest.fn() }));
jest.mock('../utils/emailService', () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
  sendTemporaryPassword: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('$hashed'),
  compare: jest.fn(),
}));

const request = require('supertest');
const app = require('../app');
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

afterEach(() => jest.clearAllMocks());

describe('POST /api/auth/register', () => {
  const validBody = {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@test.com',
    password: 'password123',
    phone: '555-1234',
    rank: 'Cpl',
    assigned_installation_id: 1,
  };

  it('creates a new user and returns 201', async () => {
    pool.query
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([{ insertId: 1 }]);

    const res = await request(app).post('/api/auth/register').send(validBody);
    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/created/i);
  });

  it('returns 400 when a required field is missing', async () => {
    const { phone, ...body } = validBody;
    const res = await request(app).post('/api/auth/register').send(body);
    expect(res.status).toBe(400);
  });

  it('returns 400 when email already exists', async () => {
    pool.query.mockResolvedValueOnce([[{ email: 'john@test.com' }]]);

    const res = await request(app).post('/api/auth/register').send(validBody);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it('returns 500 on database error', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).post('/api/auth/register').send(validBody);
    expect(res.status).toBe(500);
  });
});

describe('POST /api/auth/login', () => {
  const user = {
    user_id: 1,
    email: 'john@test.com',
    password: '$hashed',
    role: 'mentee',
    first_name: 'John',
    last_name: 'Doe',
    phone: '555-1234',
    rank: 'Cpl',
    assigned_installation_id: 1,
    profile_image_url: null,
    must_change_password: 0,
  };

  it('returns 200 with token on valid credentials', async () => {
    pool.query.mockResolvedValueOnce([[user]]);
    bcrypt.compare.mockResolvedValueOnce(true);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'john@test.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('john@test.com');
  });

  it('returns 400 when user is not found', async () => {
    pool.query.mockResolvedValueOnce([[]]);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'unknown@test.com', password: 'password123' });

    expect(res.status).toBe(400);
  });

  it('returns 400 on incorrect password', async () => {
    pool.query.mockResolvedValueOnce([[user]]);
    bcrypt.compare.mockResolvedValueOnce(false);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'john@test.com', password: 'wrong' });

    expect(res.status).toBe(400);
  });

  it('returns 500 on database error', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'john@test.com', password: 'password123' });

    expect(res.status).toBe(500);
  });
});

describe('POST /api/auth/forgot-password', () => {
  it('returns 200 and sends temp password email', async () => {
    pool.query
      .mockResolvedValueOnce([[{ user_id: 1, email: 'john@test.com' }]])
      .mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'john@test.com' });

    expect(res.status).toBe(200);
  });

  it('returns 400 when email field is missing', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({});
    expect(res.status).toBe(400);
  });

  it('returns 404 when email is not registered', async () => {
    pool.query.mockResolvedValueOnce([[]]);

    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'nobody@test.com' });

    expect(res.status).toBe(404);
  });

  it('returns 500 on database error', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'john@test.com' });

    expect(res.status).toBe(500);
  });
});

describe('PUT /api/auth/change-password', () => {
  const token = jwt.sign({ user_id: 1, role: 'mentee' }, 'test-secret');

  it('returns 200 on successful password change', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .put('/api/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ newPassword: 'newpassword1' });

    expect(res.status).toBe(200);
  });

  it('returns 401 when no token is provided', async () => {
    const res = await request(app)
      .put('/api/auth/change-password')
      .send({ newPassword: 'newpassword1' });

    expect(res.status).toBe(401);
  });

  it('returns 400 when password is shorter than 8 characters', async () => {
    const res = await request(app)
      .put('/api/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ newPassword: 'short' });

    expect(res.status).toBe(400);
  });

  it('returns 500 on database error', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app)
      .put('/api/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ newPassword: 'newpassword1' });

    expect(res.status).toBe(500);
  });
});
