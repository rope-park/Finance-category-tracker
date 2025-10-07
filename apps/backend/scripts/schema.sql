-- 가계부 애플리케이션 데이터베이스 스키마 정의
-- 사용자 인증, 거래 관리, 예산 설정, 카테고리 분류 등의 기능 지원
-- PostgreSQL 기반으로 설계

-- 사용자 테이블 - 로그인 인증 및 기본 사용자 정보 관리
-- UUID를 기본키로 사용하여 보안성과 확장성을 높임
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),     -- 사용자 고유 식별자
  email VARCHAR(255) UNIQUE NOT NULL,                -- 로그인용 이메일 (중복 불가)
  password_hash VARCHAR(255) NOT NULL,               -- 암호화된 비밀번호 해시
  first_name VARCHAR(100) NOT NULL,                  -- 이름
  last_name VARCHAR(100) NOT NULL,                   -- 성
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,    -- 가입일시
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP     -- 정보 수정일시
);

-- 거래 카테고리 테이블 - 수입/지출을 분류하고 관리하는 카테고리 정보
-- 사용자별 맞춤형 카테고리 생성 및 기본 카테고리 제공
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),                -- 카테고리 고유 식별자
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- 카테고리 소유자 (사용자 삭제 시 함께 삭제)
  name VARCHAR(100) NOT NULL,                                   -- 카테고리 이름 (예: "식비", "교통비", "급여")
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')), -- 수입/지출 구분
  color VARCHAR(7),                                             -- UI 표시용 색상 코드 (HEX 형식, 예: #FF5733)
  icon VARCHAR(50),                                             -- 카테고리 아이콘 (이모지 또는 아이콘 이름)
  is_default BOOLEAN DEFAULT FALSE,                             -- 시스템 기본 카테고리 여부
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,               -- 카테고리 생성일시
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,               -- 카테고리 수정일시
  UNIQUE(user_id, name, type)                                   -- 사용자별로 같은 타입 내에서 카테고리명 중복 방지
);

-- 계좌 테이블 - 은행 계좌, 신용카드, 현금 등 다양한 자산 계정 관리
-- 사용자가 보유한 모든 금융 계좌와 잔액 추적
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),                  -- 계좌 고유 식별자
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,   -- 계좌 소유자
  name VARCHAR(100) NOT NULL,                                     -- 계좌 이름 (예: "신한은행 주계좌", "삼성카드")
  type VARCHAR(50) NOT NULL,                                      -- 계좌 유형: checking(당좌), savings(저축), credit(신용카드), cash(현금), investment(투자)
  balance DECIMAL(12,2) DEFAULT 0.00,                             -- 현재 잔액 (소수점 둘째자리까지)
  currency VARCHAR(3) DEFAULT 'USD',                              -- 통화 코드 (KRW, USD 등)
  is_active BOOLEAN DEFAULT TRUE,                                 -- 계좌 활성 상태 (비활성화된 계좌는 새 거래 불가)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,                 -- 계좌 등록일시
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP                  -- 계좌 정보 수정일시
);

-- 거래 테이블 - 모든 금융 거래 내역을 기록하는 메인 테이블
-- 수입, 지출, 이체 등 모든 금융 활동 추적 및 분석의 기반
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),                      -- 거래 고유 식별자
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,       -- 거래 소유자
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE, -- 거래가 발생한 계좌
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,      -- 거래 카테고리 (카테고리 삭제 시 NULL로 설정)
  amount DECIMAL(12,2) NOT NULL,                                      -- 거래 금액 (양수: 수입, 음수: 지출)
  description TEXT,                                                   -- 거래 설명/메모 (상세 내용)
  transaction_date DATE NOT NULL,                                     -- 실제 거래 발생 날짜
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),    -- 거래 유형
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),     -- 거래 상태 (예: 완료, 대기, 취소)
  notes TEXT,                                      -- 추가 메모
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- 거래 기록 생성일시
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP   -- 거래 기록 수정일시
);

-- 예산 테이블 - 월별/연별 예산 설정 및 추적
-- 특정 카테고리에 대해 예산 한도를 설정하고 초과 여부 모니터링
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),                -- 예산 고유 식별자
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- 예산 소유자
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE, -- 예산이 적용될 카테고리
  amount DECIMAL(12,2) NOT NULL,                                -- 예산 금액
  period VARCHAR(20) NOT NULL DEFAULT 'monthly' CHECK (period IN ('weekly', 'monthly', 'yearly')), -- 예산 기간 단위
  start_date DATE NOT NULL,                                     -- 예산 시작일
  end_date DATE,                                                -- 예산 종료일 (지정하지 않으면 무기한)
  is_active BOOLEAN DEFAULT TRUE,                               -- 예산 활성 상태
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,               -- 예산 생성일시
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP                -- 예산 수정일시
);

-- 목표 테이블 - 저축 목표 및 재정 목표 관리
-- 사용자가 설정한 재정적 목표를 추적하고 달성도를 모니터링
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),                -- 목표 고유 식별자
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- 목표 설정자
  name VARCHAR(200) NOT NULL,                                   -- 목표 이름 (예: "내년 여행자금", "비상금 마련")
  description TEXT,                                             -- 목표에 대한 상세 설명
  target_amount DECIMAL(12,2) NOT NULL,                        -- 목표 금액
  current_amount DECIMAL(12,2) DEFAULT 0.00,                   -- 현재 달성 금액
  target_date DATE,                                             -- 목표 달성 희망 날짜
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')), -- 목표 상태
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,               -- 목표 설정일시
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP                -- 목표 수정일시
);

