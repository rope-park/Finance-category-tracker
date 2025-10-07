/**
 * PostgreSQL 데이터베이스 연결 및 관리 설정
 * 
 * Finance Category Tracker 애플리케이션의 PostgreSQL 데이터베이스 연결을 최적화하고 관리.
 * 연결 풀링, 재연결 로직, 성능 모니터링, 건강 상태 처리 등을 포함.
 * 
 * 주요 기능:
 * - 환경별 데이터베이스 연결 설정 관리
 * - 연결 푼 최적화 및 자동 스케일링
 * - 데이터베이스 연결 재시도 및 오류 복구
 * - 연결 상태 모니터링 및 로깅
 * - 트랜잭션 관리 및 데이터 무결성 보장
 * 
 * @author Ju Eul Park (rope-park)
 */

import { Pool, PoolConfig, PoolClient } from 'pg';
import * as dotenv from 'dotenv';

// 환경변수 로드 (애플리케이션 시작 시 전역 설정 적용)
dotenv.config();

/**
 * 데이터베이스 연결 설정 인터페이스
 * 
 * PostgreSQL 연결 풀 설정을 확장하여 재연결 로직과 세밀한 성능 조정 옵션을 추가.
 * 프로덕션 환경에서의 안정성과 성능을 위한 고급 설정들을 지원.
 */
interface DatabaseConfig extends PoolConfig {
  retryAttempts?: number;    // 연결 실패 시 재시도 횟수
  retryDelay?: number;       // 재시도 간격 (밀리초)
}

/**
 * 환경별 데이터베이스 연결 설정 생성 함수
 * 
 * 개발, 테스트, 프로덕션 환경에 따라 최적화된 데이터베이스 연결 설정을 생성.
 * 환경변수를 통해 유연하게 설정을 조정할 수 있으며, 기본값으로 안전한 설정을 제공.
 * 
 * @returns 데이터베이스 연결 설정 객체
 * 
 * @example
 * ```typescript
 * // 환경변수 설정 예시:
 * // DB_HOST=localhost
 * // DB_PORT=5432
 * // DB_NAME=finance_tracker
 * // DB_USER=postgres
 * // DB_PASSWORD=your_password
 * // DB_POOL_MAX=20
 * // DB_POOL_MIN=5
 * 
 * const config = getDatabaseConfig();
 * const pool = new Pool(config);
 * ```
 */
const getDatabaseConfig = (): DatabaseConfig => {
  const baseConfig: DatabaseConfig = {
    // 기본 데이터베이스 연결 정보
    host: process.env.DB_HOST || 'localhost',                    // 데이터베이스 서버 호스트
    port: parseInt(process.env.DB_PORT || '5432'),               // PostgreSQL 기본 포트
    database: process.env.DB_NAME || 'finance_tracker',          // 데이터베이스 이름
    user: process.env.DB_USER || 'postgres',                    // 데이터베이스 사용자
    password: process.env.DB_PASSWORD,                          // 데이터베이스 비밀번호
    
    // 연결 풀 최적화 설정 (성능과 안정성 균형)
    max: parseInt(process.env.DB_POOL_MAX || '20'),              // 최대 동시 연결 수
    min: parseInt(process.env.DB_POOL_MIN || '5'),               // 최소 유지 연결 수
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),        // 비활성 연결 제거 시간 (30초)
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000'), // 연결 대기 시간 (5초)
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

/**
 * 쿼리 실행 함수
 * @param text 쿼리 문자열
 * @param params 쿼리 파라미터 배열
 * @returns 쿼리 결과
 */
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

/**
 * 트랜잭션을 관리하는 헬퍼 함수
 * @param callback 트랜잭션 내에서 실행할 콜백 함수
 * @returns 트랜잭션 결과
 */
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

/**
 * 데이터베이스 연결 테스트 함수
 * TODO: 연결 테스트 로직 개선
 * @param retries 재시도 횟수
 * @returns 연결 성공 여부
 */
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

/**
 * 데이터베이스 연결 풀 상태 정보를 반환하는 함수
 * @returns 풀 상태 정보
 */
export const getPoolStatus = () => {
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
    totalConnections: pool.totalCount,
    activeConnections: pool.totalCount - pool.idleCount
  };
};

/**
 * 데이터베이스 헬스 체크 함수
 * @returns 헬스 체크 결과
 */
export const healthCheck = async (): Promise<boolean> => {
  try {
    const result = await pool.query('SELECT 1 as health');
    return result.rows[0].health === 1;
  } catch (error) {
    console.error('❌ 헬스 체크 실패:', error);
    return false;
  }
};

/**
 * 데이터베이스 연결 상태 및 지연 시간 정보를 확인하는 모니터링 함수
 * @returns 데이터베이스 연결 상태 및 지연 시간 정보
 */
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

/**
 * 우아한 종료를 위한 데이터베이스 연결 풀 종료 함수
 * 
 * 애플리케이션 종료 시 호출하여 모든 연결을 정상적으로 종료.
 */
export const closePool = async (): Promise<void> => {
  try {
    await pool.end();
    console.log('🔌 데이터베이스 연결 풀이 정상적으로 종료되었습니다.');
  } catch (error) {
    console.error('❌ 데이터베이스 연결 풀 종료 실패:', error);
  }
};

export default pool;