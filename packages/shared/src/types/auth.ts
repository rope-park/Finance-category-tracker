/**
 * 인증 관련 공통 타입 정의
 */
import { User } from './user';

// 회원가입 요청 타입
export interface RegisterRequest {
  email: string;          // 이메일
  password: string;       // 비밀번호
  name: string;           // 이름
  phone_number?: string;  // 전화번호
  age_group?: string;     // 연령대
}

// 로그인 요청 타입
export interface LoginRequest {
  email: string;          // 이메일
  password: string;       // 비밀번호
  rememberMe?: boolean;   // 로그인 상태 유지 여부
}

// 인증 응답 타입
export interface AuthResponse {
  accessToken: string;              // 액세스 토큰
  refreshToken: string;             // 리프레시 토큰
  user: Omit<User, 'password_hash'>;  // 사용자 정보 (비밀번호 해시는 제외)
  accessTokenExpiresAt: string;     // 액세스 토큰 만료 시각
  refreshTokenExpiresAt: string;    // 리프레시 토큰 만료 시각
}

// 향상된 인증 응답 타입
export interface EnhancedAuthResponse {
  accessToken: string;              // 액세스 토큰
  refreshToken: string;             // 리프레시 토큰
  accessTokenExpiresAt: string;     // 액세스 토큰 만료 시각
  refreshTokenExpiresAt: string;    // 리프레시 토큰 만료 시각
}

// 토큰 갱신 요청 타입
export interface RefreshTokenRequest {
  refreshToken: string; // 리프레시 토큰
}

// 비밀번호 재설정 요청 타입
export interface ResetPasswordRequest {
  email: string;          // 이메일
}

// 비밀번호 변경 요청 타입
export interface ChangePasswordRequest {
  currentPassword: string;  // 현재 비밀번호
  newPassword: string;      // 새 비밀번호
}