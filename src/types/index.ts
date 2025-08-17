// 통화 타입 정의
export type Currency = 'KRW' | 'USD' | 'EUR' | 'JPY' | 'GBP' | 'CNY';

// 거래 타입 정의
export type TransactionType = 'income' | 'expense';

// 1차 카테고리 (지출) 정의
export const ExpensePrimaryCategory = {
  FOOD: 'food',                     // 음식
  TRANSPORTATION: 'transportation', // 교통
  SHOPPING: 'shopping',             // 쇼핑
  BEAUTY: 'beauty',                 // 뷰티
  MEDICAL: 'medical',               // 의료
  ENTERTAINMENT: 'entertainment',   // 엔터테인먼트(여가/취미)
  LIVING: 'living',                 // 주거/생활
  FINANCE: 'finance',               // 금융
  EDUCATION: 'education',           // 교육
  SOCIAL: 'social',                 // 사회생활
  PETS: 'pets',                     // 반려동물
  FIXED: 'fixed',                   // 고정비
  OTHER_EXPENSE: 'other_expense',   // 기타
} as const;

// 1차 카테고리 (수입) 정의
export const IncomePrimaryCategory = {
  SALARY: 'salary',                 // 급여
  ALLOWANCE: 'allowance',           // 용돈
  BUSINESS: 'business',             // 사업/부업
  INVESTMENT: 'investment',         // 투자
  OTHER_INCOME: 'other_income'     // 기타
} as const;

export type ExpensePrimaryCategory = typeof ExpensePrimaryCategory[keyof typeof ExpensePrimaryCategory];
export type IncomePrimaryCategory = typeof IncomePrimaryCategory[keyof typeof IncomePrimaryCategory];

