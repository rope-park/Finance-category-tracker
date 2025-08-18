export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  ageGroup?: '10대' | '20대' | '30대' | '40대' | '50대' | '60대 이상';
  bio?: string;
  profileCompleted?: boolean; // 프로필 설정 완료 여부
  createdAt: string;
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

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
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
