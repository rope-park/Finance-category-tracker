import type { 
  User as SharedUser,
  LoginData,
  RegisterData
} from '@finance-tracker/shared';

// 프론트엔드에서 사용하는 User 타입 (공유 타입 확장)
export interface User extends SharedUser {
  // 프론트엔드 전용 camelCase 필드 (호환성을 위해)
  avatar?: string | null;
  phone?: string | null;
  ageGroup?: number | string | null;
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

// Frontend 전용 폼 데이터 타입들 (UI 호환성을 위한 camelCase)
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean; // remember_me의 camelCase 버전
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string; // password_confirmation의 camelCase 버전
  agreeToTerms: boolean; // terms_accepted의 camelCase 버전
}

// 공통 타입들을 Frontend에서 사용하기 위한 변환 유틸리티
export const toLoginData = (formData: LoginFormData): LoginData => ({
  email: formData.email,
  password: formData.password,
  remember_me: formData.rememberMe
});

export const toRegisterData = (formData: RegisterFormData): RegisterData => ({
  email: formData.email,
  name: formData.name,
  password: formData.password,
  password_confirmation: formData.confirmPassword,
  terms_accepted: formData.agreeToTerms
});

// 프론트엔드 AuthResponse
export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
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