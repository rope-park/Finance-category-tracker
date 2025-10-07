/**
 * 공유 미들웨어 모듈 인덱스
 * 
 * Express.js 애플리케이션에서 사용되는 모든 공통 미들웨어를 중앙에서 관리하고 내보냄.
 * 인증, 캐싱, 오류 처리, 유효성 검사, 보안 등 다양한 미들웨어를 제공.
 * 
 * 포함된 미들웨어:
 * - auth: JWT 기반 사용자 인증 및 권한 검사
 * - cacheMiddleware: Redis 기반 응답 캐싱
 * - errorHandler: 전역 오류 처리 및 로깅
 * - goalValidation: 목표 설정 데이터 유효성 검사
 * - logging: API 요청/응답 로깅 및 성능 모니터링
 * - rateLimiter: API 요청 빈도 제한
 * - security: 보안 관련 미들웨어 (API/인증 제한)
 * - validateRequest: 요청 데이터 유효성 검사
 * - validation: 공통 유효성 검사 함수들
 * 
 * @author Ju Eul Park (rope-park)
 */

// 인증 관련 미들웨어
export * from './auth';

// 캐싱 관련 미들웨어
export * from './cacheMiddleware';

// 오류 처리 미들웨어
export * from './errorHandler';

// 목표 설정 유효성 검사 미들웨어
export * from './goalValidation';

// 로깅 관련 미들웨어
export * from './logging';

// 요청 빈도 제한 미들웨어
export * from './rateLimiter';

// 보안 관련 미들웨어 (별칭으로 내보냄)
export { apiLimiter as securityApiLimiter, authLimiter as securityAuthLimiter } from './security';

// 요청 유효성 검사 미들웨어
export * from './validateRequest';

// 공통 유효성 검사 함수들
export * from './validation';