/**
 * API 응답 표준화 유틸리티
 * 
 * Finance Category Tracker의 모든 API 엔드포인트에서 일관된 응답 형식을 사용하도록 도와주는 헬퍼 함수 모음.
 * RESTful API 설계 원칙에 따라 HTTP 상태 코드와 일관된 JSON 구조를 제공하여 클라이언트의 예측 가능한 처리 지원.
 * 
 * 핵심 기능:
 * - 성공 응답 생성 및 데이터 직렬화
 * - 오류 응답 생성 및 예외 처리
 * - 페이지네이션 메타데이터 포함
 * - 타임스탬프 및 요청 추적 정보
 * - 개발/운영 환경별 에러 세부 수준 조정
 * 
 * HTTP 상태 코드 매핑:
 * - 200 OK: 성공적인 조회/수정
 * - 201 Created: 새 리소스 생성 성공
 * - 400 Bad Request: 사용자 입력 오류
 * - 401 Unauthorized: 인증 실패
 * - 403 Forbidden: 인가 거부
 * - 404 Not Found: 리소스 찾을 수 없음
 * - 500 Internal Server Error: 서버 내부 오류
 * 
 * @author Ju Eul Park (rope-park)
 */

/**
 * 표준 API 응답 인터페이스
 * 
 * 모든 REST API 엔드포인트에서 일관되게 사용되는 응답 형식.
 * 
 * @template T - 응답 데이터의 타입 (선택적)
 */
export interface ApiResponse<T = any> {
  success: boolean;     // 요청 성공 여부 (true: 성공, false: 실패)
  message: string;      // 사용자에게 표시할 메시지 (성공/오류 메시지)
  data?: T;            // 실제 응답 데이터 (성공 시에만 포함)
  error?: string;      // 상세 에러 정보 (실패 시에만 포함, 개발자용)
  timestamp?: string;  // 응답 생성 시각 
}

/**
 * 성공 응답 생성 유틸리티 함수
 * 
 * API 요청이 성공했을 때 사용하는 표준 응답 객체를 생성함.
 * 데이터와 메시지를 받아 일관된 형태의 성공 응답을 반환함.
 * 
 * @template T - 반환할 데이터의 타입
 * @param data - 응답에 포함할 실제 데이터
 * @param message - 성공 메시지 (기본값: 'Success')
 * @returns 표준화된 성공 응답 객체
 */
export const createSuccessResponse = <T>(data: T, message = 'Success'): ApiResponse<T> => ({
  success: true,
  message,
  data,
  timestamp: new Date().toISOString() 
});

/**
 * 에러 응답 생성 유틸리티 함수
 * 
 * API 요청이 실패했을 때 사용하는 표준 응답 객체를 생성함.
 * 사용자용 메시지와 개발자용 상세 에러 정보를 분리하여 관리함.
 * 
 * @param message - 사용자에게 표시할 에러 메시지
 * @param error - 개발자용 상세 에러 정보 (선택적)
 * @returns 표준화된 에러 응답 객체
 */
export const createErrorResponse = (message: string, error?: string): ApiResponse => ({
  success: false,
  message,
  error,
  timestamp: new Date().toISOString() 
});
