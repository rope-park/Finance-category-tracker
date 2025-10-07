/**
 * 상태 관리 관련 타입들
 */

import type {
  AuthUser,
  UserProfile,
  UserSettings,
  UserStats,
} from './user';

import type {
  Transaction,
  TransactionFilters,
  TransactionStats,
} from './transactions';

import type {
  Budget,
  BudgetProgress,
  BudgetAlert,
} from './budget';

import type {
  PaginationMeta,
} from './api';

// 로딩 상태
export type LoadingState = 'idle' | 'loading' | 'succeeded' | 'failed';

// 비동기 상태
export interface AsyncState<T = any, E = string> {
  data?: T;              // 데이터
  loading: LoadingState; // 로딩 상태
  error?: E;             // 에러 정보
  lastUpdated?: string;  // 마지막 업데이트 시간
}

// Redux/Zustand 액션 타입
export interface Action<T = any> {
  type: string;                    // 액션 타입
  payload?: T;                     // 액션 데이터
  meta?: Record<string, any>;      // 메타 정보
  error?: boolean;                 // 에러 여부
}

// 스토어 상태 타입
export interface AppState {
  auth: AuthState;         // 인증 상태
  user: UserState;         // 사용자 상태
  transactions: TransactionState; // 거래 상태
  budgets: BudgetState;    // 예산 상태
  ui: UIState;             // UI 상태
}

// 인증 상태
export interface AuthState {
  isAuthenticated: boolean; // 인증 여부
  user?: AuthUser;          // 인증된 사용자 정보
  token?: string;           // 액세스 토큰
  refreshToken?: string;    // 리프레시 토큰
  loading: LoadingState;    // 로딩 상태
  error?: string;           // 에러 메시지
}

// 사용자 상태
export interface UserState extends AsyncState<UserProfile> {
  settings: AsyncState<UserSettings>; // 사용자 설정
  stats: AsyncState<UserStats>;       // 사용자 통계
}

// 트랜잭션 상태
export interface TransactionState {
  list: AsyncState<Transaction[]>;      // 거래 목록
  current?: Transaction;                // 현재 선택된 거래
  filters: TransactionFilters;          // 필터 조건
  pagination: PaginationMeta;           // 페이지네이션 정보
  stats: AsyncState<TransactionStats>;  // 거래 통계
}

// 예산 상태
export interface BudgetState {
  list: AsyncState<Budget[]>;             // 예산 목록
  current?: Budget;                       // 현재 선택된 예산
  progress: AsyncState<BudgetProgress[]>; // 예산 진행 상황
  alerts: AsyncState<BudgetAlert[]>;      // 예산 알림
}

// UI 상태
export interface UIState {
  theme: 'light' | 'dark' | 'system'; // 테마 설정
  sidebar: {                          // 사이드바 상태
    isOpen: boolean;                  // 열림/닫힘 상태
    isCollapsed: boolean;             // 축소/확장 상태
  };
  modals: Record<string, boolean>;    // 모달 열림/닫힘 상태
  notifications: Notification[];      // 알림 목록
  loading: {                          // 로딩 상태
    global: boolean;                  // 전역 로딩
    components: Record<string, boolean>; // 컴포넌트별 로딩
  };
}

// 알림 타입
export interface Notification {
  id: string;                                    // 알림 고유 ID
  type: 'success' | 'error' | 'warning' | 'info'; // 알림 타입
  title: string;                                 // 제목
  message?: string;                              // 메시지
  duration?: number;                             // 표시 시간(ms)
  actions?: Array<{                              // 액션 버튼
    label: string;                               // 버튼 텍스트
    action: () => void;                          // 클릭 핸들러
  }>;
  timestamp: string;                             // 생성 시간
}

// 전역 설정
export interface AppConfig {
  api: {                               // API 설정
    baseUrl: string;                   // 기본 URL
    timeout: number;                   // 타임아웃(ms)
    retries: number;                   // 재시도 횟수
  };
  features: {                          // 기능 설정
    darkMode: boolean;                 // 다크모드 지원
    notifications: boolean;            // 알림 기능
    analytics: boolean;                // 분석 기능
    socialFeatures: boolean;           // 소셜 기능
  };
  limits: {                            // 제한 설정
    maxTransactionsPerPage: number;    // 페이지당 최대 거래 수
    maxFileSize: number;               // 최대 파일 크기
    maxCategoriesPerUser: number;      // 사용자당 최대 카테고리 수
  };
  version: string;                     // 앱 버전
  environment: 'development' | 'staging' | 'production'; // 환경
}

// 캐시 상태
export interface CacheState<T = any> {
  data: T;               // 캐시된 데이터
  timestamp: string;     // 캐시 생성 시간
  ttl: number;           // 생존 시간(초)
  isExpired: boolean;    // 만료 여부
}

// 옵티미스틱 업데이트
export interface OptimisticUpdate<T = any> {
  id: string;                                    // 업데이트 ID
  type: 'create' | 'update' | 'delete';         // 업데이트 타입
  data: T;                                       // 새 데이터
  originalData?: T;                              // 원본 데이터
  timestamp: string;                             // 업데이트 시간
  status: 'pending' | 'confirmed' | 'failed';   // 상태
}