/**
 * 공유 레포지토리 패턴
 * 
 * 데이터베이스 접근을 위한 베이스 클래스와 공통 인터페이스.
 * Repository 패턴을 통해 데이터 접근 로직을 분리하고 재사용성 증대.
 */

// 기본 레포지토리 클래스 (CRUD 공통 기능)
export { BaseRepository } from './BaseRepository';

// TODO: 각 기능별 레포지토리들 구현 필요
// 예산 관리 레포지토리
export const budgetRepository = null;

// 거래 내역 레포지토리  
export const transactionRepository = null;

// 사용자 관리 레포지토리
export const userRepository = null;