import request from 'supertest';
import app from '../src/server';
import { ApiResponse, Budget } from '@finance-tracker/shared';

describe('Budget Routes', () => {
  let authToken: string;
  let userId: number;

  beforeAll(async () => {
    // 테스트용 사용자 등록 및 로그인
    const userData = {
      email: `budget-${Date.now()}@test.com`,
      password: 'TestPassword123!',
      name: 'Budget Test User'
    };

    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(userData);

    authToken = registerResponse.body.data.token;
    userId = registerResponse.body.data.user.id;
  });

  describe('POST /api/budgets', () => {
    it('should create a new budget', async () => {
      const budgetData = {
        category_key: 'food_restaurant',
        amount: 500000,
        period_start: '2025-08-01',
        period_end: '2025-08-31'
      };

      const response = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(budgetData)
        .expect(201);

      const body: ApiResponse<Budget> = response.body;
      
      expect(body.success).toBe(true);
      expect(body.data?.amount).toBe("500000.00");
      expect(body.data?.category_key).toBe(budgetData.category_key);
    });

    it('should prevent duplicate budgets for same category and period', async () => {
      const budgetData = {
        category_key: 'transport_public',
        amount: 300000,
        period_start: '2025-08-01',
        period_end: '2025-08-31'
      };

      // 첫 번째 예산 생성
      await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(budgetData);

      // 중복 예산 생성 시도
      const response = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(budgetData)
        .expect(409);

      const body: ApiResponse = response.body;
      expect(body.success).toBe(false);
      expect(body.error).toContain('해당 카테고리와 기간에 대한 예산이 존재');
    });
  });

  describe('GET /api/budgets', () => {
    it('should get user budgets', async () => {
      const response = await request(app)
        .get('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const body: ApiResponse<Budget[]> = response.body;
      
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });

    it('should get budget with spending summary', async () => {
      const response = await request(app)
        .get('/api/budgets/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const body: ApiResponse = response.body;
      expect(body.success).toBe(true);
    });
  });
});
