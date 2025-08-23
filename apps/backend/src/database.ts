// src/config/database.ts
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// 데이터베이스 연결 테스트 함수
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL 데이터베이스 연결 성공!');
    
    // 테스트 쿼리
    const result = await client.query('SELECT NOW()');
    console.log('📅 현재 시간:', result.rows[0].now);
    
    client.release();
    return true;
  } catch (error) {
    console.error('❌ 데이터베이스 연결 실패:', error);
    return false;
  }
};

export default pool;