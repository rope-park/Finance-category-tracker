const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'finance_category_tracker',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'kelly1011',
});

async function runMigration() {
  try {
    const migrationPath = path.join(__dirname, 'migrations', '003_add_refresh_tokens.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('🔄 refresh_tokens 테이블 마이그레이션 시작...');
    
    await pool.query(migrationSQL);
    
    console.log('✅ refresh_tokens 테이블 마이그레이션 완료!');
    
    // 테이블 생성 확인
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