// 지출 2차 카테고리 정의
export const ExpenseSecondaryCategory = {
  // 음식(FOOD) 하위 카테고리
  FOOD_RESTAURANT: 'restaurant',
  FOOD_CAFE_COFFEE: 'cafe_coffee',
  FOOD_CAFE_DESSERT: 'cafe_dessert',
  FOOD_CAFE_OTHER: 'cafe_other',
  FOOD_DELIVERY: 'delivery_food',
  FOOD_GROCERY_MART: 'grocery_mart',
  FOOD_GROCERY_TRADITIONAL_MARKET: 'grocery_traditional_market',
  FOOD_ALCOHOL_BAR: 'alcohol_bar',
  FOOD_OTHER: 'food_other',

  // 교통(TRANSPORTATION) 하위 카테고리
  TRANSPORTATION_BUS_SUBWAY: 'bus_subway',
  TRANSPORTATION_TAXI: 'taxi',
  TRANSPORTATION_TRAIN_KTX: 'train_ktx',
  TRANSPORTATION_GASOLINE: 'gasoline',
  TRANSPORTATION_PARKING: 'parking',
  TRANSPORTATION_TOLLS: 'tolls',
  TRANSPORTATION_VEHICLE_RENTAL: 'vehicle_rental',
  TRANSPORTATION_FLIGHT: 'flight',
  TRANSPORTATION_OTHER: 'transportation_other',

  // 쇼핑(SHOPPING) 하위 카테고리
  SHOPPING_FASHION: 'fashion',
  SHOPPING_ELECTRONICS: 'electronics',
  SHOPPING_STATIONERY: 'stationery',
  SHOPPING_CONVENIENCE_STORE: 'convenience_store',
  SHOPPING_ECOMMERCE: 'ecommerce',
  SHOPPING_OTHER: 'shopping_other',

  // 뷰티(BEAUTY) 하위 카테고리
  BEAUTY_COSMETICS: 'cosmetics',
  BEAUTY_HAIR: 'hair',
  BEAUTY_NAIL: 'nail',
  BEAUTY_MASSAGE: 'massage',
  BEAUTY_OTHER: 'beauty_other',

  // 의료(MEDICAL) 하위 카테고리
  MEDICAL_HOSPITAL: 'hospital',
  MEDICAL_PHARMACY: 'pharmacy',
  MEDICAL_PROCEDURE: 'medical_procedure',
  MEDICAL_OTHER: 'medical_other',

  // 엔터테인먼트(ENTERTAINMENT) 하위 카테고리
  ENTERTAINMENT_MOVIE: 'movie',
  ENTERTAINMENT_GAME: 'game',
  ENTERTAINMENT_SPORTS: 'sports',
  ENTERTAINMENT_HOBBIES: 'hobbies',
  ENTERTAINMENT_TRAVEL: 'travel',
  ENTERTAINMENT_CULTURE_EVENTS: 'culture_events',
  ENTERTAINMENT_OTHER: 'entertainment_other',

  // 주거/생활(LIVING) 하위 카테고리
  LIVING_RENT: 'rent',
  LIVING_UTILITIES_ELECTRICITY: 'utilities_electricity',
  LIVING_UTILITIES_GAS: 'utilities_gas',
  LIVING_UTILITIES_WATER: 'utilities_water',
  LIVING_UTILITIES_INTERNET: 'utilities_internet',
  LIVING_PHONE: 'phone',
  LIVING_HOUSEHOLD_ITEMS: 'household_items',
  LIVING_OTHER: 'living_other',

  // 금융(FINANCE) 하위 카테고리
  FINANCE_TRANSFER: 'transfer',
  FINANCE_INVESTMENT: 'investment_expense',
  FINANCE_LOAN_PAYMENT: 'loan_payment',
  FINANCE_SAVINGS: 'savings',
  FINANCE_FEES: 'finance_fees',
  FINANCE_OTHER: 'finance_other',

  // 교육(EDUCATION) 하위 카테고리
  EDUCATION_TUTORING: 'education_tutoring',
  EDUCATION_TUITION: 'education_tuition',
  EDUCATION_BOOKS: 'education_books',
  EDUCATION_SUPPLIES: 'education_supplies',
  EDUCATION_ONLINE: 'education_online',
  EDUCATION_CERTIFICATION: 'education_certification',
  EDUCATION_OTHER: 'education_other',

  // 사회생활(SOCIAL) 관련
  SOCIAL_GIFT: 'social_gift',
  SOCIAL_DONATION: 'social_donation',
  SOCIAL_MEETING: 'social_meeting',
  SOCIAL_EVENTS: 'social_events',
  SOCIAL_OTHER: 'social_other',

  // 반려동물(PETS) 관련
  PETS_VETERINARY: 'pets_medical',
  PETS_FOOD: 'pets_food',
  PETS_SUPPLIES: 'pets_supplies',
  PETS_CARE: 'pets_care',
  PETS_OTHER: 'pets_other',

  // 고정비(FIXED) 관련
  FIXED_RENT: 'fixed_rent',
  FIXED_INSURANCE: 'fixed_insurance',
  FIXED_SUBSCRIPTION: 'fixed_subscription',
  FIXED_OTHER: 'fixed_other',

  // 기타 지출 관련
  OTHER_EXPENSE: 'other_expense',
} as const;

// 수입 2차 카테고리 정의
export const IncomeSecondaryCategory = {
  // 급여(SALARY) 관련
  SALARY_BASE: 'salary_base',
  SALARY_BONUS: 'salary_bonus',
  SALARY_OVERTIME: 'salary_overtime',
  SALARY_OTHER: 'salary_other',

  // 용돈(ALLOWANCE) 관련
  ALLOWANCE: 'allowance',

  // 사업/부업(BUSINESS) 관련
  BUSINESS_INCOME: 'business_income',
  BUSINESS_FREELANCE: 'freelance',
  BUSINESS_SIDE_HUSTLE: 'side_hustle',
  BUSINESS_OTHER: 'business_other',

  // 투자(INVESTMENT) 관련
  INVESTMENT_DIVIDEND: 'dividend',
  INVESTMENT_INTEREST: 'interest',
  INVESTMENT_CAPITAL_GAIN: 'capital_gain',
  INVESTMENT_RENTAL_INCOME: 'rental_income',
  INVESTMENT_OTHER: 'investment_other',

  // 기타 수입
  OTHER_INCOME_GIFT_RECEIVED: 'gift_received',
  OTHER_INCOME_REFUND: 'refund',
  OTHER_INCOME_PENSION: 'pension',
  OTHER_INCOME_FINANCE_TRANSFER: 'finance_transfer',
  OTHER_INCOME: 'other_income'
} as const;

export type ExpenseSecondaryCategory = typeof ExpenseSecondaryCategory[keyof typeof ExpenseSecondaryCategory];
export type IncomeSecondaryCategory = typeof IncomeSecondaryCategory[keyof typeof IncomeSecondaryCategory];

