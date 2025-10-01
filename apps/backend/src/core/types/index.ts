import type {
  User, Transaction, Budget, Goal, Category, Currency, TransactionType,
  // API 관련 타입들
  ApiResponse, PaginatedResponse, LoadingState, AsyncState,
  // 폼 관련 타입들
  LoginData, RegisterData
} from '@finance-tracker/shared';

// 공통 타입들을 다시 export (다른 파일에서 쉽게 사용할 수 있도록)
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
  // DB 특화 필드가 있다면 여기에 추가
}

export interface DatabaseBudget extends Budget {
  // DB 특화 필드가 있다면 여기에 추가
}

// 인증 응답 타입 (Backend 전용)
export interface AuthResponse {
  user: Omit<DatabaseUser, 'password_hash'>;
  token: string;
  refreshToken?: string;
}

// 세션 관련 타입 (Backend 전용)
export interface SessionData {
  userId: number;
  email: string;
  name: string;
  isAuthenticated: boolean;
  loginTime: Date;
}

// 미들웨어 관련 타입 (Backend 전용)
export interface AuthenticatedRequest extends Request {
  user?: DatabaseUser;
  session?: SessionData;
}

// 서비스 레이어 타입 (Backend 전용)
export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}