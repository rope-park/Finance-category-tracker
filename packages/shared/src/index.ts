/**
 * 공유 패키지 메인 export 파일
 * 
 * Frontend와 Backend에서 공통으로 사용하는 타입, 상수, 유틸리티 함수들.
 * 코드 중복을 방지하고 타입 안정성을 보장하는 중앙집중식 공유 모듈.
 * 
 * @author Ju Eul Park (rope-park)
 * @package @finance-tracker/shared
 */

// ==================================================
// 비즈니스 상수들 (카테고리, 통화 등)
// ==================================================
export {
  TRANSACTION_TYPES,        // 거래 유형 (수입/지출)
  INCOME_CATEGORIES,        // 수입 카테고리 목록
  EXPENSE_CATEGORIES,       // 지출 카테고리 목록
  CATEGORY_METADATA,        // 카테고리 메타데이터 (아이콘, 색상 등)
  EXPENSE_CATEGORY_GROUPS,  // 지출 카테고리 그룹핑
  CURRENCIES,               // 지원 통화 목록
  CURRENCY_METADATA,        // 통화 메타데이터
  CURRENCY_GROUPS,          // 통화 그룹핑
} from './constants';

// ==================================================
// 타입 정의들
// ==================================================
export type {
  TransactionType,          // 거래 유형 타입
  Category,                 // 카테고리 타입
  IncomeCategory,           // 수입 카테고리 타입
  ExpenseCategory,          // 지출 카테고리 타입
  Currency,                 // 통화 타입
  CurrencyMetadata,         // 통화 메타데이터 타입
  CategoryMetadata,         // 카테고리 메타데이터 타입
  CategoryGroup,            // 카테고리 그룹 타입
} from './constants';

// 모든 비즈니스 도메인 타입들
export * from './types';

// ==================================================
// 유틸리티 함수들 (주로 서버사이드용)
// ==================================================
export * from './utils';

// 카테고리 유틸리티 함수들 직접 export
export {
  isIncomeCategory,
  isExpenseCategory,
  getDefaultCategories,
  getCategoryName,
  getCategoryIcon,
  getCategoryColor,
  getCategoriesByType,
  getCategoryOptions,
  getGroupedCategoryOptions
} from './constants/categoryUtils';

// 통화 유틸리티 함수들 직접 export
export {
  isValidCurrency,
  formatCurrency,
  convertCurrency,
  getCurrencySymbol,
  getCurrencyName,
  getCurrencyOptions
} from './constants/currencyUtils';

// 반복 거래 유틸리티 함수들 직접 export
export type { RecurrenceType } from './utils/recurring';
export {
  calculateNextDueDate,
  isDueForExecution,
  getRecurrenceTypeLabel
} from './utils/recurring';

// 네임스페이스로도 export (하위 호환성)
import * as categoryUtilsFunctions from './constants/categoryUtils';
import * as currencyUtilsFunctions from './constants/currencyUtils';

export const categoryUtils = categoryUtilsFunctions;
export const currencyUtils = currencyUtilsFunctions;