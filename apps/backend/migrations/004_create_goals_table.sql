-- 목표 테이블 생성 (id, user_id, category_key, target_amount, period, start_date, description, created_at, updated_at)
CREATE TABLE IF NOT EXISTS goals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_key VARCHAR(50) NOT NULL,
  target_amount NUMERIC(12,2) NOT NULL,
  period VARCHAR(20) NOT NULL, -- 예: monthly, yearly
  start_date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
