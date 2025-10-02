// 사용자 역할 타입
export type UserRole = 'user' | 'premium' | 'admin';

// 사용자 상태 타입
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending_verification';

// 연령대 타입
export type AgeGroup = '1-13' | '14-19' | '20-29' | '30-39' | '40-49' | '50-59' | '60+';

// 언어 타입
export type Language = 'ko' | 'en' | 'ja' | 'zh';

// 통화 타입
export type Currency = 'KRW' | 'USD' | 'EUR' | 'JPY' | 'CNY';

// 기본 User 인터페이스
export interface User {
  id: number;
  email: string;
  name: string;
  profile_picture?: string;
  phone_number?: string;
  age_group?: AgeGroup;
  bio?: string;
  role: UserRole;
  status: UserStatus;
  profile_completed: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
  is_active: boolean;
}

// 사용자 설정
export interface UserSettings {
  id: number;
  user_id: number;
  currency: Currency;
  language: Language;
  timezone: string;
  dark_mode: boolean;
  notification_budget_warning: boolean;
  notification_budget_exceeded: boolean;
  notification_large_expense: boolean;
  notification_weekly_summary: boolean;
  budget_warning_threshold: number;
  large_expense_threshold: number;
  created_at: string;
  updated_at: string;
}

// 사용자 생성용 타입
export interface CreateUserData {
  email: string;
  name: string;
  password: string;
  age_group?: AgeGroup;
  phone_number?: string;
}

// 사용자 업데이트용 타입
export interface UpdateUserData {
  name?: string;
  profile_picture?: string;
  phone_number?: string;
  age_group?: AgeGroup;
  bio?: string;
}

// 사용자 프로필
export interface UserProfile extends User {
  settings: UserSettings;
  stats: UserStats;
}

// 사용자 통계
export interface UserStats {
  total_transactions: number;
  total_income: number;
  total_expense: number;
  active_budgets: number;
  account_age_days: number;
  average_monthly_expense: number;
  most_used_category: string;
  savings_rate: number;
}

// 인증 관련 타입
export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  profile_picture?: string;
  email_verified: boolean;
  profile_completed: boolean;
}

// 로그인 데이터
export interface LoginData {
  email: string;
  password: string;
  remember_me?: boolean;
}

// 회원가입 데이터
export interface RegisterData {
  email: string;
  name: string;
  password: string;
  password_confirmation: string;
  age_group?: AgeGroup;
  terms_accepted: boolean;
}

// 비밀번호 재설정
export interface ResetPasswordData {
  token: string;
  password: string;
  password_confirmation: string;
}

// JWT 토큰 페이로드
export interface JWTPayload {
  user_id: number;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

// 사용자 프로필 업데이트 요청
export interface ProfileUpdateRequest {
  name?: string;
  phone_number?: string;
  age_group?: AgeGroup;
  bio?: string;
  profile_picture?: string;
}

// 사용자 설정 업데이트 요청
export interface SettingsUpdateRequest {
  currency?: Currency;
  language?: Language;
  timezone?: string;
  dark_mode?: boolean;
  notification_budget_warning?: boolean;
  notification_budget_exceeded?: boolean;
  notification_large_expense?: boolean;
  notification_weekly_summary?: boolean;
  budget_warning_threshold?: number;
  large_expense_threshold?: number;
}
