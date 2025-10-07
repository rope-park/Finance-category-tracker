/**
 * Frontend TypeScript 타입 정의 파일
 * 
 * 주요 내용:
 * - packages/shared에서 공통 타입들 import
 * - Frontend 전용 타입들만 정의
 * - 카테고리 체계 정의 (1차/2차 카테고리)
 * - 컴포넌트 상태 관련 타입
 * - Frontend별 유틸리티 타입
 * 
 * @author Ju Eul Park (rope-park)
 */

// ==================================================
// 공통 타입들 import
// ==================================================
import type {
  Currency,
  TransactionType,
  User,
  Transaction,
  Budget,
  Goal,
  Category,
  CategoryGroup,
  ApiResponse,
  PaginatedResponse,
  LoadingState,
  AsyncState,
  RecurrenceType
} from '@finance-tracker/shared';

// 카테고리 상수들 import
import {
  TRANSACTION_TYPES,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  CATEGORY_METADATA,
  getDefaultCategories,
  isIncomeCategory,
  isExpenseCategory,
  getCategoryName,
  getCategoryIcon,
  getCategoryColor,
  getCategoriesByType,
  getCategoryOptions,
  getGroupedCategoryOptions
} from '@finance-tracker/shared';

// 공통 타입들 재export
export type {
  Currency,
  TransactionType,
  User,
  Transaction,
  Budget,
  Goal,
  Category,
  CategoryGroup,
  ApiResponse,
  PaginatedResponse,
  LoadingState,
  AsyncState,
  RecurrenceType
};

// 카테고리 상수들 재export
export {
  TRANSACTION_TYPES,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  CATEGORY_METADATA,
  getDefaultCategories,
  isIncomeCategory,
  isExpenseCategory,
  getCategoryName,
  getCategoryIcon,
  getCategoryColor,
  getCategoriesByType,
  getCategoryOptions,
  getGroupedCategoryOptions
};

// 호환성을 위한 alias
export { getCategoryName as getCategoryLabel };

/** Frontend 전용 타입들 */
export * from './auth';
export * from './social';
export * from './education';

// ==================================================
// Frontend 전용 타입 정의
// ==================================================

/** 분석 기간 타입 - 데이터 분석 시 사용되는 기간 옵션 */
export type AnalysisPeriod = 'week' | 'month' | 'year' | 'all' | 'custom';

/** 카테고리별 예산 인터페이스 - Frontend에서 사용하는 간단한 예산 구조 */
export interface CategoryBudget {
  id: string;           // 예산 ID
  category: Category;   // 카테고리
  amount: number;       // 예산 금액
  spent: number;        // 사용된 금액
  remaining: number;    // 남은 금액
  period: string;       // 기간
  limit: number;        // 예산 한도
  warningThreshold: number; // 경고 임계값
  currency: Currency;  // 통화
}

/** 지출 2차 카테고리 */
export const ExpenseSecondaryCategory = {
  FOOD_RESTAURANT: 'food_restaurant',
  FOOD_GROCERIES: 'food_groceries',
  TRANSPORT_PUBLIC: 'transport_public',
  TRANSPORT_TAXI: 'transport_taxi',
  SHOPPING_CLOTHES: 'shopping_clothes',
  SHOPPING_ELECTRONICS: 'shopping_electronics',
  HEALTHCARE_MEDICINE: 'healthcare_medicine',
  HEALTHCARE_HOSPITAL: 'healthcare_hospital',
} as const;

export type ExpenseSecondaryCategory = typeof ExpenseSecondaryCategory[keyof typeof ExpenseSecondaryCategory];

/** 수입 2차 카테고리 */
export const IncomeSecondaryCategory = {
  SALARY_MAIN: 'salary_main',
  SALARY_BONUS: 'salary_bonus',
  INVESTMENT_DIVIDEND: 'investment_dividend',
  INVESTMENT_INTEREST: 'investment_interest',
  BUSINESS_SALES: 'business_sales',
  BUSINESS_SERVICE: 'business_service',
} as const;

