// src/config/database.ts
import { Pool, PoolConfig, PoolClient } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

// 데이터베이스 설정 인터페이스
interface DatabaseConfig extends PoolConfig {
  retryAttempts?: number;
  retryDelay?: number;
}

// 환경별 데이터베이스 설정
const getDatabaseConfig = (): DatabaseConfig => {
  const baseConfig: DatabaseConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'finance_tracker',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    // 연결 풀 최적화
    max: parseInt(process.env.DB_POOL_MAX || '20'), // 최대 연결 수
    min: parseInt(process.env.DB_POOL_MIN || '5'),  // 최소 연결 수
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'), // 30초
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000'), // 5초
    // SSL 설정 (Docker 환경에서는 비활성화, 프로덕션 환경에서만 활성화)
    ssl: process.env.NODE_ENV === 'production' && process.env.DB_SSL !== 'false' ? { rejectUnauthorized: false } : false,
    // 재시도 설정
    retryAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS || '3'),
    retryDelay: parseInt(process.env.DB_RETRY_DELAY || '1000')
  };

  // 테스트 환경 특별 설정
  if (process.env.NODE_ENV === 'test') {
    baseConfig.max = 5; // 테스트 시 연결 수 제한
    baseConfig.idleTimeoutMillis = 10000;
  }

  return baseConfig;
};

// 데이터베이스 풀 생성
const config = getDatabaseConfig();
const pool = new Pool(config);

// 연결 풀 이벤트 리스너
pool.on('connect', (client: PoolClient) => {
  console.log('🔗 새 데이터베이스 연결이 설정되었습니다.');
});

pool.on('error', (err: Error) => {
  console.error('🚨 데이터베이스 연결 풀 에러:', err);
});

pool.on('acquire', () => {
  console.log('📍 데이터베이스 연결을 획득했습니다.');
});

pool.on('remove', () => {
  console.log('🗑️ 데이터베이스 연결이 제거되었습니다.');
});

// 연결 재시도 로직이 포함된 쿼리 실행 함수
export const executeQuery = async (text: string, params?: any[]): Promise<any> => {
  const { retryAttempts = 3, retryDelay = 1000 } = config;
  
  for (let attempt = 1; attempt <= retryAttempts; attempt++) {
    try {
      const result = await pool.query(text, params);
      return result;
    } catch (error) {
      console.error(`❌ 쿼리 실행 실패 (시도 ${attempt}/${retryAttempts}):`, error);
      
      if (attempt === retryAttempts) {
        throw error;
      }
      
      // 재시도 전 대기
      await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
    }
  }
};

// 트랜잭션 헬퍼 함수
export const withTransaction = async <T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> => {
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

// 데이터베이스 연결 테스트 함수 (개선)
export const testConnection = async (retries = 3): Promise<boolean> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const client = await pool.connect();
      console.log(`✅ PostgreSQL 데이터베이스 연결 성공! (시도 ${attempt}/${retries})`);
      
      // 테스트 쿼리
      const result = await client.query('SELECT NOW() as current_time, version() as db_version');
      const { current_time, db_version } = result.rows[0];
      
      console.log('📅 현재 시간:', current_time);
      console.log('💾 데이터베이스 버전:', db_version.split(' ')[0]);
      
      client.release();
      return true;
    } catch (error) {
      console.error(`❌ 데이터베이스 연결 실패 (시도 ${attempt}/${retries}):`, error);
      
      if (attempt === retries) {
        return false;
      }
      
      // 재시도 전 대기
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
    }
  }
  
  return false;
};

// 연결 풀 상태 확인 함수
export const getPoolStatus = () => {
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
    totalConnections: pool.totalCount,
    activeConnections: pool.totalCount - pool.idleCount
  };
};

// 헬스 체크용 간단한 쿼리
export const healthCheck = async (): Promise<boolean> => {
  try {
    const result = await pool.query('SELECT 1 as health');
    return result.rows[0].health === 1;
  } catch (error) {
    console.error('❌ 헬스 체크 실패:', error);
    return false;
  }
};

// 연결 상태 확인 함수 (모니터링용)
export const checkConnection = async (): Promise<{ isHealthy: boolean; status: string; latency?: number }> => {
  const startTime = Date.now();
  
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time');
    const latency = Date.now() - startTime;
    
    client.release();
    
    return {
      isHealthy: true,
      status: 'connected',
      latency
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    
    return {
      isHealthy: false,
      status: error instanceof Error ? error.message : 'Unknown error',
      latency
    };
  }
};

// 우아한 종료를 위한 풀 종료 함수
export const closePool = async (): Promise<void> => {
  try {
    await pool.end();
    console.log('🔌 데이터베이스 연결 풀이 정상적으로 종료되었습니다.');
  } catch (error) {
    console.error('❌ 데이터베이스 연결 풀 종료 실패:', error);
  }
};

export default pool;