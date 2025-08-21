import { config } from 'dotenv';
import { Pool } from 'pg';

// 테스트 환경 설정
config({ path: '.env.test' });

// Test database configuration
const testDbConfig = {
  host: process.env.TEST_DB_HOST || 'localhost',
  port: parseInt(process.env.TEST_DB_PORT || '5432'),
  database: process.env.TEST_DB_NAME || 'finance_tracker_test',
  user: process.env.TEST_DB_USER || 'postgres',
  password: process.env.TEST_DB_PASSWORD || 'password',
};

export const testPool = new Pool(testDbConfig);

// Setup and teardown for tests
beforeAll(async () => {
  console.log('Setting up test database...');
});

afterAll(async () => {
  await testPool.end();
  console.log('Test database cleaned up.');
});

beforeEach(async () => {
  // 각 테스트 전에 트랜잭션 시작
  await testPool.query('BEGIN');
});

afterEach(async () => {
  // 각 테스트 후에 롤백
  await testPool.query('ROLLBACK');
});

// Jest 타임아웃 설정
if (typeof jest !== 'undefined') {
  jest.setTimeout(10000);
}
