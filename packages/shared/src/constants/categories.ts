/**
 * 거래 카테고리 상수 정의
 */

// 기본 거래 타입
export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
  TRANSFER: 'transfer',
} as const;

// 수입 카테고리
export const INCOME_CATEGORIES = {
  SALARY: 'salary',
  FREELANCE: 'freelance',
  BUSINESS: 'business',
  INVESTMENT: 'investment',
  RENTAL: 'rental',
  BONUS: 'bonus',
  GIFT: 'gift',
  REFUND: 'refund',
  OTHER_INCOME: 'other_income',
} as const;

// 지출 카테고리
export const EXPENSE_CATEGORIES = {
  // 생활비
  FOOD: 'food',
  GROCERIES: 'groceries',
  RESTAURANT: 'restaurant',
  COFFEE: 'coffee',
  
  // 교통
  TRANSPORT: 'transport',
  PUBLIC_TRANSPORT: 'public_transport',
  TAXI: 'taxi',
  FUEL: 'fuel',
  PARKING: 'parking',
  
  // 주거
  HOUSING: 'housing',
  RENT: 'rent',
  UTILITIES: 'utilities',
  INTERNET: 'internet',
  PHONE: 'phone',
  
  // 쇼핑
  SHOPPING: 'shopping',
  CLOTHING: 'clothing',
  ELECTRONICS: 'electronics',
  BOOKS: 'books',
  
  // 건강
  HEALTHCARE: 'healthcare',
  MEDICAL: 'medical',
  PHARMACY: 'pharmacy',
  FITNESS: 'fitness',
  
  // 엔터테인먼트
  ENTERTAINMENT: 'entertainment',
  MOVIES: 'movies',
  GAMES: 'games',
  SUBSCRIPTION: 'subscription',
  
  // 교육
  EDUCATION: 'education',
  COURSES: 'courses',
  
  // 금융
  INSURANCE: 'insurance',
  BANK_FEES: 'bank_fees',
  LOAN_PAYMENT: 'loan_payment',
  
  // 기타
  PETS: 'pets',
  CHARITY: 'charity',
  GIFTS: 'gifts',
  OTHER_EXPENSE: 'other_expense',
} as const;

// 모든 카테고리 통합
export const ALL_CATEGORIES = {
  ...INCOME_CATEGORIES,
  ...EXPENSE_CATEGORIES,
} as const;

