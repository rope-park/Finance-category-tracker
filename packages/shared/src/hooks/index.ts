/**
 * 공유 React Hooks 모음
 * 
 * Frontend에서 사용하는 커스텀 훅들을 중앙 관리.
 * 로직 재사용성과 코드 일관성을 위해 공통 훅들을 모듈화.
 * 
 * @author Ju Eul Park (rope-park)
 */

// ==================================================
// 기본 유틸리티 훅들
// ==================================================

// 디바운스 처리 (검색, API 호출 최적화)
export * from './useDebounce';

// 로컬스토리지 상태 관리
export * from './useLocalStorage';

// ==================================================
// 비즈니스 로직 훅들
// ==================================================

// 통화 변환 및 포매팅
export * from './useCurrency';

// 거래 내역 관리
export * from './useTransactions';

// 예산 관리
export * from './useBudget';

// ==================================================
// 상태 관리 훅들
// ==================================================

// 비동기 상태 관리 (로딩, 에러, 데이터)
export * from './useAsync';

// 로딩 상태 관리
export type {
  LoadingState,
  AsyncState,
} from '../types';

// 비즈니스 도메인 타입들
export type {
  Category,
  TransactionType,
  Currency,
} from '../constants';
