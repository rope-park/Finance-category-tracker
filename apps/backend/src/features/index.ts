/**
 * 모든 기능 모듈들을 통합 export 하는 파일
 * 
 * Finance Tracker의 핵심 기능들:
 * - 분석 (analytics): 지출 분석, 통계, 예측
 * - 사용자 (users): 사용자 관리, 프로필
 * - 거래 (transactions): 거래 내역, 카테고리
 * - 예산 (budgets): 예산 관리, 목표 설정
 * - 알림 (notifications): 시스템 알림
 * - 커뮤니티 (community): 사용자 간 소통
 * - 교육 (education): 금융 교육 컨텐츠
 * - 소셜 (social): 소셜 기능
 * - 자동화 (automation): 자동 처리 기능
 * - 헬스체크 (health): 시스템 상태 확인
 */

// 분석 및 통계 기능
export * from './analytics';

// 사용자 관리 기능
export * from './users';

// 거래 관리 기능 (핵심)
export * from './transactions';

// 예산 및 목표 관리 기능 (핵심)
export * from './budgets';

// 알림 시스템
export * from './notifications';

// 커뮤니티 기능
export * from './community';

// 교육 컨텐츠
export * from './education';

// 소셜 기능
export * from './social';

// 자동화 기능
export * from './automation';

// 시스템 헬스체크
export * from './health';