// 전체 카테고리 타입 정의
export type TransactionCategory = ExpenseSecondaryCategory | IncomeSecondaryCategory;

// 카테고리 계층 구조 정의
export const CategoryHierarchy = {
  expense: {
    [ExpensePrimaryCategory.FOOD]: {
      label: '음식',
      icon: '🍽️',
      subcategories: {
        [ExpenseSecondaryCategory.FOOD_RESTAURANT]: '외식',
        [ExpenseSecondaryCategory.FOOD_CAFE_COFFEE]: '커피',
        [ExpenseSecondaryCategory.FOOD_CAFE_DESSERT]: '디저트',
        [ExpenseSecondaryCategory.FOOD_CAFE_OTHER]: '기타 카페',
        [ExpenseSecondaryCategory.FOOD_DELIVERY]: '음식 배달',
        [ExpenseSecondaryCategory.FOOD_GROCERY_MART]: '마트',
        [ExpenseSecondaryCategory.FOOD_GROCERY_TRADITIONAL_MARKET]: '전통시장',
        [ExpenseSecondaryCategory.FOOD_ALCOHOL_BAR]: '술/바',
        [ExpenseSecondaryCategory.FOOD_OTHER]: '기타 식비'
      }
    },
    [ExpensePrimaryCategory.TRANSPORTATION]: {
      label: '교통',
      icon: '🚗',
      subcategories: {
        [ExpenseSecondaryCategory.TRANSPORTATION_BUS_SUBWAY]: '버스/지하철',
        [ExpenseSecondaryCategory.TRANSPORTATION_TAXI]: '택시',
        [ExpenseSecondaryCategory.TRANSPORTATION_TRAIN_KTX]: '기차/KTX',
        [ExpenseSecondaryCategory.TRANSPORTATION_GASOLINE]: '주유비',
        [ExpenseSecondaryCategory.TRANSPORTATION_PARKING]: '주차비',
        [ExpenseSecondaryCategory.TRANSPORTATION_TOLLS]: '통행료',
        [ExpenseSecondaryCategory.TRANSPORTATION_VEHICLE_RENTAL]: '차량 렌탈',
        [ExpenseSecondaryCategory.TRANSPORTATION_FLIGHT]: '항공료',
        [ExpenseSecondaryCategory.TRANSPORTATION_OTHER]: '기타 교통비'
      }
    },
    [ExpensePrimaryCategory.SHOPPING]: {
      label: '쇼핑',
      icon: '🛍️',
      subcategories: {
        [ExpenseSecondaryCategory.SHOPPING_FASHION]: '패션',
        [ExpenseSecondaryCategory.SHOPPING_ELECTRONICS]: '전자제품',
        [ExpenseSecondaryCategory.SHOPPING_STATIONERY]: '문구',
        [ExpenseSecondaryCategory.SHOPPING_CONVENIENCE_STORE]: '편의점',
        [ExpenseSecondaryCategory.SHOPPING_ECOMMERCE]: '온라인 쇼핑',
        [ExpenseSecondaryCategory.SHOPPING_OTHER]: '기타 쇼핑'
      }
    },
    [ExpensePrimaryCategory.BEAUTY]: {
      label: '뷰티',
      icon: '💄',
      subcategories: {
        [ExpenseSecondaryCategory.BEAUTY_COSMETICS]: '화장품',
        [ExpenseSecondaryCategory.BEAUTY_HAIR]: '헤어',
        [ExpenseSecondaryCategory.BEAUTY_NAIL]: '네일',
        [ExpenseSecondaryCategory.BEAUTY_MASSAGE]: '마사지',
        [ExpenseSecondaryCategory.BEAUTY_OTHER]: '기타 뷰티'
      }
    },
    [ExpensePrimaryCategory.MEDICAL]: {
      label: '의료',
      icon: '⚕️',
      subcategories: {
        [ExpenseSecondaryCategory.MEDICAL_HOSPITAL]: '병원',
        [ExpenseSecondaryCategory.MEDICAL_PHARMACY]: '약국',
        [ExpenseSecondaryCategory.MEDICAL_PROCEDURE]: '의료시술',
        [ExpenseSecondaryCategory.MEDICAL_OTHER]: '기타 의료비'
      }
    },
    [ExpensePrimaryCategory.ENTERTAINMENT]: {
      label: '엔터테인먼트',
      icon: '🎬',
      subcategories: {
        [ExpenseSecondaryCategory.ENTERTAINMENT_MOVIE]: '영화',
        [ExpenseSecondaryCategory.ENTERTAINMENT_GAME]: '게임',
        [ExpenseSecondaryCategory.ENTERTAINMENT_SPORTS]: '스포츠',
        [ExpenseSecondaryCategory.ENTERTAINMENT_HOBBIES]: '취미',
        [ExpenseSecondaryCategory.ENTERTAINMENT_TRAVEL]: '여행',
        [ExpenseSecondaryCategory.ENTERTAINMENT_CULTURE_EVENTS]: '문화행사',
        [ExpenseSecondaryCategory.ENTERTAINMENT_OTHER]: '기타 엔터테인먼트'
      }
    },
    [ExpensePrimaryCategory.LIVING]: {
      label: '주거/생활',
      icon: '🏠',
      subcategories: {
        [ExpenseSecondaryCategory.LIVING_RENT]: '월세/전세',
        [ExpenseSecondaryCategory.LIVING_UTILITIES_ELECTRICITY]: '전기료',
        [ExpenseSecondaryCategory.LIVING_UTILITIES_GAS]: '가스료',
        [ExpenseSecondaryCategory.LIVING_UTILITIES_WATER]: '수도료',
        [ExpenseSecondaryCategory.LIVING_UTILITIES_INTERNET]: '인터넷',
        [ExpenseSecondaryCategory.LIVING_PHONE]: '통신비',
        [ExpenseSecondaryCategory.LIVING_HOUSEHOLD_ITEMS]: '생활용품',
        [ExpenseSecondaryCategory.LIVING_OTHER]: '기타 생활비'
      }
    },
    [ExpensePrimaryCategory.FINANCE]: {
      label: '금융',
      icon: '💰',
      subcategories: {
        [ExpenseSecondaryCategory.FINANCE_TRANSFER]: '이체',
        [ExpenseSecondaryCategory.FINANCE_INVESTMENT]: '투자',
        [ExpenseSecondaryCategory.FINANCE_LOAN_PAYMENT]: '대출상환',
        [ExpenseSecondaryCategory.FINANCE_SAVINGS]: '적금',
        [ExpenseSecondaryCategory.FINANCE_FEES]: '금융수수료',
        [ExpenseSecondaryCategory.FINANCE_OTHER]: '기타 금융'
      }
    },
    [ExpensePrimaryCategory.EDUCATION]: {
      label: '교육',
      icon: '📚',
      subcategories: {
        [ExpenseSecondaryCategory.EDUCATION_TUTORING]: '과외',
        [ExpenseSecondaryCategory.EDUCATION_TUITION]: '등록금',
        [ExpenseSecondaryCategory.EDUCATION_BOOKS]: '책/교재',
        [ExpenseSecondaryCategory.EDUCATION_SUPPLIES]: '학용품',
        [ExpenseSecondaryCategory.EDUCATION_ONLINE]: '온라인강의',
        [ExpenseSecondaryCategory.EDUCATION_CERTIFICATION]: '자격증',
        [ExpenseSecondaryCategory.EDUCATION_OTHER]: '기타 교육비'

      }
    },
    [ExpensePrimaryCategory.SOCIAL]: {
      label: '사회생활',
      icon: '👥',
      subcategories: {
        [ExpenseSecondaryCategory.SOCIAL_GIFT]: '선물',
        [ExpenseSecondaryCategory.SOCIAL_DONATION]: '기부',
        [ExpenseSecondaryCategory.SOCIAL_MEETING]: '모임',
        [ExpenseSecondaryCategory.SOCIAL_EVENTS]: '경조사',
        [ExpenseSecondaryCategory.SOCIAL_OTHER]: '기타 사회생활'
      }
    },
    [ExpensePrimaryCategory.PETS]: {
      label: '반려동물',
      icon: '🐾',
      subcategories: {
        [ExpenseSecondaryCategory.PETS_FOOD]: '사료',
        [ExpenseSecondaryCategory.PETS_VETERINARY]: '동물병원',
        [ExpenseSecondaryCategory.PETS_SUPPLIES]: '용품',
        [ExpenseSecondaryCategory.PETS_CARE]: '케어',
        [ExpenseSecondaryCategory.PETS_OTHER]: '기타 반려동물'
      }
    },
    [ExpensePrimaryCategory.FIXED]: {
      label: '고정비',
      icon: '📋',
      subcategories: {
        [ExpenseSecondaryCategory.FIXED_RENT]: '월세',
        [ExpenseSecondaryCategory.FIXED_INSURANCE]: '보험료',
        [ExpenseSecondaryCategory.FIXED_SUBSCRIPTION]: '정기구독',
        [ExpenseSecondaryCategory.FIXED_OTHER]: '기타 고정비'
      }
    },
    [ExpensePrimaryCategory.OTHER_EXPENSE]: {
      label: '기타 지출',
      icon: '🆕',
      subcategories: {
        [ExpenseSecondaryCategory.OTHER_EXPENSE]: '기타 지출'
      }
    }
  },
  income: {
    [IncomePrimaryCategory.SALARY]: {
      label: '급여',
      icon: '💼',
      subcategories: {
        [IncomeSecondaryCategory.SALARY_BASE]: '기본급',
        [IncomeSecondaryCategory.SALARY_BONUS]: '보너스',
        [IncomeSecondaryCategory.SALARY_OVERTIME]: '초과/야근/주휴수당',
        [IncomeSecondaryCategory.SALARY_OTHER]: '기타 급여'
      }
    },
    [IncomePrimaryCategory.ALLOWANCE]: {
      label: '용돈',
      icon: '💰',
      subcategories: {
        [IncomeSecondaryCategory.ALLOWANCE]: '용돈'
      }
    },
    [IncomePrimaryCategory.BUSINESS]: {
      label: '사업/부업',
      icon: '🏢',
      subcategories: {
        [IncomeSecondaryCategory.BUSINESS_INCOME]: '사업소득',
        [IncomeSecondaryCategory.BUSINESS_FREELANCE]: '프리랜서',
        [IncomeSecondaryCategory.BUSINESS_SIDE_HUSTLE]: '부업',
        [IncomeSecondaryCategory.BUSINESS_OTHER]: '기타 사업/부업 소득'
      }
    },
    [IncomePrimaryCategory.INVESTMENT]: {
      label: '투자',
      icon: '📈',
      subcategories: {
        [IncomeSecondaryCategory.INVESTMENT_DIVIDEND]: '배당금',
        [IncomeSecondaryCategory.INVESTMENT_INTEREST]: '이자',
        [IncomeSecondaryCategory.INVESTMENT_CAPITAL_GAIN]: '매매차익',
        [IncomeSecondaryCategory.INVESTMENT_RENTAL_INCOME]: '임대소득',
        [IncomeSecondaryCategory.INVESTMENT_OTHER]: '기타 투자 소득'
      }
    },
    [IncomePrimaryCategory.OTHER_INCOME]: {
      label: '기타 수입',
      icon: '💸',
      subcategories: {
        [IncomeSecondaryCategory.OTHER_INCOME_GIFT_RECEIVED]: '선물받음',
        [IncomeSecondaryCategory.OTHER_INCOME_REFUND]: '환불',
        [IncomeSecondaryCategory.OTHER_INCOME_PENSION]: '연금',
        [IncomeSecondaryCategory.OTHER_INCOME_FINANCE_TRANSFER]: '금융이체',
        [IncomeSecondaryCategory.OTHER_INCOME]: '기타 수입'
      }
    }
  }
} as const;