-- 계좌간 이체 테이블 - 계좌 간 자금 이동을 관리하는 테이블
-- 한 거래가 두 개의 transaction 레코드로 분리되어 저장될 때 이들을 연결하는 역할
CREATE TABLE transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),                      -- 이체 고유 식별자
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,       -- 이체 실행자
  from_account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE, -- 출금 계좌
  to_account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,   -- 입금 계좌
  from_transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE, -- 출금 거래 레코드
  to_transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,   -- 입금 거래 레코드
  amount DECIMAL(12,2) NOT NULL,                                      -- 이체 금액
  transfer_date DATE NOT NULL,                                        -- 이체 실행 날짜
  description TEXT,                                                   -- 이체 사유/메모
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP                      -- 이체 기록 생성일시
);

-- 데이터베이스 성능 최적화를 위한 인덱스 생성
-- 자주 조회되는 컬럼들에 인덱스를 생성하여 쿼리 속도를 향상시킴

-- 거래 테이블 인덱스 (가장 많이 조회되는 테이블)
CREATE INDEX idx_transactions_user_id ON transactions(user_id);       -- 사용자별 거래 조회 최적화
CREATE INDEX idx_transactions_account_id ON transactions(account_id);  -- 계좌별 거래 조회 최적화
CREATE INDEX idx_transactions_category_id ON transactions(category_id); -- 카테고리별 거래 조회 최적화
CREATE INDEX idx_transactions_date ON transactions(transaction_date);   -- 날짜별 거래 조회 최적화
CREATE INDEX idx_transactions_type ON transactions(type);              -- 거래 유형별 조회 최적화

-- 카테고리 테이블 인덱스
CREATE INDEX idx_categories_user_id ON categories(user_id);            -- 사용자별 카테고리 조회 최적화
CREATE INDEX idx_categories_type ON categories(type);                  -- 수입/지출별 카테고리 조회 최적화

-- 계좌 테이블 인덱스
CREATE INDEX idx_accounts_user_id ON accounts(user_id);                -- 사용자별 계좌 조회 최적화
CREATE INDEX idx_accounts_active ON accounts(is_active);               -- 활성 계좌만 조회할 때 최적화

-- 예산 테이블 인덱스
CREATE INDEX idx_budgets_user_id ON budgets(user_id);                  -- 사용자별 예산 조회 최적화
CREATE INDEX idx_budgets_category_id ON budgets(category_id);           -- 카테고리별 예산 조회 최적화
CREATE INDEX idx_budgets_active ON budgets(is_active);                 -- 활성 예산만 조회할 때 최적화

-- 목표 테이블 인덱스
CREATE INDEX idx_goals_user_id ON goals(user_id);                      -- 사용자별 목표 조회 최적화
CREATE INDEX idx_goals_status ON goals(status);                        -- 목표 상태별 조회 최적화

-- 자동 타임스탬프 업데이트를 위한 트리거 함수
-- 레코드가 업데이트될 때마다 updated_at 필드를 현재 시간으로 자동 갱신
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;  -- 새로운 레코드의 updated_at을 현재 시간으로 설정
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 각 테이블에 자동 타임스탬프 업데이트 트리거 적용
-- 레코드 수정 시 updated_at 필드가 자동으로 갱신되어 언제 마지막으로 수정되었는지 추적 가능
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 신규 사용자를 위한 기본 카테고리 데이터 삽입
-- 사용자가 앱을 처음 사용할 때 바로 사용할 수 있는 일반적인 카테고리들을 미리 제공
-- user_id가 '00000000-0000-0000-0000-000000000000'인 것은 시스템 기본 카테고리를 의미
INSERT INTO categories (id, user_id, name, type, color, icon, is_default) VALUES
-- 기본 수입 카테고리들 - 일반적인 수입원들을 미리 정의  
(gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Salary', 'income', '#4CAF50', 'work', TRUE),        -- 급여
(gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Freelance', 'income', '#8BC34A', 'business', TRUE),   -- 프리랜스
(gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Investment', 'income', '#FF9800', 'trending_up', TRUE), -- 투자 수익
(gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Gift', 'income', '#E91E63', 'card_giftcard', TRUE),   -- 선물/용돈

-- 기본 지출 카테고리들 - 일반적인 지출 항목들을 미리 정의
(gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Food & Dining', 'expense', '#FF5722', 'restaurant', TRUE),     -- 식비
(gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Transportation', 'expense', '#2196F3', 'directions_car', TRUE), -- 교통비
(gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Shopping', 'expense', '#9C27B0', 'shopping_bag', TRUE),        -- 쇼핑
(gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Entertainment', 'expense', '#FF9800', 'movie', TRUE),         -- 엔터테인먼트
(gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Bills & Utilities', 'expense', '#607D8B', 'receipt', TRUE),    -- 공과금
(gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Healthcare', 'expense', '#F44336', 'local_hospital', TRUE),    -- 의료비
(gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Education', 'expense', '#3F51B5', 'school', TRUE),            -- 교육비
(gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Travel', 'expense', '#00BCD4', 'flight', TRUE);               -- 여행비
