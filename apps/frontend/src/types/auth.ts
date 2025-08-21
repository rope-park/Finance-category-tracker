import type { AuthResponse as SharedAuthResponse } from '@finance-tracker/shared';

// 프론트엔드에서 사용하는 User 타입 (공유 타입과 호환)
export interface User {
  id: number;
  email: string;
  name: string;
  profile_picture?: string;
  phone_number?: string;
  age_group?: string;
  bio?: string;
  profile_completed: boolean;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  currency: 'KRW' | 'USD' | 'EUR' | 'JPY';
  language: 'ko' | 'en';
  darkMode: boolean;
  notifications: {
    budget: boolean;
    transaction: boolean;
    email: boolean;
  };
}

// 폼 데이터 타입들 (UI 전용)
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

// 프론트엔드 AuthResponse (공유 타입 확장)
export interface AuthResponse extends SharedAuthResponse {
  refreshToken?: string; // 선택적 필드
}

export interface AuthError {
  code: string;
  message: string;
  field?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: AuthError | null;
}
