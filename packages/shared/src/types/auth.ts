import { User } from './user';

// 회원가입 요청 타입
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone_number?: string;
  age_group?: string;
}

// 로그인 요청 타입
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// 인증 응답 타입
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: Omit<User, 'password_hash'>;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
}

// 향상된 인증 응답 타입
export interface EnhancedAuthResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
}

// 토큰 갱신 요청 타입
export interface RefreshTokenRequest {
  refreshToken: string;
}

// 비밀번호 재설정 요청 타입
export interface ResetPasswordRequest {
  email: string;
}

// 비밀번호 변경 요청 타입
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}