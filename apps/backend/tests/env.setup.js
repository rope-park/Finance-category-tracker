// Jest 테스트 환경변수 설정
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_key_for_testing_only';
process.env.JWT_EXPIRES_IN = '1h';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'finance_category_tracker';
process.env.DB_USER = 'postgres';
process.env.DB_PASSWORD = 'kelly1011';
process.env.PORT = '3002'; // 다른 포트 사용
