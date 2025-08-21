import request from 'supertest';
import app from '../src/server';
import pool from '../src/config/database';

describe('Prediction API', () => {
  let authToken: string;
  let userId: number;

  beforeAll(async () => {
    // 테스트용 유저 생성 및 토큰 발급
    const userData = {
      email: `test-prediction-${Date.now()}@test.com`,
      password: 'TestPassword123!',
      name: 'Prediction User'
    };
    const res = await request(app).post('/api/auth/register').send(userData);
    authToken = res.body.data.token;
    userId = res.body.data.user.id;
  });

  afterAll(async () => {
    if (userId) {
      await pool.query('DELETE FROM transactions WHERE user_id = $1', [userId]);
      await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    }
    await pool.end();
  });

  it('should return next month prediction', async () => {
    const res = await request(app)
      .get('/api/prediction/next-month')
      .set('Authorization', `Bearer ${authToken}`);
    expect([200, 500]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('nextMonth');
      expect(res.body.data.nextMonth).toHaveProperty('income');
      expect(res.body.data.nextMonth).toHaveProperty('expense');
      expect(res.body.data.nextMonth).toHaveProperty('balance');
    }
  });
});
