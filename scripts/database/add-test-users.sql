-- 테스트 사용자 추가
INSERT INTO users (email, password_hash, name, profile_completed, is_active, created_at, updated_at) 
VALUES 
('test@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMye.J0Ao1DfQz8Q8J8K8K8K8K8K8K8K8K8K', '테스트 사용자', false, true, NOW(), NOW()),
('admin@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMye.J0Ao1DfQz8Q8J8K8K8K8K8K8K8K8K8K', '관리자', true, true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- 사용자 목록 확인
SELECT id, email, name, profile_completed, created_at FROM users;
