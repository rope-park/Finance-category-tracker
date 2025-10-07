/**
 * Finance Category Tracker Backend - 메인 모듈 Export 파일
 * 
 * 전체 백엔드 애플리케이션의 핵심 모듈들을 외부로 내보내는 중앙 집중식 진입점.
 * 마이크로서비스 아키텍처, 템트 단위 테스트, 또는 다른 서비스에서 쉽게 모듈을 가져다 사용할 수 있도록 설계됨.
 * 
 * 주요 Export 모듈:
 * - Core Configuration: 데이터베이스, Swagger, 기본 설정
 * - Core Types: TypeScript 인터페이스 및 데이터 모델
 * - Shared Utilities: 로거, 에러 핸들러, 비동기 처리 유틸리티
 * - Feature Modules: 모든 비즈니스 로직 모듈 (Auth, Transactions, Budgets 등)
 * - Main Server: Express.js 애플리케이션 인스턴스
 * 
 * 
 * @author Ju Eul Park (rope-park)
 */

// 핵심 설정 모듈들
export * from './src/core/config';
export * from './src/core/types';

// 공유 유틸리티 모듈들 (로거, 에러 핸들러 등)
export { logger, asyncHandler, globalErrorHandler, notFoundHandler } from './src/shared';

// 모든 기능 모듈들 (인증, 거래, 예산, 분석 등)
export * from './src/features';

// 메인 서버 (Express 앱)
export { default as server } from './src/server';