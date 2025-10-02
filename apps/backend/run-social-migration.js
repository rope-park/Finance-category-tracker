const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// 환경 변수 로드
require('dotenv').config();

// PostgreSQL 연결 설정
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'finance_tracker',
  password: process.env.DB_PASSWORD || 'admin',
  port: process.env.DB_PORT || 5432,
});

const runSocialMigration = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🚀 소셜 기능 테이블 마이그레이션 시작...');
    
    // 마이그레이션 파일 읽기
    const migrationPath = path.join(__dirname, 'src/database/migrations/005_create_social_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // 마이그레이션 실행
    await client.query(migrationSQL);
    
    console.log('✅ 소셜 기능 테이블 마이그레이션 완료!');
    console.log('✅ families, family_members, shared_goals, goal_contributions, family_transactions, community_posts, post_comments, post_likes 테이블이 성공적으로 생성되었습니다.');
    
  } catch (error) {
    console.error('❌ 마이그레이션 실행 중 오류:', error.message);
    if (error.code === '42P07') {
      console.log('💡 테이블이 이미 존재합니다. 스키마를 확인해주세요.');
    }
  } finally {
    client.release();
    await pool.end();
  }
};

// 스크립트 실행
runSocialMigration();
