const request = require('supertest');
const app = require('../../app');
const { generateAccessToken } = require('../../utils/jwt');

describe('GET /api/v1/admin/results/export', () => {
  it('returns a CSV export for an authenticated admin', async () => {
    const token = generateAccessToken({ userId: 'export-test-admin', role: 'ADMIN' });
    const response = await request(app)
      .get('/api/v1/admin/results/export')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/text\/csv/);
    expect(response.text).toContain('Attempt ID,Student,Exam,Score,Status,Submitted At');
  });
});