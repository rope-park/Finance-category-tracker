/**
 * 백엔드 공통 상수들
 * 
 * API 응답, 에러 코드, 제한값 등 
 * 애플리케이션 전반에서 사용되는 상수값들을 중앙 관리.
 */

// API 관련 상수들
export const API_CONSTANTS = {
  DEFAULT_LIMIT: 20,    // 기본 페이지 크기
  MAX_LIMIT: 100        // 최대 페이지 크기 (성능 보호)
};

// 에러 코드 정의
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',   // 입력값 검증 실패
  NOT_FOUND: 'NOT_FOUND'                  // 리소스 없음
};
