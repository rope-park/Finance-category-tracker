/**
 * 사용자 관련 공통 타입들
 */

// 사용자 역할 타입
export type UserRole = 'user' | 'premium' | 'admin';
// user: 일반 사용자 (Free plan)
// premium: 프리미엄 사용자 (Paid plan)
// admin: 관리자 (Full access)

// 계정의 활성 상태를 나타내는 타입
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending_verification';
// active: 정상 활성 상태
// inactive: 비활성 상태 (사용자가 비활성화)
// suspended: 정지 상태 (관리자에 의한 제재)
// pending_verification: 이메일 인증 대기 중

// 사용자의 연령대 범위 타입
export type AgeGroup = '1-13' | '14-19' | '20-29' | '30-39' | '40-49' | '50-59' | '60+';

// 앱에서 사용할 언어 설정 타입
export type Language = 'ko' | 'en' | 'ja' | 'zh';
// ko: 한국어, en: 영어, ja: 일본어, zh: 중국어

// 사용자가 선호하는 기본 통화 단위 타입
export type Currency = 'KRW' | 'USD' | 'EUR' | 'JPY' | 'CNY' | 'GBP';
// KRW: 한국 원, USD: 미국 달러, EUR: 유로, JPY: 일본 엔, CNY: 중국 위안, GBP: 영국 파운드

// 사용자 정보
export interface User {
  id: number;                      // 사용자 고유 식별자 (Primary Key)
  email: string;                   // 로그인용 이메일 주소
  name: string;                    // 사용자 이름 (실명 또는 닉네임)
  profile_picture?: string;        // 프로필 사진 URL (선택사항)
  phone_number?: string;           // 휴대폰 번호 (선택사항)
  age_group?: AgeGroup;            // 연령대 (선택사항)
  bio?: string;                    // 자기소개 또는 메모 (선택사항)
  role: UserRole;                  // 사용자 역할 및 권한
  status: UserStatus;              // 계정 상태
  profile_completed: boolean;      // 프로필 작성 완료 여부
  email_verified: boolean;         // 이메일 인증 완료 여부
  created_at: string;              // 계정 생성 일시
  updated_at: string;              // 계정 정보 최종 수정 일시
  last_login?: string;             // 마지막 로그인 일시 (선택사항)
  is_active: boolean;              // 현재 활성 상태 여부
}

// 사용자 개인설정 정보
export interface UserSettings {
  id: number;                              // 설정 레코드 고유 식별자
  user_id: number;                         // 설정 소유자 사용자 ID
  currency: Currency;                      // 기본 통화 단위
  language: Language;                      // 앱 표시 언어
  timezone: string;                        // 사용자 시간대 (IANA 표준)
  dark_mode: boolean;                      // 다크 모드 사용 여부
  
  // 알림 설정 그룹
  notification_budget_warning: boolean;    // 예산 주의 알림 (예: 80% 달성 시)
  notification_budget_exceeded: boolean;   // 예산 초과 알림
  notification_large_expense: boolean;     // 대규모 지출 알림
  notification_weekly_summary: boolean;    // 주간 요약 알림
  
  // 알림 임계값 설정
  budget_warning_threshold: number;        // 예산 경고 임계값 (0-100%)
  large_expense_threshold: number;         // 대규모 지출 금액 기준
  
  created_at: string;                      // 설정 최초 생성 일시
  updated_at: string;                      // 설정 최종 수정 일시
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
  profile_picture?: string;   // 프로필 사진 URL
  phone_number?: string;
  age_group?: AgeGroup;
  bio?: string;
}

// 사용자 프로필 (정보 + 설정 + 통계)
export interface UserProfile extends User {
  settings: UserSettings;
  stats: UserStats;
}

// 사용자 통계 정보
export interface UserStats {
  total_transactions: number; // 총 거래 횟수
  total_income: number;       // 총 수입 금액
  total_expense: number;      // 총 지출 금액
  active_budgets: number;     // 활성 예산 수
  account_age_days: number;   // 계정 생성 후 경과 일수
  average_monthly_expense: number; // 평균 월별 지출
  most_used_category: string;  // 가장 많이 사용된 카테고리
  savings_rate: number;       // 저축률 (%)
}

// 인증 관련 타입
export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  profile_picture?: string;    // 프로필 사진 URL
  email_verified: boolean;     // 이메일 인증 여부
  profile_completed: boolean;  // 프로필 작성 완료 여부
}

// 로그인 데이터 
export interface LoginData {
  email: string;
  password: string;
  remember_me?: boolean;  // 로그인 상태 유지 옵션
}

// 회원가입 데이터
export interface RegisterData {
  email: string;
  name: string;
  password: string;
  password_confirmation: string;
  age_group?: AgeGroup;
  terms_accepted: boolean;  // 이용약관 동의 여부
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
  iat: number;  // 발급 시간 (Issued At)
  exp: number;  // 만료 시간 (Expiration)
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
  currency?: Currency;                    // 기본 통화 단위
  language?: Language;                    // 앱 표시 언어
  timezone?: string;                      // 사용자 시간대 (IANA 표준)
  dark_mode?: boolean;                    // 다크 모드 사용 여부
  notification_budget_warning?: boolean;  // 예산 주의 알림
  notification_budget_exceeded?: boolean; // 예산 초과 알림
  notification_large_expense?: boolean;   // 대규모 지출 알림
  notification_weekly_summary?: boolean;  // 주간 요약 알림
  budget_warning_threshold?: number;      // 예산 경고 임계값 (0-100%)
  large_expense_threshold?: number;       // 대규모 지출 금액 기준
}
