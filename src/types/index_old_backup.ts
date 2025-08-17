// 기본 타입 정의
export type Currency = 'KRW' | 'USD' | 'EUR' | 'JPY' | 'GBP' | 'CNY';
export type TransactionType = 'income' | 'expense';

// 카테고리 값 정의
export const CATEGORY_VALUES = {
  // 지출 카테고리
  RESTAURANT_FAST_FOOD: 'restaurant_fast_food',
  CAFE_COFFEE: 'cafe_coffee',
  BUS_SUBWAY: 'bus_subway',
  TAXI: 'taxi',
  FASHION_CLOTHING: 'fashion_clothing',
  ELECTRONICS_MOBILE: 'electronics_mobile',
  BEAUTY_COSMETICS: 'beauty_cosmetics',
  HOSPITAL: 'hospital',
  MOVIE: 'movie',
  RENT: 'rent',
  
  // 수입 카테고리
  BASE_SALARY: 'base_salary',
  BONUS: 'bonus'
} as const;

export type TransactionCategory = typeof CATEGORY_VALUES[keyof typeof CATEGORY_VALUES];

// 카테고리 라벨 매핑
export const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  'restaurant_fast_food': '패스트푸드',
  'cafe_coffee': '커피',
  'bus_subway': '버스/지하철',
  'taxi': '택시',
  'fashion_clothing': '의류',
  'electronics_mobile': '모바일/폰',
  'beauty_cosmetics': '화장품',
  'hospital': '병원',
  'movie': '영화',
  'rent': '월세/전세',
  'base_salary': '기본급',
  'bonus': '보너스'
};

// 카테고리 아이콘 매핑
export const CATEGORY_ICONS: Record<TransactionCategory, string> = {
  'restaurant_fast_food': '🍔',
  'cafe_coffee': '☕',
  'bus_subway': '🚇',
  'taxi': '🚕',
  'fashion_clothing': '👕',
  'electronics_mobile': '📱',
  'beauty_cosmetics': '💄',
  'hospital': '🏥',
  'movie': '🎬',
  'rent': '🏠',
  'base_salary': '💼',
  'bonus': '🎁'
};

// 헬퍼 함수들
export const getCategoryLabel = (category: TransactionCategory): string => {
  return CATEGORY_LABELS[category] || category;
};

export const getCategoryIcon = (category: TransactionCategory): string => {
  return CATEGORY_ICONS[category] || '📋';
};

// 메인 인터페이스들
export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: TransactionCategory;
  date: string;
  type: TransactionType;
  currency?: Currency;
  merchant?: string;
}

export interface CategoryBudget {
  id: string;
  category: TransactionCategory;
  limit: number;
  spent: number;
  warningThreshold: number;
}

export interface RecurringTemplate {
  id: string;
  name: string;
  amount: number;
  category: TransactionCategory;
  type: TransactionType;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  dayOfMonth?: number;
  dayOfWeek?: number;
  isActive: boolean;
  currency?: Currency;
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp: number;
}

export interface AppState {
  transactions: Transaction[];
  budgets: CategoryBudget[];
  recurringTemplates: RecurringTemplate[];
  darkMode: boolean;
  currency: Currency;
}

// 분석 관련 타입
export type AnalysisPeriod = 'week' | 'month' | 'year' | 'all' | 'custom';

export interface DateRange {
  start: string;
  end: string;
}

export interface PeriodOption {
  value: AnalysisPeriod;
  label: string;
}

// 하위호환성을 위한 타입들
export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type PrimaryCategory = string;

export interface CategoryInfo {
  category: TransactionCategory;
  name: string;
  icon: string;
  color: string;
  bgColor?: string;
  description?: string;
}

// 하위호환성을 위한 TransactionCategory 객체
export const TransactionCategory = CATEGORY_VALUES;

// 유틸리티 함수들
export const getMainCategories = () => {
  return [
    { value: 'food', label: '식비', icon: '🍽️' },
    { value: 'transportation', label: '교통비', icon: '🚗' },
    { value: 'shopping', label: '쇼핑', icon: '🛍️' },
    { value: 'income', label: '수입', icon: '💰' }
  ];
};

export const getSubCategories = (primaryCategory: string) => {
  const categories: Record<string, Array<{ value: TransactionCategory; label: string; icon: string }>> = {
    food: [
      { value: 'restaurant_fast_food', label: '패스트푸드', icon: '🍔' },
      { value: 'cafe_coffee', label: '커피', icon: '☕' }
    ],
    transportation: [
      { value: 'bus_subway', label: '버스/지하철', icon: '🚇' },
      { value: 'taxi', label: '택시', icon: '🚕' }
    ],
    shopping: [
      { value: 'fashion_clothing', label: '의류', icon: '👕' },
      { value: 'electronics_mobile', label: '모바일/폰', icon: '📱' }
    ],
    income: [
      { value: 'base_salary', label: '기본급', icon: '💼' },
      { value: 'bonus', label: '보너스', icon: '🎁' }
    ]
  };
  return categories[primaryCategory] || [];
};

export const getCategoryInfo = (category: TransactionCategory) => {
  return {
    primary: 'general',
    label: getCategoryLabel(category),
    icon: getCategoryIcon(category)
  };
};

// 기본값 함수
export const getDefaultCategory = (): TransactionCategory => {
  return 'restaurant_fast_food';
};
