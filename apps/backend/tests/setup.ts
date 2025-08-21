import { config } from 'dotenv';

// 테스트 환경 설정
config({ path: '.env.test' });

// 글로벌 테스트 설정
beforeEach(() => {
  // 각 테스트 전에 실행할 코드
});

afterEach(() => {
  // 각 테스트 후에 실행할 코드
});

// Jest 타임아웃 설정
if (typeof jest !== 'undefined') {
  jest.setTimeout(10000);
}
