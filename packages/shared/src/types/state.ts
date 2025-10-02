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
  data?: T;
  loading: LoadingState;
  error?: E;
  lastUpdated?: string;
}

// Redux/Zustand 액션 타입
export interface Action<T = any> {
  type: string;
  payload?: T;
  meta?: Record<string, any>;
  error?: boolean;
}

// 스토어 상태 (예시)
export interface AppState {
  auth: AuthState;
  user: UserState;
  transactions: TransactionState;
  budgets: BudgetState;
  ui: UIState;
}

// 인증 상태
export interface AuthState {
  isAuthenticated: boolean;
  user?: AuthUser;
  token?: string;
  refreshToken?: string;
  loading: LoadingState;
  error?: string;
}

// 사용자 상태
export interface UserState extends AsyncState<UserProfile> {
  settings: AsyncState<UserSettings>;
  stats: AsyncState<UserStats>;
}

// 트랜잭션 상태
export interface TransactionState {
  list: AsyncState<Transaction[]>;
  current?: Transaction;
  filters: TransactionFilters;
  pagination: PaginationMeta;
  stats: AsyncState<TransactionStats>;
}

// 예산 상태
export interface BudgetState {
  list: AsyncState<Budget[]>;
  current?: Budget;
  progress: AsyncState<BudgetProgress[]>;
  alerts: AsyncState<BudgetAlert[]>;
}

// UI 상태
export interface UIState {
  theme: 'light' | 'dark' | 'system';
  sidebar: {
    isOpen: boolean;
    isCollapsed: boolean;
  };
  modals: Record<string, boolean>;
  notifications: Notification[];
  loading: {
    global: boolean;
    components: Record<string, boolean>;
  };
}

// 알림 타입
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
  timestamp: string;
}

// 전역 설정
export interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  features: {
    darkMode: boolean;
    notifications: boolean;
    analytics: boolean;
    socialFeatures: boolean;
  };
  limits: {
    maxTransactionsPerPage: number;
    maxFileSize: number;
    maxCategoriesPerUser: number;
  };
  version: string;
  environment: 'development' | 'staging' | 'production';
}

// 캐시 상태
export interface CacheState<T = any> {
  data: T;
  timestamp: string;
  ttl: number; // Time to live in seconds
  isExpired: boolean;
}

// 옵티미스틱 업데이트
export interface OptimisticUpdate<T = any> {
  id: string;
  type: 'create' | 'update' | 'delete';
  data: T;
  originalData?: T;
  timestamp: string;
  status: 'pending' | 'confirmed' | 'failed';
}