// 카테고리별 메타데이터
export const CATEGORY_METADATA = {
  // 수입 카테고리 메타데이터
  [INCOME_CATEGORIES.SALARY]: {
    name: '급여',
    icon: '💰',
    color: '#10B981',
    description: '정규 급여 및 월급',
  },
  [INCOME_CATEGORIES.FREELANCE]: {
    name: '프리랜싱',
    icon: '💼',
    color: '#059669',
    description: '프리랜서 수입',
  },
  [INCOME_CATEGORIES.BUSINESS]: {
    name: '사업소득',
    icon: '🏢',
    color: '#047857',
    description: '사업 관련 수입',
  },
  [INCOME_CATEGORIES.INVESTMENT]: {
    name: '투자수익',
    icon: '📈',
    color: '#065F46',
    description: '주식, 펀드, 배당금 등',
  },
  [INCOME_CATEGORIES.RENTAL]: {
    name: '임대수입',
    icon: '🏠',
    color: '#064E3B',
    description: '부동산 임대 수입',
  },
  [INCOME_CATEGORIES.BONUS]: {
    name: '보너스',
    icon: '🎁',
    color: '#10B981',
    description: '성과급, 상여금',
  },
  [INCOME_CATEGORIES.GIFT]: {
    name: '선물/용돈',
    icon: '💝',
    color: '#34D399',
    description: '받은 선물이나 용돈',
  },
  [INCOME_CATEGORIES.REFUND]: {
    name: '환불',
    icon: '↩️',
    color: '#6EE7B7',
    description: '환불 받은 금액',
  },
  [INCOME_CATEGORIES.OTHER_INCOME]: {
    name: '기타 수입',
    icon: '💡',
    color: '#A7F3D0',
    description: '기타 수입',
  },

  // 지출 카테고리 메타데이터
  [EXPENSE_CATEGORIES.FOOD]: {
    name: '식비',
    icon: '🍽️',
    color: '#EF4444',
    description: '음식 관련 지출',
  },
  [EXPENSE_CATEGORIES.GROCERIES]: {
    name: '장보기',
    icon: '🛒',
    color: '#DC2626',
    description: '식료품 구매',
  },
  [EXPENSE_CATEGORIES.RESTAURANT]: {
    name: '외식',
    icon: '🍽️',
    color: '#B91C1C',
    description: '레스토랑, 카페 등',
  },
  [EXPENSE_CATEGORIES.COFFEE]: {
    name: '커피',
    icon: '☕',
    color: '#991B1B',
    description: '커피, 음료',
  },
  
  [EXPENSE_CATEGORIES.TRANSPORT]: {
    name: '교통비',
    icon: '🚗',
    color: '#F59E0B',
    description: '교통 관련 지출',
  },
  [EXPENSE_CATEGORIES.PUBLIC_TRANSPORT]: {
    name: '대중교통',
    icon: '🚇',
    color: '#D97706',
    description: '지하철, 버스 등',
  },
  [EXPENSE_CATEGORIES.TAXI]: {
    name: '택시',
    icon: '🚕',
    color: '#B45309',
    description: '택시, 우버 등',
  },
  [EXPENSE_CATEGORIES.FUEL]: {
    name: '주유비',
    icon: '⛽',
    color: '#92400E',
    description: '자동차 연료비',
  },
  [EXPENSE_CATEGORIES.PARKING]: {
    name: '주차비',
    icon: '🅿️',
    color: '#78350F',
    description: '주차 요금',
  },
  
  [EXPENSE_CATEGORIES.HOUSING]: {
    name: '주거비',
    icon: '🏠',
    color: '#3B82F6',
    description: '주거 관련 지출',
  },
  [EXPENSE_CATEGORIES.RENT]: {
    name: '월세',
    icon: '🏘️',
    color: '#2563EB',
    description: '임대료',
  },
  [EXPENSE_CATEGORIES.UTILITIES]: {
    name: '공과금',
    icon: '💡',
    color: '#1D4ED8',
    description: '전기, 가스, 수도',
  },
  [EXPENSE_CATEGORIES.INTERNET]: {
    name: '인터넷',
    icon: '🌐',
    color: '#1E40AF',
    description: '인터넷 요금',
  },
  [EXPENSE_CATEGORIES.PHONE]: {
    name: '통신비',
    icon: '📱',
    color: '#1E3A8A',
    description: '휴대폰, 전화 요금',
  },
  
  [EXPENSE_CATEGORIES.SHOPPING]: {
    name: '쇼핑',
    icon: '🛍️',
    color: '#8B5CF6',
    description: '쇼핑 지출',
  },
  [EXPENSE_CATEGORIES.CLOTHING]: {
    name: '의류',
    icon: '👕',
    color: '#7C3AED',
    description: '옷, 신발, 액세서리',
  },
  [EXPENSE_CATEGORIES.ELECTRONICS]: {
    name: '전자제품',
    icon: '📱',
    color: '#6D28D9',
    description: '전자기기, 가전제품',
  },
  [EXPENSE_CATEGORIES.BOOKS]: {
    name: '도서',
    icon: '📚',
    color: '#5B21B6',
    description: '책, 잡지',
  },
  
  [EXPENSE_CATEGORIES.HEALTHCARE]: {
    name: '의료비',
    icon: '🏥',
    color: '#EC4899',
    description: '의료 관련 지출',
  },
  [EXPENSE_CATEGORIES.MEDICAL]: {
    name: '병원비',
    icon: '👨‍⚕️',
    color: '#DB2777',
    description: '병원, 치료비',
  },
  [EXPENSE_CATEGORIES.PHARMACY]: {
    name: '약국',
    icon: '💊',
    color: '#BE185D',
    description: '약품, 건강용품',
  },
  [EXPENSE_CATEGORIES.FITNESS]: {
    name: '헬스/운동',
    icon: '💪',
    color: '#9D174D',
    description: '헬스장, 운동용품',
  },
  
  [EXPENSE_CATEGORIES.ENTERTAINMENT]: {
    name: '엔터테인먼트',
    icon: '🎬',
    color: '#06B6D4',
    description: '오락, 여가활동',
  },
  [EXPENSE_CATEGORIES.MOVIES]: {
    name: '영화',
    icon: '🎭',
    color: '#0891B2',
    description: '영화, 공연',
  },
  [EXPENSE_CATEGORIES.GAMES]: {
    name: '게임',
    icon: '🎮',
    color: '#0E7490',
    description: '게임, 취미',
  },
  [EXPENSE_CATEGORIES.SUBSCRIPTION]: {
    name: '구독',
    icon: '📺',
    color: '#155E75',
    description: 'Netflix, Spotify 등',
  },
  
  [EXPENSE_CATEGORIES.EDUCATION]: {
    name: '교육비',
    icon: '📖',
    color: '#84CC16',
    description: '교육 관련 지출',
  },
  [EXPENSE_CATEGORIES.COURSES]: {
    name: '강의/수업',
    icon: '🎓',
    color: '#65A30D',
    description: '온라인 강의, 학원',
  },
  
  [EXPENSE_CATEGORIES.INSURANCE]: {
    name: '보험',
    icon: '🛡️',
    color: '#6B7280',
    description: '보험료',
  },
  [EXPENSE_CATEGORIES.BANK_FEES]: {
    name: '은행수수료',
    icon: '🏦',
    color: '#4B5563',
    description: '계좌 관리비, 수수료',
  },
  [EXPENSE_CATEGORIES.LOAN_PAYMENT]: {
    name: '대출상환',
    icon: '💳',
    color: '#374151',
    description: '대출 원금, 이자',
  },
  
  [EXPENSE_CATEGORIES.PETS]: {
    name: '반려동물',
    icon: '🐕',
    color: '#F97316',
    description: '펫샵, 동물병원',
  },
  [EXPENSE_CATEGORIES.CHARITY]: {
    name: '기부/후원',
    icon: '❤️',
    color: '#EF4444',
    description: '기부금, 후원금',
  },
  [EXPENSE_CATEGORIES.GIFTS]: {
    name: '선물',
    icon: '🎁',
    color: '#EC4899',
    description: '선물 구매',
  },
  [EXPENSE_CATEGORIES.OTHER_EXPENSE]: {
    name: '기타 지출',
    icon: '💸',
    color: '#6B7280',
    description: '기타 지출',
  },
} as const;

