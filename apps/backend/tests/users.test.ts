import request from 'supertest';
import app from '../src/server';
import { ApiResponse, User } from '@finance-tracker/shared';

describe('User Management Routes', () => {
  let authToken: string;
  let userId: number;
  let testUserData: any;

  beforeAll(async () => {
    // 테스트용 사용자 등록 및 로그인
    testUserData = {
      email: `user-${Date.now()}@test.com`,
      password: 'TestPassword123!',
      name: 'User Test'
    };

    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(testUserData);

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUserData.email,
        password: testUserData.password
      });

    authToken = loginResponse.body.data.token;
    userId = loginResponse.body.data.user.id;
  });

  describe('GET /api/users/profile', () => {
    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const body: ApiResponse<User> = response.body;
      
      expect(body.success).toBe(true);
      expect(body.data?.email).toBe(testUserData.email);
      expect(body.data?.name).toBe(testUserData.name);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .expect(401);

      const body: ApiResponse = response.body;
      expect(body.success).toBe(false);
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update user profile', async () => {
      const updateData = {
        name: 'Updated User Name',
        phone_number: '010-1234-5678',
        age_group: '20s',
        bio: 'Updated bio'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      const body: ApiResponse<{user: User}> = response.body;
      
      expect(body.success).toBe(true);
      expect(body.data?.user.name).toBe(updateData.name);
      expect(body.data?.user.phone_number).toBe(updateData.phone_number);
      expect(body.data?.user.age_group).toBe(updateData.age_group);
      expect(body.data?.user.bio).toBe(updateData.bio);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({}) // 빈 body
        .expect(400);

      const body: ApiResponse = response.body;
      expect(body.success).toBe(false);
      expect(body.error).toContain('업데이트할 정보가 없습니다');
    });
  });

  describe('DELETE /api/users/profile', () => {
    it('should delete user account', async () => {
      // 새로운 테스트 사용자 생성
      const deleteUserData = {
        email: `delete-${Date.now()}@test.com`,
        password: 'TestPassword123!',
        name: 'Delete Test User'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(deleteUserData);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: deleteUserData.email,
          password: deleteUserData.password
        });

      const deleteToken = loginResponse.body.data.token;

      const response = await request(app)
        .delete('/api/users/profile')
        .set('Authorization', `Bearer ${deleteToken}`)
        .expect(200);

      const body: ApiResponse = response.body;
      expect(body.success).toBe(true);

      // 삭제된 사용자로 로그인 시도 시 실패해야 함
      await request(app)
        .post('/api/auth/login')
        .send({
          email: deleteUserData.email,
          password: deleteUserData.password
        })
        .expect(401);
    });
  });
});
