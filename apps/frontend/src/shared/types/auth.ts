/**
 * Frontend 전용 인증 관련 타입 정의
 */
import type { 
  User as SharedUser,
  LoginData,
  RegisterData
} from '@finance-tracker/shared';

// 프론트엔드 전용 사용자 타입 (SharedUser 확장)
export interface User extends SharedUser {
  avatar?: string | null;           // 프로필 이미지 URL
  phone?: string | null;            // 휴대폰 번호
  ageGroup?: number | string | null; // 연령대
  preferences?: UserPreferences;     // 사용자 개인 설정
}

export interface UserPreferences {
  currency: 'KRW' | 'USD' | 'EUR' | 'JPY'; // 기본 통화
  language: 'ko' | 'en';                   // 언어 설정
  darkMode: boolean;                       // 다크 모드 사용 여부
  notifications: {                         // 알림 설정
    budget: boolean;                       // 예산 알림
    transaction: boolean;                  // 거래 알림
    email: boolean;                        // 이메일 알림
  };
}

// 로그인 폼 데이터
export interface LoginFormData {
  email: string;           // 이메일 주소
  password: string;        // 비밀번호
  rememberMe?: boolean;    // 로그인 상태 유지 (remember_me의 camelCase 버전)
}

export interface RegisterFormData {
  name: string;            // 사용자 이름
  email: string;           // 이메일 주소
  password: string;        // 비밀번호
  confirmPassword: string; // 비밀번호 확인 (password_confirmation의 camelCase 버전)
  agreeToTerms: boolean;   // 약관 동의 여부 (terms_accepted의 camelCase 버전)
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
  user: User;              // 사용자 정보
  token: string;           // 액세스 토큰
  refreshToken?: string;   // 리프레시 토큰
}

export interface AuthError {
  code: string;     // 에러 코드
  message: string;  // 에러 메시지
  field?: string;   // 에러가 발생한 필드명
}

export interface AuthState {
  user: User | null;           // 현재 사용자 정보
  token: string | null;        // 인증 토큰
  isLoading: boolean;          // 로딩 상태
  isAuthenticated: boolean;    // 인증 상태
  error: AuthError | null;     // 에러 정보
}