// 카테고리 그룹 정의
export const CATEGORY_GROUPS = {
  INCOME: {
    name: '수입',
    categories: Object.values(INCOME_CATEGORIES),
    color: '#10B981',
    icon: '💰',
  },
  EXPENSE: {
    name: '지출',
    categories: Object.values(EXPENSE_CATEGORIES),
    color: '#EF4444',
    icon: '💸',
  },
} as const;

// 지출 카테고리를 용도별로 그룹화
export const EXPENSE_CATEGORY_GROUPS = {
  LIVING: {
    name: '생활비',
    categories: [
      EXPENSE_CATEGORIES.FOOD,
      EXPENSE_CATEGORIES.GROCERIES,
      EXPENSE_CATEGORIES.RESTAURANT,
      EXPENSE_CATEGORIES.COFFEE,
    ],
    color: '#EF4444',
    icon: '🍽️',
  },
  TRANSPORT: {
    name: '교통비',
    categories: [
      EXPENSE_CATEGORIES.TRANSPORT,
      EXPENSE_CATEGORIES.PUBLIC_TRANSPORT,
      EXPENSE_CATEGORIES.TAXI,
      EXPENSE_CATEGORIES.FUEL,
      EXPENSE_CATEGORIES.PARKING,
    ],
    color: '#F59E0B',
    icon: '🚗',
  },
  HOUSING: {
    name: '주거비',
    categories: [
      EXPENSE_CATEGORIES.HOUSING,
      EXPENSE_CATEGORIES.RENT,
      EXPENSE_CATEGORIES.UTILITIES,
      EXPENSE_CATEGORIES.INTERNET,
      EXPENSE_CATEGORIES.PHONE,
    ],
    color: '#3B82F6',
    icon: '🏠',
  },
  SHOPPING: {
    name: '쇼핑',
    categories: [
      EXPENSE_CATEGORIES.SHOPPING,
      EXPENSE_CATEGORIES.CLOTHING,
      EXPENSE_CATEGORIES.ELECTRONICS,
      EXPENSE_CATEGORIES.BOOKS,
    ],
    color: '#8B5CF6',
    icon: '🛍️',
  },
  HEALTH: {
    name: '건강/의료',
    categories: [
      EXPENSE_CATEGORIES.HEALTHCARE,
      EXPENSE_CATEGORIES.MEDICAL,
      EXPENSE_CATEGORIES.PHARMACY,
      EXPENSE_CATEGORIES.FITNESS,
    ],
    color: '#EC4899',
    icon: '🏥',
  },
  ENTERTAINMENT: {
    name: '엔터테인먼트',
    categories: [
      EXPENSE_CATEGORIES.ENTERTAINMENT,
      EXPENSE_CATEGORIES.MOVIES,
      EXPENSE_CATEGORIES.GAMES,
      EXPENSE_CATEGORIES.SUBSCRIPTION,
    ],
    color: '#06B6D4',
    icon: '🎬',
  },
  EDUCATION: {
    name: '교육',
    categories: [
      EXPENSE_CATEGORIES.EDUCATION,
      EXPENSE_CATEGORIES.COURSES,
    ],
    color: '#84CC16',
    icon: '📖',
  },
  FINANCIAL: {
    name: '금융',
    categories: [
      EXPENSE_CATEGORIES.INSURANCE,
      EXPENSE_CATEGORIES.BANK_FEES,
      EXPENSE_CATEGORIES.LOAN_PAYMENT,
    ],
    color: '#6B7280',
    icon: '💳',
  },
  OTHER: {
    name: '기타',
    categories: [
      EXPENSE_CATEGORIES.PETS,
      EXPENSE_CATEGORIES.CHARITY,
      EXPENSE_CATEGORIES.GIFTS,
      EXPENSE_CATEGORIES.OTHER_EXPENSE,
    ],
    color: '#9CA3AF',
    icon: '📦',
  },
} as const;

// 타입 정의
export type TransactionType = typeof TRANSACTION_TYPES[keyof typeof TRANSACTION_TYPES];
export type IncomeCategory = typeof INCOME_CATEGORIES[keyof typeof INCOME_CATEGORIES];
export type ExpenseCategory = typeof EXPENSE_CATEGORIES[keyof typeof EXPENSE_CATEGORIES];
export type Category = IncomeCategory | ExpenseCategory;

export type CategoryMetadata = {
  name: string;
  icon: string;
  color: string;
  description: string;
};

export type CategoryGroup = {
  name: string;
  categories: readonly string[];
  color: string;
  icon: string;
};
