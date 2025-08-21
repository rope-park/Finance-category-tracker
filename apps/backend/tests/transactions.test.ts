import request from 'supertest';
import app from '../src/server';
import { ApiResponse, Transaction } from '@finance-tracker/shared';

describe('Transaction Routes', () => {
  let authToken: string;
  let userId: number;

  beforeAll(async () => {
    // 테스트용 사용자 등록 및 로그인
    const userData = {
      email: `transaction-${Date.now()}@test.com`,
      password: 'TestPassword123!',
      name: 'Transaction Test User'
    };

    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(userData);

    authToken = registerResponse.body.data.token;
    userId = registerResponse.body.data.user.id;
  });

  describe('POST /api/transactions', () => {
    it('should create a new transaction', async () => {
      const transactionData = {
        amount: 50000,
        description: '월급',
        category_key: 'salary_main',
        transaction_type: 'income' as const,
        transaction_date: '2025-08-18'
      };

      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transactionData)
        .expect(201);

      const body: ApiResponse<Transaction> = response.body;
      
      expect(body.success).toBe(true);
      expect(body.data?.amount).toBe("50000.00");
      expect(body.data?.description).toBe(transactionData.description);
      expect(body.data?.transaction_type).toBe(transactionData.transaction_type);
    });

    it('should validate required fields', async () => {
      const invalidData = {
        description: '테스트'
        // amount 누락
      };

      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      const body: ApiResponse = response.body;
      expect(body.success).toBe(false);
  expect(body.error).toContain('거래 데이터가 유효하지 않습니다.');
    });
  });

  describe('GET /api/transactions', () => {
    it('should get user transactions', async () => {
      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const body: ApiResponse<Transaction[]> = response.body;
      
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });

    it('should filter transactions by date range', async () => {
      const response = await request(app)
        .get('/api/transactions?start_date=2025-08-01&end_date=2025-08-31')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const body: ApiResponse<Transaction[]> = response.body;
      expect(body.success).toBe(true);
    });
  });

  describe('PUT /api/transactions/:id', () => {
    let transactionId: number;

    beforeAll(async () => {
      // 테스트용 거래 생성
      const transactionData = {
        amount: 30000,
        description: '수정 테스트',
        category_key: 'food_restaurant',
        transaction_type: 'expense' as const,
        transaction_date: '2025-08-18'
      };

      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transactionData);

      transactionId = response.body.data.id;
    });

    it('should update transaction', async () => {
      const updateData = {
        category_key: 'food_cafe',
        transaction_type: 'expense' as const,
        amount: 35000,
        description: '수정된 거래',
        transaction_date: '2025-08-18'
      };

      const response = await request(app)
        .put(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      const body: ApiResponse<Transaction> = response.body;
      expect(body.success).toBe(true);
      expect(body.data?.amount).toBe("35000.00");
      expect(body.data?.description).toBe(updateData.description);
    });
  });

  describe('DELETE /api/transactions/:id', () => {
    let transactionId: number;

    beforeAll(async () => {
      // 테스트용 거래 생성
      const transactionData = {
        amount: 20000,
        description: '삭제 테스트',
        category_key: 'food_cafe',
        transaction_type: 'expense' as const,
        transaction_date: '2025-08-18'
      };

      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transactionData);

      transactionId = response.body.data.id;
    });

    it('should delete transaction', async () => {
      const response = await request(app)
        .delete(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // 204 No Content에는 body가 없습니다
    });
  });
});
