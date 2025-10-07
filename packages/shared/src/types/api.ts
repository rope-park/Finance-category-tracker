/**
 * API 응답 관련 공통 타입들
 */

// 기본 API 응답 구조
export interface ApiResponse<T = any> {
  success: boolean; // 요청 성공 여부
  data?: T;         // 성공 시 반환되는 데이터
  message?: string; // 추가 메시지
  error?: string;   // 에러 메시지
  timestamp: string;// 응답 생성 시각
}

// 성공 응답
export interface SuccessResponse<T = any> extends ApiResponse<T> {
  success: true;  // 항상 true
  data: T;        // 반환 데이터
}

// 에러 응답
export interface ErrorResponse extends ApiResponse<never> {
  success: false;                 // 항상 false
  error: string;                  // 에러 메시지
  error_code?: string;            // 선택적 에러 코드
  details?: Record<string, any>;  // 추가 에러 상세 정보
}

// 페이지네이션 메타데이터
export interface PaginationMeta {
  current_page: number;   // 현재 페이지 번호
  per_page: number;       // 페이지당 항목 수
  total: number;          // 전체 항목 수
  total_pages: number;    // 전체 페이지 수
  has_next_page: boolean; // 다음 페이지 여부
  has_prev_page: boolean; // 이전 페이지 여부
}

// 페이지네이션된 응답
export interface PaginatedResponse<T> extends SuccessResponse<T[]> {
  meta: PaginationMeta; // 페이지네이션 메타데이터
}

// 페이지네이션 쿼리 파라미터
export interface PaginationQuery {
  page?: number;        // 페이지 번호
  per_page?: number;    // 페이지당 항목 수
  sort_by?: string;     // 정렬 기준
  sort_order?: 'asc' | 'desc'; // 정렬 순서
}

// 검색 쿼리 파라미터
export interface SearchQuery extends PaginationQuery {
  q?: string;                     // 검색어
  filters?: Record<string, any>;  // 추가 필터 조건
}

// 날짜 범위 필터
export interface DateRangeFilter {
  start_date?: string;  // 시작 날짜
  end_date?: string;    // 종료 날짜
}

// 정렬 옵션
export interface SortOption {
  field: string;          // 정렬 대상 필드
  order: 'asc' | 'desc';  // 정렬 순서
  label: string;          // UI 표시용 라벨
}

// 필터 옵션
export interface FilterOption {
  key: string;          // 필터 키
  label: string;        // 필터 UI 표시용 라벨
  value: any;           // 필터 값
  count?: number;       // 필터 항목 수
}

// 다중 선택 필터
export interface MultiSelectFilter {
  key: string;          // 필터 키
  label: string;        // 필터 UI 표시용 라벨
  options: FilterOption[];  // 선택 가능한 옵션들
  selected: any[];      // 현재 선택된 값들
}

// HTTP 메서드 타입
export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// API 엔드포인트 구성
export interface ApiEndpoint {
  method: HTTPMethod; // HTTP 메서드
  path: string;       // 엔드포인트 경로 (예: /users, /transactions)
  requiresAuth?: boolean; // 인증 필요 여부
  rateLimit?: number; // 초당 요청 제한 (선택적)
}

// 업로드 파일 정보
export interface FileUpload {
  file: File;        // 실제 파일 객체
  name: string;      // 파일 이름
  size: number;      // 파일 크기
  type: string;      // 파일 MIME 타입
  preview?: string;  // 파일 미리보기 URL
}

// 업로드 진행 상황
export interface UploadProgress {
  file_id: string;      // 업로드 파일 식별자
  progress: number;     // 0 ~ 100
  status: 'pending' | 'uploading' | 'completed' | 'error';  // 상태
  error?: string;       // 에러 메시지
}

// 벌크 액션 결과
export interface BulkActionResult {
  total: number;        // 총 항목 수
  successful: number;   // 성공한 항목 수
  failed: number;       // 실패한 항목 수
  errors: Array<{       // 실패한 항목 상세
    id: number | string;
    error: string;
  }>;
}

// 시스템 상태
export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';  // 시스템 상태
  database: 'connected' | 'disconnected';   // 데이터베이스 연결 상태
  redis: 'connected' | 'disconnected';      // Redis 연결 상태
  external_apis: Record<string, 'healthy' | 'error'>;  // 외부 API 상태
  uptime: number;                            // 시스템 가동 시간
  version: string;                           // 시스템 버전
  timestamp: string;                         // 응답 생성 시각
}