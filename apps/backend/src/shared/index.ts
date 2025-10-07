/**
 * 공유 모듈들 통합 export
 * 
 * 여러 기능 모듈에서 공통으로 사용하는 유틸리티들:
 * - 서비스: 캐시, 이메일 등
 * - 레포지토리: 베이스 데이터 접근 클래스
 * - 상수: 공통 상수값들
 * - 유틸리티: 로거, 모니터링, 에러 처리
 * - 미들웨어: 인증, 검증, Rate Limiting
 */

// 공유 서비스들 (캐시, 이메일 등)
export * from './services';

// 기본 레포지토리 패턴
export * from './repositories';

// 공통 상수들
export * from './constants';

// ==================================================
// 유틸리티 함수들
// ==================================================

// 로깅 시스템 (Winston 기반)
export { default as logger } from './utils/logger';

// 성능 모니터링 및 메트릭
export * from './utils/monitoring';

// 에러 처리 유틸리티
export * from './utils/errors';

// API 응답 포매팅
export * from './utils/response';

// ==================================================
// 미들웨어들
// ==================================================

// 인증 미들웨어
export * from './middleware/auth';

// 에러 핸들링 미들웨어
export { asyncHandler, globalErrorHandler, notFoundHandler } from './middleware/errorHandler';

// 입력값 검증 미들웨어
export * from './middleware/validation';

// Rate Limiting 미들웨어
export { apiLimiter, authLimiter } from './middleware/rateLimiter';