// 유틸리티 함수들
export const getTransactionTypeLabel = (type: TransactionType): string => {
  switch (type) {
    case 'income': return '수입';
    case 'expense': return '지출';
    default: return '알 수 없음';
  }
};

export const getPrimaryCategoryLabel = (type: TransactionType, category: string): string => {
  if (type === 'expense') {
    return CategoryHierarchy.expense[category as ExpensePrimaryCategory]?.label || category;
  } else if (type === 'income') {
    return CategoryHierarchy.income[category as IncomePrimaryCategory]?.label || category;
  }
  return category;
};

export const getCategoryLabel = (category: TransactionCategory): string => {
  // 지출 카테고리 검색
  for (const primaryCategory of Object.keys(CategoryHierarchy.expense)) {
    const primaryData = CategoryHierarchy.expense[primaryCategory as ExpensePrimaryCategory];
    if (primaryData && category in primaryData.subcategories) {
      return (primaryData.subcategories as Record<string, string>)[category];
    }
  }
  
  // 수입 카테고리 검색
  for (const primaryCategory of Object.keys(CategoryHierarchy.income)) {
    const primaryData = CategoryHierarchy.income[primaryCategory as IncomePrimaryCategory];
    if (primaryData && category in primaryData.subcategories) {
      return (primaryData.subcategories as Record<string, string>)[category];
    }
  }
  
  return category;
};

