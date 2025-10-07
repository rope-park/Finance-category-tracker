/**
 * 핵심 타입 정의 모듈
 * 
 * Finance Category Tracker 애플리케이션 전반에서 사용되는 공통 타입들과 Backend 전용 타입들을 정의.
 * 
 * 주요 기능:
 * - 사용자, 거래, 예산 등 주요 도메인 모델 타입 정의
 * - API 응답 및 요청 데이터 구조 타입 정의
 */
import type {
  User, Transaction, Budget, Goal, Category, Currency, TransactionType,
  // API 관련 타입들
  ApiResponse, PaginatedResponse, LoadingState, AsyncState,
  // 폼 관련 타입들
  LoginData, RegisterData
} from '@finance-tracker/shared';

// 공통 타입들 재export
export type {
  User, Transaction, Budget, Goal, Category, Currency, TransactionType, 
  ApiResponse, PaginatedResponse, LoadingState, AsyncState,
  LoginData, RegisterData
};

// Backend 전용 타입들만 여기에 정의
export interface DatabaseUser extends User {
  password_hash: string; // DB에만 저장되는 필드
}

export interface DatabaseTransaction extends Transaction {
  // TODO: DB 특화 필드가 있다면 여기에 추가
}

export interface DatabaseBudget extends Budget {
  // TODO: DB 특화 필드가 있다면 여기에 추가
}

/**
 * 인증 응답 타입 (Backend 전용)
 * 
 * 로그인 및 회원가입 API 응답에 사용되는 타입.
 * 사용자 정보와 JWT 토큰을 포함.
 */
export interface AuthResponse {
  user: Omit<DatabaseUser, 'password_hash'>;
  token: string;
  refreshToken?: string;
}

/**
 * 세션 데이터 타입 (Backend 전용)
 * 
 * Express 세션 미들웨어에서 사용되는 세션 데이터 구조.
 */
export interface SessionData {
  userId: number;
  email: string;
  name: string;
  isAuthenticated: boolean;
  loginTime: Date;
}

/**
 * 확장된 Express Request 타입 (Backend 전용)
 * 
 * 인증된 사용자 정보와 세션 데이터를 포함하도록 확장.
 */
export interface AuthenticatedRequest extends Request {
  user?: DatabaseUser;
  session?: SessionData;
}

/**
 * 서비스 응답 타입 (Backend 전용)
 * 
 * 서비스 레이어에서 반환하는 표준 응답 구조.
 */
export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}