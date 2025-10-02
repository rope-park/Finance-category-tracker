// 상수 내보내기
export {
  TRANSACTION_TYPES,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  CATEGORY_METADATA,
  EXPENSE_CATEGORY_GROUPS,
  CURRENCIES,
  CURRENCY_METADATA,
  CURRENCY_GROUPS,
} from './constants';

// 타입 내보내기
export type {
  TransactionType,
  Category,
  IncomeCategory,
  ExpenseCategory,
  Currency,
  CurrencyMetadata,
  CategoryMetadata,
  CategoryGroup,
} from './constants';

export * from './types';

// 유틸리티 함수들 (server-side only)
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