export type IncomeSecondaryCategory = typeof IncomeSecondaryCategory[keyof typeof IncomeSecondaryCategory];

/** 날짜 범위 인터페이스 - 시작일과 종료일 정의 */
export interface DateRange {
  start: string;  // 시작일 (YYYY-MM-DD)
  end: string;    // 종료일 (YYYY-MM-DD)
}

/** 기간 옵션 인터페이스 - UI에서 사용되는 기간 선택 옵션 */
export interface PeriodOption {
  id: AnalysisPeriod;       // 기간 식별자
  label: string;            // 사용자에게 표시될 라벨
  value: AnalysisPeriod;    // 실제 값
}

/** 알림 인터페이스 - 사용자에게 표시될 알림 메시지 */
export interface Notification {
  id: string;                   // 알림 고유 ID
  message: string;              // 알림 메시지 내용
  type: 'success' | 'error' | 'warning' | 'info'; // 알림 유형
  timestamp: number;            // 알림 생성 타임스탬프
  is_read?: boolean;            // 읽음 여부
}

/** 전체 애플리케이션 상태 인터페이스 */
export interface AppState {
  transactions: Transaction[];    // 모든 거래 내역
  budgets: Budget[];              // 모든 예산 내역
  recurringTemplates: RecurringTemplate[];  // 반복 거래 템플릿
  darkMode: boolean;              // 다크 모드 설정
  currency: Currency;             // 기본 통화
}

/**
 * 거래 유형에 따른 한글 라벨 반환
 * @param type - 거래 유형 ('income' | 'expense')
 * @returns 한글 라벨 (수입/지출)
 */
export const getTransactionTypeLabel = (type: TransactionType): string => {
  switch (type) {
    case 'income': return '수입';
    case 'expense': return '지출';
    default: return '알 수 없음';
  }
};

/** 반복 거래 템플릿 인터페이스 - 정기적으로 반복되는 거래 설정 */
export interface RecurringTemplate {
  id: string;                       // 템플릿 고유 ID
  name: string;                     // 템플릿 이름
  description: string;              // 템플릿 설명
  amount: number;                   // 거래 금액
  category: Category;               // 거래 카테고리
  type: TransactionType;            // 거래 유형 (수입/지출)
  recurrenceType: RecurrenceType;   // 반복 주기 유형
  recurrenceDay?: number;           // 반복 주기 (예: 매월 15일)
  isActive: boolean;                // 활성화 여부
  nextDueDate: string;              // 다음 실행 예정일
  lastExecuted?: string;            // 마지막 실행일 (선택적)
  autoExecute: boolean;             // 자동 실행 여부
  notificationEnabled: boolean;     // 알림 설정 여부
  createdAt: string;                // 생성 일시
  updatedAt: string;                // 수정 일시
}

/**
 * 기존 카테고리 매핑 (하위 호환성)
 */
export const LegacyCategoryMapping: Record<string, Category> = {
  'restaurant_fast_food': EXPENSE_CATEGORIES.RESTAURANT,
  'cafe_coffee': EXPENSE_CATEGORIES.COFFEE,
  'transportation': EXPENSE_CATEGORIES.TRANSPORT,
  'shopping': EXPENSE_CATEGORIES.SHOPPING,
  'medical': EXPENSE_CATEGORIES.MEDICAL,
  'entertainment': EXPENSE_CATEGORIES.ENTERTAINMENT,
  'education': EXPENSE_CATEGORIES.EDUCATION,
  'salary': INCOME_CATEGORIES.SALARY,
};

// 기본 카테고리 반환 함수 (하위 호환성)
export const getDefaultCategory = (): Category => {
  return EXPENSE_CATEGORIES.FOOD;
};

// TransactionCategory 별칭 (하위 호환성)
export type TransactionCategory = Category;