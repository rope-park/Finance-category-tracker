/**
 * 데이터베이스 유틸리티
 *
 * PostgreSQL 데이터베이스 연결 관리, 쿼리 실행, 트랜잭션 처리 등을 위한 헬퍼 함수 제공.
 * 
 * 주요 기능:
 * - 연결 풀 설정 및 관리
 * - 쿼리 실행 및 결과 반환
 * - 트랜잭션 지원
 */
import { Pool, PoolClient } from 'pg';

// 데이터베이스 연결 풀 설정
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'finance_tracker',
  password: process.env.DB_PASSWORD || 'password',
  port: parseInt(process.env.DB_PORT || '5432'),
  max: 20, // 최대 연결 수
  idleTimeoutMillis: 30000, // 유휴 연결 타임아웃
  connectionTimeoutMillis: 2000, // 연결 타임아웃
});

// 연결 풀 이벤트 핸들러
pool.on('connect', (client: PoolClient) => {
  console.log('새로운 데이터베이스 연결이 설정되었습니다.');
});

pool.on('error', (err: Error) => {
  console.error('데이터베이스 연결 풀 오류:', err);
});

// 쿼리 실행 헬퍼 함수
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('쿼리 실행:', { text, duration, rows: res.rowCount });
    }
    
    return res;
  } catch (error) {
    console.error('쿼리 실행 오류:', { text, error });
    throw error;
  }
};

// 트랜잭션 헬퍼 함수
export const transaction = async (callback: (client: PoolClient) => Promise<any>) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// 데이터베이스 연결 상태 확인
export const healthCheck = async (): Promise<boolean> => {
  try {
    const result = await query('SELECT 1 as health');
    return result.rows.length > 0;
  } catch (error) {
    console.error('데이터베이스 헬스체크 실패:', error);
    return false;
  }
};

// 연결 풀 종료
export const closePool = async (): Promise<void> => {
  await pool.end();
  console.log('데이터베이스 연결 풀이 종료되었습니다.');
};

export default pool;