export const getCategoryIcon = (category: TransactionCategory): string => {
  // 지출 카테고리 검색
  for (const primaryCategory of Object.keys(CategoryHierarchy.expense)) {
    const subcategories = CategoryHierarchy.expense[primaryCategory as ExpensePrimaryCategory].subcategories;
    if (category in subcategories) {
      return CategoryHierarchy.expense[primaryCategory as ExpensePrimaryCategory].icon;
    }
  }
  
  // 수입 카테고리 검색
  for (const primaryCategory of Object.keys(CategoryHierarchy.income)) {
    const subcategories = CategoryHierarchy.income[primaryCategory as IncomePrimaryCategory].subcategories;
    if (category in subcategories) {
      return CategoryHierarchy.income[primaryCategory as IncomePrimaryCategory].icon;
    }
  }
  
  return '📋';
};

export const getSubcategoriesByPrimary = (type: TransactionType, primaryCategory: string) => {
  if (type === 'expense') {
    return CategoryHierarchy.expense[primaryCategory as ExpensePrimaryCategory]?.subcategories || {};
  } else if (type === 'income') {
    return CategoryHierarchy.income[primaryCategory as IncomePrimaryCategory]?.subcategories || {};
  }
  return {};
};

// 기존 데이터 호환성을 위한 함수들
export const getPrimaryCategories = (type: TransactionType) => {
  if (type === 'expense') {
    return Object.keys(CategoryHierarchy.expense);
  } else if (type === 'income') {
    return Object.keys(CategoryHierarchy.income);
  }
  return [];
};

