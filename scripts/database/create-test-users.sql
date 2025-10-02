-- 테스트 사용자 생성 스크립트
-- PostgreSQL 데이터베이스에 실행

-- 기존 테스트 사용자 삭제 (존재할 경우)
DELETE FROM users WHERE email IN ('test@example.com', 'user2@example.com', 'admin@test.com');

-- 패스워드 해시: bcrypt로 'password123' 해시된 값
-- $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi

-- 테스트 사용자 1: 홍길동 (완성된 프로필)
INSERT INTO users (
  email, 
  password_hash, 
  name, 
  profile_picture, 
  phone_number, 
  age_group, 
  bio, 
  profile_completed, 
  is_active,
  created_at,
  updated_at
) VALUES (
  'test@example.com',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  '홍길동',
  '',
  '010-1111-2222',
  '20s',
  '안녕하세요! 가계부 관리에 관심이 많은 홍길동입니다.',
  true,
  true,
  NOW(),
  NOW()
);

-- 테스트 사용자 2: 김철수 (완성된 프로필)
INSERT INTO users (
  email, 
  password_hash, 
  name, 
  profile_picture, 
  phone_number, 
  age_group, 
  bio, 
  profile_completed, 
  is_active,
  created_at,
  updated_at
) VALUES (
  'user2@example.com',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  '김철수',
  '',
  '010-3333-4444',
  '30s',
  '재정 관리를 통해 더 나은 미래를 만들어가고 있습니다.',
  true,
  true,
  NOW(),
  NOW()
);

-- 관리자 사용자
INSERT INTO users (
  email, 
  password_hash, 
  name, 
  profile_picture, 
  phone_number, 
  age_group, 
  bio, 
  profile_completed, 
  is_active,
  created_at,
  updated_at
) VALUES (
  'admin@test.com',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  '관리자',
  '',
  '010-1234-5678',
  '30s',
  '가계부 서비스 관리자입니다.',
  true,
  true,
  NOW(),
  NOW()
);

-- 사용자 확인
SELECT id, email, name, profile_completed, created_at FROM users WHERE email IN ('test@example.com', 'user2@example.com', 'admin@test.com');
