const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'finance_tracker',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

async function migrate() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 데이터베이스 마이그레이션 시작...');
    
    // 기존 테이블이 있는지 확인
    const tablesCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'categories', 'transactions', 'budgets')
    `);
    
    if (tablesCheck.rows.length > 0) {
      console.log('📋 기존 테이블 발견:', tablesCheck.rows.map(r => r.table_name));
      
      // 마이그레이션이 필요한 컬럼들 추가
      const migrations = [
        {
          table: 'users',
          column: 'profile_picture',
          sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture TEXT;'
        },
        {
          table: 'users', 
          column: 'phone_number',
          sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);'
        },
        {
          table: 'users',
          column: 'age_group',
          sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS age_group VARCHAR(20);'
        },
        {
          table: 'users',
          column: 'bio',
          sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;'
        },
        {
          table: 'categories',
          column: 'color',
          sql: 'ALTER TABLE categories ADD COLUMN IF NOT EXISTS color VARCHAR(7) DEFAULT \'#6B7280\';'
        },
        {
          table: 'categories',
          column: 'icon',
          sql: 'ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon VARCHAR(10) DEFAULT \'📦\';'
        },
        {
          table: 'transactions',
          column: 'tags',
          sql: 'ALTER TABLE transactions ADD COLUMN IF NOT EXISTS tags TEXT[];'
        },
        {
          table: 'budgets',
          column: 'alert_threshold',
          sql: 'ALTER TABLE budgets ADD COLUMN IF NOT EXISTS alert_threshold DECIMAL(3,2) DEFAULT 0.8;'
        }
      ];
      
      for (const migration of migrations) {
        try {
          await client.query(migration.sql);
          console.log(`✅ ${migration.table}.${migration.column} 컬럼 추가/확인 완료`);
        } catch (error) {
          console.log(`ℹ️ ${migration.table}.${migration.column} 이미 존재하거나 스킵됨`);
        }
      }
      
      // 인덱스 추가
      const indexes = [
        'CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, transaction_date);',
        'CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);',
        'CREATE INDEX IF NOT EXISTS idx_budgets_user_category ON budgets(user_id, category_id);',
        'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);'
      ];
      
      for (const indexSql of indexes) {
        try {
          await client.query(indexSql);
          console.log('✅ 인덱스 생성 완료');
        } catch (error) {
          console.log('ℹ️ 인덱스 이미 존재');
        }
      }
      
    } else {
      console.log('🆕 새로운 데이터베이스 - 스키마 파일에서 테이블 생성 필요');
      console.log('다음 명령어를 실행하세요: npm run db:schema');
    }
    
    console.log('✅ 마이그레이션 완료!');
    
  } catch (error) {
    console.error('❌ 마이그레이션 실패:', error);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  migrate()
    .then(() => {
      console.log('🎉 데이터베이스 마이그레이션 성공!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 마이그레이션 오류:', error);
      process.exit(1);
    });
}

module.exports = { migrate };