// 추가 타입 정의들
export type AnalysisPeriod = 'week' | 'month' | 'year' | 'all' | 'custom';

export interface DateRange {
  start: string;
  end: string;
}

export interface PeriodOption {
  id: AnalysisPeriod;
  label: string;
  value: AnalysisPeriod;
}

export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'yearly';

// Transaction 관련 타입 정의
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

export interface AppState {
  transactions: Transaction[];
  budgets: CategoryBudget[];
  recurringTemplates: RecurringTemplate[];
  darkMode: boolean;
  currency: Currency;
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp: number;
}

// 반복 거래 관련 타입들 (중복 제거됨)

export interface RecurringTemplate {
  id: string;
  name: string;
  description: string;
  amount: number;
  category: TransactionCategory;
  type: TransactionType;
  recurrenceType: RecurrenceType;
  recurrenceDay?: number;
  isActive: boolean;
  nextDueDate: string;
  lastExecuted?: string;
  autoExecute: boolean;
  notificationEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// 앱 상태 관련 타입들
export interface AppState {
  transactions: Transaction[];
  budgets: CategoryBudget[];
  recurringTemplates: RecurringTemplate[];
  darkMode: boolean;
  currency: Currency;
}

// 분석 관련 타입들 (중복 제거됨)

export interface PeriodOption {
  id: AnalysisPeriod;
  label: string;
  value: AnalysisPeriod;
}

// 하위호환성을 위한 기존 카테고리 매핑
export const LegacyCategoryMapping: Record<string, TransactionCategory> = {
  'restaurant_fast_food': ExpenseSecondaryCategory.FOOD_RESTAURANT,
  'cafe_coffee': ExpenseSecondaryCategory.FOOD_CAFE_COFFEE,
  'transportation': ExpenseSecondaryCategory.TRANSPORTATION_BUS_SUBWAY,
  'shopping': ExpenseSecondaryCategory.SHOPPING_ECOMMERCE,
  'medical': ExpenseSecondaryCategory.MEDICAL_HOSPITAL,
  'entertainment': ExpenseSecondaryCategory.ENTERTAINMENT_MOVIE,
  'education': ExpenseSecondaryCategory.EDUCATION_BOOKS,
  'salary': IncomeSecondaryCategory.SALARY_BASE,
};

// 기본 카테고리 반환 함수 (하위호환성)
export const getDefaultCategory = (): TransactionCategory => {
  return ExpenseSecondaryCategory.FOOD_RESTAURANT;
};
