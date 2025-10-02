/**
 * API 응답 관련 공통 타입들
 */

// 기본 API 응답 구조
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

// 성공 응답
export interface SuccessResponse<T = any> extends ApiResponse<T> {
  success: true;
  data: T;
}

// 에러 응답
export interface ErrorResponse extends ApiResponse<never> {
  success: false;
  error: string;
  error_code?: string;
  details?: Record<string, any>;
}

// 페이지네이션 메타데이터
export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  total_pages: number;
  has_next_page: boolean;
  has_prev_page: boolean;
}

// 페이지네이션된 응답
export interface PaginatedResponse<T> extends SuccessResponse<T[]> {
  meta: PaginationMeta;
}

// 페이지네이션 쿼리 파라미터
export interface PaginationQuery {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// 검색 쿼리 파라미터
export interface SearchQuery extends PaginationQuery {
  q?: string;
  filters?: Record<string, any>;
}

// 날짜 범위 필터
export interface DateRangeFilter {
  start_date?: string;
  end_date?: string;
}

// 정렬 옵션
export interface SortOption {
  field: string;
  order: 'asc' | 'desc';
  label: string;
}

// 필터 옵션
export interface FilterOption {
  key: string;
  label: string;
  value: any;
  count?: number;
}

// 다중 선택 필터
export interface MultiSelectFilter {
  key: string;
  label: string;
  options: FilterOption[];
  selected: any[];
}

// HTTP 메서드 타입
export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// API 엔드포인트 구성
export interface ApiEndpoint {
  method: HTTPMethod;
  path: string;
  requiresAuth?: boolean;
  rateLimit?: number;
}

// 업로드 파일 정보
export interface FileUpload {
  file: File;
  name: string;
  size: number;
  type: string;
  preview?: string;
}

// 업로드 진행 상황
export interface UploadProgress {
  file_id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

// 벌크 액션 결과
export interface BulkActionResult {
  total: number;
  successful: number;
  failed: number;
  errors: Array<{
    id: number | string;
    error: string;
  }>;
}

// 시스템 상태
export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  database: 'connected' | 'disconnected';
  redis: 'connected' | 'disconnected';
  external_apis: Record<string, 'healthy' | 'error'>;
  uptime: number;
  version: string;
  timestamp: string;
}