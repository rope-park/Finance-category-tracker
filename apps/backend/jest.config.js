module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts',
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    '^@finance-tracker/shared(.*)$': '<rootDir>/../../packages/shared/src$1'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json'
    }
  },
  testTimeout: 30000, // 30초 타임아웃
  setupFiles: ['<rootDir>/tests/env.setup.js'], // 환경변수 설정
  maxWorkers: 1, // 데이터베이스 충돌 방지
  forceExit: true, // 테스트 완료 후 강제 종료
  detectOpenHandles: true // 열린 핸들 감지
};
