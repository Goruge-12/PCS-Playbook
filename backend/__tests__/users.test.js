jest.mock('../config/db', () => ({ query: jest.fn() }));
jest.mock('../config/s3', () => ({
  uploadToS3: jest.fn().mockResolvedValue('https://s3.test/profile.jpg'),
}));
jest.mock('../utils/emailService', () => ({
  sendEmail: jest.fn(),
  sendTemporaryPassword: jest.fn(),
}));

const request = require('supertest');
const app = require('../app');
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

const token = jwt.sign({ user_id: 1, role: 'mentee' }, 'test-secret');

afterEach(() => jest.clearAllMocks());

const profileRow = {
  user_id: 1,
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@test.com',
  phone: '555-1234',
  role: 'mentee',
  rank: 'Cpl',
  assigned_installation_id: 1,
  profile_image_url: null,
};

describe('GET /api/users/profile', () => {
  it('returns the authenticated user\'s profile', async () => {
    pool.query.mockResolvedValueOnce([[profileRow]]);

    const res = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('john@test.com');
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/users/profile');
    expect(res.status).toBe(401);
  });

  it('returns 404 when user does not exist', async () => {
    pool.query.mockResolvedValueOnce([[]]);

    const res = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it('returns 500 on database error', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(500);
  });
});

describe('PUT /api/users/profile', () => {
  it('updates the user profile', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ first_name: 'Jane', last_name: 'Doe', email: 'jane@test.com', phone: '555-5678', assigned_installation_id: 2 });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/updated/i);
  });

  it('hashes the password when a new one is provided', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ first_name: 'Jane', last_name: 'Doe', email: 'jane@test.com', phone: '555-0000', assigned_installation_id: 1, password: 'newpass123' });

    expect(res.status).toBe(200);
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).put('/api/users/profile').send({});
    expect(res.status).toBe(401);
  });
});

describe('PUT /api/users/profile/image', () => {
  it('updates the profile image', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .put('/api/users/profile/image')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', Buffer.from('fake-image'), 'photo.jpg');

    expect(res.status).toBe(200);
    expect(res.body.profile_image_url).toBeDefined();
  });

  it('returns 400 when no file is attached', async () => {
    const res = await request(app)
      .put('/api/users/profile/image')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).put('/api/users/profile/image');
    expect(res.status).toBe(401);
  });
});
