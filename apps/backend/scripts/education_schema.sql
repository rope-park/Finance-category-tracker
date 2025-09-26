-- 금융 교육 콘텐츠 테이블
CREATE TABLE IF NOT EXISTS financial_education_content (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'budgeting', 'investing', 'saving', 'debt_management', 'insurance'
    difficulty_level VARCHAR(50) NOT NULL, -- 'beginner', 'intermediate', 'advanced'
    content_type VARCHAR(50) NOT NULL, -- 'article', 'video', 'infographic', 'quiz'
    reading_time_minutes INTEGER,
    tags TEXT[], -- 키워드 태그들
    author VARCHAR(255),
    published_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 사용자 교육 진행 상황 테이블
CREATE TABLE IF NOT EXISTS user_education_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_id INTEGER NOT NULL REFERENCES financial_education_content(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT FALSE,
    completion_date TIMESTAMP,
    reading_progress DECIMAL(5,2) DEFAULT 0, -- 0-100%
    quiz_score INTEGER, -- 퀴즈 점수 (0-100)
    time_spent_minutes INTEGER DEFAULT 0,
    bookmarked BOOLEAN DEFAULT FALSE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, content_id)
);

-- 재정 건강도 점수 테이블
CREATE TABLE IF NOT EXISTS user_financial_health_scores (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    budgeting_score INTEGER NOT NULL CHECK (budgeting_score >= 0 AND budgeting_score <= 100),
    saving_score INTEGER NOT NULL CHECK (saving_score >= 0 AND saving_score <= 100),
    debt_score INTEGER NOT NULL CHECK (debt_score >= 0 AND debt_score <= 100),
    investment_score INTEGER NOT NULL CHECK (investment_score >= 0 AND investment_score <= 100),
    emergency_fund_score INTEGER NOT NULL CHECK (emergency_fund_score >= 0 AND emergency_fund_score <= 100),
    calculation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    factors_analysis JSONB, -- 점수에 영향을 준 요소들
    recommendations TEXT[], -- 개선 권장사항
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 절약 팁 테이블
CREATE TABLE IF NOT EXISTS saving_tips (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'food', 'transport', 'entertainment', 'utilities', 'shopping'
    difficulty VARCHAR(50) NOT NULL, -- 'easy', 'medium', 'hard'
    estimated_savings_amount DECIMAL(10,2), -- 예상 절약 금액
    estimated_savings_percentage DECIMAL(5,2), -- 예상 절약 비율
    applicable_to TEXT[], -- 적용 대상 ['students', 'families', 'seniors', 'professionals']
    seasonal BOOLEAN DEFAULT FALSE, -- 계절별 팁인지
    tags TEXT[],
    source_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 사용자별 개인화된 조언 테이블
CREATE TABLE IF NOT EXISTS personalized_advice (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    advice_type VARCHAR(100) NOT NULL, -- 'budgeting', 'saving', 'investment', 'debt_reduction'
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(50) NOT NULL, -- 'high', 'medium', 'low'
    based_on JSONB, -- 어떤 데이터를 기반으로 생성되었는지
    is_read BOOLEAN DEFAULT FALSE,
    is_dismissed BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 사용자 절약 팁 상호작용 테이블
CREATE TABLE IF NOT EXISTS user_saving_tips_interaction (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tip_id INTEGER NOT NULL REFERENCES saving_tips(id) ON DELETE CASCADE,
    is_tried BOOLEAN DEFAULT FALSE,
    is_helpful BOOLEAN,
    actual_savings DECIMAL(10,2),
    feedback TEXT,
    interaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, tip_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_financial_education_content_category ON financial_education_content(category);
CREATE INDEX IF NOT EXISTS idx_financial_education_content_difficulty ON financial_education_content(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_user_education_progress_user_id ON user_education_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_financial_health_scores_user_id ON user_financial_health_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_saving_tips_category ON saving_tips(category);
CREATE INDEX IF NOT EXISTS idx_personalized_advice_user_id ON personalized_advice(user_id);
CREATE INDEX IF NOT EXISTS idx_personalized_advice_priority ON personalized_advice(priority, is_read);

-- 기본 교육 콘텐츠 삽입
INSERT INTO financial_education_content (title, content, category, difficulty_level, content_type, reading_time_minutes, tags, author) VALUES
('예산 관리의 기초', '예산을 세우는 것은 재정 관리의 첫 걸음입니다. 50/30/20 규칙을 활용하여 수입의 50%는 필수 지출, 30%는 여가 활동, 20%는 저축과 투자에 사용하세요.', 'budgeting', 'beginner', 'article', 5, ARRAY['예산', '50-30-20', '기초'], 'Finance Tracker Team'),
('비상 자금의 중요성', '예상치 못한 상황에 대비해 3-6개월치 생활비를 비상 자금으로 준비하는 것이 중요합니다. 이는 금융 안정성의 기초가 됩니다.', 'saving', 'beginner', 'article', 7, ARRAY['비상자금', '저축', '안정성'], 'Finance Tracker Team'),
('투자 기초: 분산투자의 원리', '모든 계란을 한 바구니에 담지 마세요. 분산투자를 통해 리스크를 줄이고 안정적인 수익을 추구할 수 있습니다.', 'investing', 'intermediate', 'article', 10, ARRAY['투자', '분산투자', '리스크관리'], 'Finance Tracker Team'),
('부채 관리 전략', '높은 이자율의 부채부터 우선적으로 상환하는 눈덩이 방법을 활용하여 효과적으로 부채를 줄여나가세요.', 'debt_management', 'intermediate', 'article', 8, ARRAY['부채관리', '눈덩이방법', '이자율'], 'Finance Tracker Team');

-- 기본 절약 팁 삽입
INSERT INTO saving_tips (title, description, category, difficulty, estimated_savings_percentage, applicable_to, tags) VALUES
('가계부 작성하기', '매일 지출을 기록하여 불필요한 소비를 찾아내고 줄이세요. 보통 10-15%의 지출 절약 효과가 있습니다.', 'general', 'easy', 12.5, ARRAY['everyone'], ARRAY['가계부', '지출관리', '기록']),
('정기구독 서비스 정리', '사용하지 않는 구독 서비스들을 정리하여 월 고정비를 줄이세요.', 'entertainment', 'easy', 20.0, ARRAY['everyone'], ARRAY['구독서비스', '고정비', '정리']),
('대중교통 이용하기', '자가용 대신 대중교통을 이용하여 연료비, 주차비, 보험료를 절약하세요.', 'transport', 'medium', 30.0, ARRAY['professionals', 'students'], ARRAY['대중교통', '연료비', '교통비']),
('집에서 요리하기', '외식 대신 집에서 요리하여 식비를 크게 줄일 수 있습니다.', 'food', 'medium', 40.0, ARRAY['families', 'students'], ARRAY['요리', '식비', '외식절약']);
