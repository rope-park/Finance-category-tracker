/**
 * 소셜 기능 데이터베이스 마이그레이션 스크립트
 * 
 * 가족 공유 및 커뮤니티 기능을 위한 테이블 생성.
 * 가족 멤버 관리, 공유 목표, 커뮤니티 포스트 등의 기능 지원.
 * 
 * 생성될 테이블:
 * - families: 가족 그룹 정보
 * - family_members: 가족 멤버 관계
 * - shared_goals: 공유 목표
 * - goal_contributions: 목표 기여도
 * - family_transactions: 가족 공유 거래
 * - community_posts: 커뮤니티 게시글
 * - post_comments: 게시글 댓글
 * - post_likes: 게시글 좋아요
 * 
 * @author Ju Eul Park (rope-park)
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// 환경 변수 로드
require('dotenv').config();

// PostgreSQL 데이터베이스 연결 설정
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',                    // 데이터베이스 사용자
  host: process.env.DB_HOST || 'localhost',                  // 호스트 주소
  database: process.env.DB_NAME || 'finance_tracker',       // 데이터베이스 이름
  password: process.env.DB_PASSWORD || 'admin',             // 비밀번호
  port: process.env.DB_PORT || 5432,                        // 포트 번호
});

/**
 * 소셜 기능 마이그레이션 실행 함수
 *
 * 가족 공유 및 커뮤니티 기능을 위한 모든 테이블 생성.
 * 트랜잭션을 사용하여 안전하게 마이그레이션 수행.
 */
const runSocialMigration = async () => {
  // 데이터베이스 클라이언트 연결
  const client = await pool.connect();
  
  try {
    console.log('🚀 소셜 기능 테이블 마이그레이션 시작...');
    
    // 마이그레이션 SQL 파일 경로 설정
    const migrationPath = path.join(__dirname, 'src/database/migrations/005_create_social_tables.sql');
    
    // SQL 파일 내용 읽기
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // 마이그레이션 SQL 실행
    await client.query(migrationSQL);
    
    console.log('✅ 소셜 기능 테이블 마이그레이션 완료!');
    console.log('✅ families, family_members, shared_goals, goal_contributions, family_transactions, community_posts, post_comments, post_likes 테이블이 성공적으로 생성되었습니다.');
    
  } catch (error) {
    console.error('❌ 마이그레이션 실행 중 오류:', error.message);
    
    // 테이블 중복 생성 에러 처리
    if (error.code === '42P07') {
      console.log('💡 테이블이 이미 존재합니다. 스키마를 확인해주세요.');
    }
  } finally {
    // 연결 해제 및 풀 종료
    client.release();
    await pool.end();
  }
};

// 마이그레이션 스크립트 실행
runSocialMigration();
