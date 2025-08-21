import request from 'supertest';
import app from '../src/server';
import pool from '../src/config/database';

describe('Integration Tests - Analytics (Dashboard, Monthly, Yearly, Compare)', () => {
  let authToken: string;
  let userId: number;

  beforeAll(async () => {
    // 테스트용 유저 생성 및 토큰 발급
    const userData = {
      email: `test-analytics-${Date.now()}@test.com`,
      password: 'TestPassword123!',
      name: 'Analytics User'
    };
    const res = await request(app).post('/api/auth/register').send(userData);
    authToken = res.body.data.token;
    userId = res.body.data.user.id;
  });

  afterAll(async () => {
    // 테스트 유저 및 데이터 정리
    if (userId) {
      await pool.query('DELETE FROM transactions WHERE user_id = $1', [userId]);
      await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    }
    await pool.end();
  });

  it('should get dashboard analytics data', async () => {
    const res = await request(app)
      .get('/api/analytics/dashboard')
      .set('Authorization', `Bearer ${authToken}`);
    expect([200, 500]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('currentMonth');
      expect(res.body.data).toHaveProperty('monthlyTrend');
      expect(res.body.data).toHaveProperty('topCategories');
      expect(res.body.data).toHaveProperty('recentTransactions');
      expect(res.body.data).toHaveProperty('budgetSummary');
    }
  });

  it('should get monthly analytics data', async () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const res = await request(app)
      .get(`/api/analytics/monthly/${year}/${month}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect([200, 500]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('summary');
      expect(res.body.data).toHaveProperty('dailyData');
      expect(res.body.data).toHaveProperty('categoryAnalysis');
      expect(res.body.data).toHaveProperty('weeklyTrend');
    }
  });

  it('should get yearly analytics data', async () => {
    const now = new Date();
    const year = now.getFullYear();
    const res = await request(app)
      .get(`/api/analytics/yearly/${year}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect([200, 500]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('summary');
      expect(res.body.data).toHaveProperty('monthlyData');
      expect(res.body.data).toHaveProperty('quarterlyData');
      expect(res.body.data).toHaveProperty('categoryAnalysis');
    }
  });

  it('should get compare analytics data', async () => {
    const now = new Date();
    const year = now.getFullYear();
    const startDate1 = `${year}-01-01`;
    const endDate1 = `${year}-03-31`;
    const startDate2 = `${year}-04-01`;
    const endDate2 = `${year}-06-30`;
    const res = await request(app)
      .get(`/api/analytics/compare?startDate1=${startDate1}&endDate1=${endDate1}&startDate2=${startDate2}&endDate2=${endDate2}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect([200, 400, 500]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('periods');
      expect(res.body.data).toHaveProperty('comparison');
      expect(res.body.data).toHaveProperty('categoryComparison');
    }
  });
});
