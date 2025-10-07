/**
 * Jest 테스트 프레임워크 설정 파일
 * 
 * 백엔드 TypeScript 테스트 환경을 위한 Jest 설정.
 * ts-jest를 사용하여 TypeScript 파일을 직접 테스트할 수 있게 해줌.
 * 
 * 주요 설정:
 * - TypeScript 지원 및 변환
 * - 테스트 파일 패턴 정의
 * - 커버리지 수집 설정
 * - 데이터베이스 테스트를 위한 타임아웃 조정
 * 
 * @author Ju Eul Park (rope-park)
 */

module.exports = {
  /** TypeScript Jest 프리셋 사용 */
  preset: 'ts-jest',
  
  /** Node.js 환경에서 테스트 실행 */
  testEnvironment: 'node',
  
  /** 테스트 파일을 찾을 루트 디렉토리 */
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  
  /** 테스트 파일 매칭 패턴 */
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  /** TypeScript 파일 변환 설정 */
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json'  // 테스트용 TypeScript 설정 파일 사용
    }],
  },
  
  /** 커버리지 수집 대상 파일 패턴 */
  collectCoverageFrom: [
    'src/**/*.ts',        // 모든 TypeScript 소스 파일
    '!src/**/*.d.ts',     // 타입 정의 파일 제외
    '!src/server.ts',     // 메인 서버 파일 제외
  ],
  
  /** 테스트 실행 후 설정 파일 */
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  
  /** 모듈 경로 매핑 - 공유 패키지 import를 위한 설정 */
  moduleNameMapper: {
    '^@finance-tracker/shared(.*)$': '<rootDir>/../../packages/shared/src$1'
  },
  
  /** 지원되는 파일 확장자 */
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  /** 테스트 타임아웃 설정 - 데이터베이스 작업을 위해 30초로 설정 */
  testTimeout: 30000,
  
  /** 테스트 실행 전 환경변수 설정 파일 */
  setupFiles: ['<rootDir>/tests/env.setup.js'],
  
  /** 최대 워커 수 - 데이터베이스 동시 접근 충돌 방지를 위해 1로 제한 */
  maxWorkers: 1,
  
  /** 테스트 완료 후 프로세스 강제 종료 */
  forceExit: true,
  
  /** 열린 핸들 감지 활성화 - 메모리 누수 디버깅용 */
  detectOpenHandles: true
};
