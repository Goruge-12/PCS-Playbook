jest.mock('../config/db', () => ({ query: jest.fn() }));
jest.mock('../utils/emailService', () => ({
  sendEmail: jest.fn(),
  sendTemporaryPassword: jest.fn(),
}));
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn(() => ({ send: jest.fn().mockResolvedValue({}) })),
  PutObjectCommand: jest.fn(params => params),
  DeleteObjectCommand: jest.fn(params => params),
}));

const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');

const adminToken = jwt.sign({ user_id: 1, role: 'admin' }, 'test-secret');
const menteeToken = jwt.sign({ user_id: 2, role: 'mentee' }, 'test-secret');

afterEach(() => jest.clearAllMocks());

describe('GET /api/admin/upload', () => {
  it('returns a connected message without auth', async () => {
    const res = await request(app).get('/api/admin/upload');
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/connected/i);
  });
});

describe('POST /api/admin/upload', () => {
  it('admin uploads an image successfully', async () => {
    const res = await request(app)
      .post('/api/admin/upload')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('image', Buffer.from('fake image data'), 'test.jpg')
      .field('folder', 'installation-images');

    expect(res.status).toBe(200);
    expect(res.body.imageUrl).toContain('amazonaws.com');
  });

  it('returns 400 when no file is provided', async () => {
    const res = await request(app)
      .post('/api/admin/upload')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it('returns 401 without token', async () => {
    const res = await request(app)
      .post('/api/admin/upload')
      .attach('image', Buffer.from('data'), 'test.jpg');

    expect(res.status).toBe(401);
  });

  it('returns 403 for non-admin users', async () => {
    const res = await request(app)
      .post('/api/admin/upload')
      .set('Authorization', `Bearer ${menteeToken}`)
      .attach('image', Buffer.from('data'), 'test.jpg');

    expect(res.status).toBe(403);
  });
});
