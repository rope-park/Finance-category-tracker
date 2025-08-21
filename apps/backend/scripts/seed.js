const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// DB 연결 설정
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'finance_tracker',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

async function seedDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 시드 데이터 삽입 시작...');

    // 기본 카테고리 데이터
    const categories = [
      { name: '식비', description: '음식 및 식당 비용', color: '#FF6B6B', icon: '🍽️' },
      { name: '교통', description: '대중교통, 택시, 주유비', color: '#4ECDC4', icon: '🚗' },
      { name: '쇼핑', description: '의류, 생활용품 구매', color: '#45B7D1', icon: '🛍️' },
      { name: '엔터테인먼트', description: '영화, 게임, 취미활동', color: '#96CEB4', icon: '🎮' },
      { name: '의료', description: '병원비, 약값, 건강관리', color: '#FFEAA7', icon: '🏥' },
      { name: '교육', description: '학습, 강의, 도서구입', color: '#DDA0DD', icon: '📚' },
      { name: '여행', description: '여행비, 숙박비', color: '#98D8C8', icon: '✈️' },
      { name: '기타', description: '기타 비용', color: '#F7DC6F', icon: '📦' }
    ];

    for (const category of categories) {
      await client.query(
        'INSERT INTO categories (name, description, color, icon) VALUES ($1, $2, $3, $4) ON CONFLICT (name) DO NOTHING',
        [category.name, category.description, category.color, category.icon]
      );
    }

    // 테스트 사용자 데이터 (개발용)
    if (process.env.NODE_ENV === 'development') {
      const testUser = {
        email: 'test@example.com',
        name: 'Test User',
        // 비밀번호: 'test123' (bcrypt 해시)
        password: '$2b$10$rOzJqHgS8SQg6mJ5mK5mUuKvHzE9tJzM1kN9wP7sE4kH3gF2sR6tO'
      };

      const userResult = await client.query(
        'INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING RETURNING id',
        [testUser.email, testUser.name, testUser.password]
      );

      if (userResult.rows.length > 0) {
        const userId = userResult.rows[0].id;
        
        // 테스트 거래 데이터
        const transactions = [
          { amount: -15000, description: '점심식사', category: '식비', date: new Date('2024-01-15') },
          { amount: -2500, description: '지하철', category: '교통', date: new Date('2024-01-15') },
          { amount: -45000, description: '쇼핑', category: '쇼핑', date: new Date('2024-01-14') },
          { amount: 3000000, description: '월급', category: '기타', date: new Date('2024-01-01') },
          { amount: -12000, description: '영화관람', category: '엔터테인먼트', date: new Date('2024-01-13') }
        ];

        for (const transaction of transactions) {
          // 카테고리 ID 조회
          const categoryResult = await client.query(
            'SELECT id FROM categories WHERE name = $1',
            [transaction.category]
          );

          if (categoryResult.rows.length > 0) {
            await client.query(
              'INSERT INTO transactions (user_id, amount, description, category_id, transaction_date) VALUES ($1, $2, $3, $4, $5)',
              [userId, transaction.amount, transaction.description, categoryResult.rows[0].id, transaction.date]
            );
          }
        }

        // 테스트 예산 데이터
        const budgets = [
          { category: '식비', amount: 500000, period: 'monthly' },
          { category: '교통', amount: 100000, period: 'monthly' },
          { category: '엔터테인먼트', amount: 200000, period: 'monthly' }
        ];

        for (const budget of budgets) {
          const categoryResult = await client.query(
            'SELECT id FROM categories WHERE name = $1',
            [budget.category]
          );

          if (categoryResult.rows.length > 0) {
            await client.query(
              'INSERT INTO budgets (user_id, category_id, amount, period, start_date) VALUES ($1, $2, $3, $4, $5)',
              [userId, categoryResult.rows[0].id, budget.amount, budget.period, new Date()]
            );
          }
        }
      }
    }

    console.log('✅ 시드 데이터 삽입 완료!');
  } catch (error) {
    console.error('❌ 시드 데이터 삽입 실패:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function checkConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ PostgreSQL 연결 성공:', result.rows[0].now);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL 연결 실패:', error.message);
    return false;
  }
}

if (require.main === module) {
  checkConnection()
    .then(connected => {
      if (connected) {
        return seedDatabase();
      } else {
        process.exit(1);
      }
    })
    .then(() => {
      console.log('🎉 데이터베이스 설정 완료!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 오류 발생:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase, checkConnection };
