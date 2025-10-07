/**
 * 인증 기능 모듈
 * 
 * 사용자 로그인, 회원가입, JWT 토큰 관리 등
 * 보안이 가장 중요한 모듈이므로 신중하게 관리.
 */

// 인증 컨트롤러 (로그인/회원가입 로직)
export * from './auth.controller';

// 인증 라우트 (API 엔드포인트)
export * from './auth.routes';