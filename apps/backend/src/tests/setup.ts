import { Pool } from 'pg'

// Test database configuration
export const testDb = new Pool({
  user: process.env.TEST_DB_USER || 'postgres',
  host: process.env.TEST_DB_HOST || 'localhost', 
  database: process.env.TEST_DB_NAME || 'finance_tracker_test',
  password: process.env.TEST_DB_PASSWORD || 'password',
  port: parseInt(process.env.TEST_DB_PORT || '5432'),
})

// Setup and teardown hooks
beforeAll(async () => {
  // Setup test database schema if needed
})

afterAll(async () => {
  await testDb.end()
})
