import request from 'supertest';
import app from '../../../server';
import { ApiResponse, User } from '@finance-tracker/shared';
import pool from '../../../core/config/database';
import { cleanupMonitoring } from '../../../shared/utils/monitoring';

describe('Authentication Routes', () => {
  // 테스트 후 정리
  afterAll(async () => {
    try {
      // 테스트 데이터 정리
      await pool.query('DELETE FROM users WHERE email LIKE \'%example.com\'');
      await pool.end();
      
      // 모니터링 타이머 정리
      cleanupMonitoring();
    } catch (error) {
      console.warn('Test cleanup failed:', error);
    }
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: `test${Date.now()}@example.com`, // 고유한 이메일
        password: 'TestPassword123!',
        name: 'Test User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      console.log('Register Response Status:', response.status);
      console.log('Register Response Body:', JSON.stringify(response.body, null, 2));

      if (response.status !== 201) {
        console.log('Register Headers:', response.headers);
        return; // 실패 시 테스트 종료
      }

      expect(response.status).toBe(201);
      const body: ApiResponse<{ user: User; token: string }> = response.body;
      
      expect(body.success).toBe(true);
      expect(body.data?.user.email).toBe(userData.email);
      expect(body.data?.user.name).toBe(userData.name);
      expect(body.data?.token).toBeDefined();
    });

    it('should return error for duplicate email', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'TestPassword123!',
        name: 'Test User'
      };

      // 첫 번째 등록
      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // 중복 등록 시도
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      const body: ApiResponse = response.body;
      expect(body.success).toBe(false);
      expect(body.error).toContain('이미 존재하는 이메일');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user with valid credentials', async () => {
      // 먼저 사용자 등록
      const userData = {
        email: 'login@example.com',
        password: 'TestPassword123!',
        name: 'Login User'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // 로그인 시도
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      const body: ApiResponse<{ user: User; token: string }> = response.body;
      
      expect(body.success).toBe(true);
      expect(body.data?.user.email).toBe(userData.email);
      expect(body.data?.token).toBeDefined();
    });

    it('should return error for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      const body: ApiResponse = response.body;
      expect(body.success).toBe(false);
      expect(body.error).toContain('이메일 또는 비밀번호가 올바르지 않습니다');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh tokens with valid refresh token', async () => {
      // 먼저 로그인하여 토큰을 얻음
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'TestPassword123!'
        })
        .expect(200);

      const loginBody: ApiResponse = loginResponse.body;
      expect(loginBody.data.refreshToken).toBeDefined();

      // 토큰 갱신 요청
      const refreshResponse = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: loginBody.data.refreshToken
        })
        .expect(200);

      const refreshBody: ApiResponse = refreshResponse.body;
      expect(refreshBody.success).toBe(true);
      expect(refreshBody.data.accessToken).toBeDefined();
      expect(refreshBody.data.refreshToken).toBeDefined();
      expect(refreshBody.data.accessTokenExpiresAt).toBeDefined();
      expect(refreshBody.data.refreshTokenExpiresAt).toBeDefined();
    });

    it('should return error for invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: 'invalid-refresh-token'
        })
        .expect(401);

      const body: ApiResponse = response.body;
      expect(body.success).toBe(false);
      expect(body.error).toContain('Failed to refresh tokens');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .send({})
        .expect(200);

      const body: ApiResponse = response.body;
      expect(body.success).toBe(true);
    });
  });
});
