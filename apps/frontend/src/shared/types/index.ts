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
 * @author Finance Category Tracker Team
 * @version 1.0.0
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

// 공통 타입들 재export (다른 파일에서 쉽게 사용할 수 있도록)
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
  id: string;
  category: Category;
  amount: number;
  spent: number;
  remaining: number;
  period: string;
  limit: number;
  warningThreshold: number;
  currency: Currency;
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
  /** 시작 날짜 (YYYY-MM-DD 형식) */
  start: string;
  /** 종료 날짜 (YYYY-MM-DD 형식) */
  end: string;
}

/** 기간 옵션 인터페이스 - UI에서 사용되는 기간 선택 옵션 */
export interface PeriodOption {
  /** 기간 옵션 ID */
  id: AnalysisPeriod;
  /** 사용자에게 보여지는 라벨 */
  label: string;
  /** 실제 값 */
  value: AnalysisPeriod;
}

// RecurrenceType은 packages/shared에서 import

/** 알림 인터페이스 - 사용자에게 표시될 알림 메시지 */
export interface Notification {
  /** 알림 고유 ID */
  id: string;
  /** 알림 메시지 내용 */
  message: string;
  /** 알림 유형 (성공, 오류, 경고, 정보) */
  type: 'success' | 'error' | 'warning' | 'info';
  /** 알림 생성 시간 (timestamp) */
  timestamp: number;
  /** 읽음 여부 (선택적) */
  is_read?: boolean;
}

/** 전체 애플리케이션 상태 인터페이스 */
export interface AppState {
  /** 전체 거래 내역 목록 */
  transactions: Transaction[];
  /** 카테고리별 예산 목록 */
  budgets: Budget[];
  /** 반복 거래 템플릿 목록 */
  recurringTemplates: RecurringTemplate[];
  /** 다크 모드 설정 */
  darkMode: boolean;
  /** 기본 통화 단위 */
  currency: Currency;
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
  /** 템플릿 고유 ID */
  id: string;
  /** 템플릿 이름 */
  name: string;
  /** 템플릿 설명 */
  description: string;
  /** 거래 금액 */
  amount: number;
  /** 거래 카테고리 */
  category: Category;
  /** 거래 유형 (수입/지출) */
  type: TransactionType;
  /** 반복 주기 유형 */
  recurrenceType: RecurrenceType;
  /** 반복 실행 일자 (선택적) */
  recurrenceDay?: number;
  /** 활성 상태 여부 */
  isActive: boolean;
  /** 다음 실행 예정일 */
  nextDueDate: string;
  /** 마지막 실행일 (선택적) */
  lastExecuted?: string;
  /** 자동 실행 여부 */
  autoExecute: boolean;
  /** 알림 설정 여부 */
  notificationEnabled: boolean;
  /** 생성 일시 */
  createdAt: string;
  /** 수정 일시 */
  updatedAt: string;
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

// 기본 카테고리 반환 함수 (하위호환성)
export const getDefaultCategory = (): Category => {
  return EXPENSE_CATEGORIES.FOOD;
};

// TransactionCategory 별칭 (하위 호환성)
export type TransactionCategory = Category;