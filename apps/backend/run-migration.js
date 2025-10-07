/**
 * 데이터베이스 마이그레이션 실행 스크립트
 * 
 * refresh_tokens 테이블 추가를 위한 마이그레이션 실행.
 * JWT 리프레시 토큰 저장 기능을 위해 필요한 테이블 생성.
 * 
 * 주요 기능:
 * - PostgreSQL 연결 설정
 * - 마이그레이션 SQL 파일 실행
 * - 테이블 생성 확인
 * - 에러 핸들링 및 로깅
 * 
 * @author Ju Eul Park (rope-park)
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// PostgreSQL 데이터베이스 연결 설정
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',                                    // 데이터베이스 호스트
  port: process.env.DB_PORT || 5432,                                          // 포트 번호
  database: process.env.DB_NAME || 'finance_category_tracker',               // 데이터베이스 이름
  user: process.env.DB_USER || 'postgres',                                   // 사용자명
  password: process.env.DB_PASSWORD,                                         // 비밀번호
});

/**
 * 마이그레이션 실행 함수
 * 
 * refresh_tokens 테이블 생성하는 마이그레이션 실행.
 * JWT 토큰 관리를 위한 필수 테이블을 데이터베이스에 추가.
 */
async function runMigration() {
  try {
    // 마이그레이션 파일 경로 설정
    const migrationPath = path.join(__dirname, 'migrations', '003_add_refresh_tokens.sql');
    
    // SQL 파일 읽기
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('🔄 refresh_tokens 테이블 마이그레이션 시작...');
    
    // 마이그레이션 SQL 실행
    await pool.query(migrationSQL);
    
    console.log('✅ refresh_tokens 테이블 마이그레이션 완료!');
    
    // 테이블 생성 확인 쿼리
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'refresh_tokens'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ refresh_tokens 테이블이 성공적으로 생성되었습니다.');
    } else {
      console.log('❌ refresh_tokens 테이블 생성이 확인되지 않습니다.');
    }
    
  } catch (error) {
    console.error('❌ 마이그레이션 실행 중 오류:', error);
  } finally {
    await pool.end();
  }
}

runMigration();
