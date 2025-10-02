import {
  Category,
  IncomeCategory,
  ExpenseCategory,
  TransactionType,
  TRANSACTION_TYPES,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  CATEGORY_METADATA,
  CATEGORY_GROUPS,
  EXPENSE_CATEGORY_GROUPS,
  CategoryMetadata,
  CategoryGroup,
} from './categories';

/**
 * 카테고리 관련 유틸리티 함수들
 */

/**
 * 카테고리가 수입 카테고리인지 확인
 */
export const isIncomeCategory = (category: Category): category is IncomeCategory => {
  return Object.values(INCOME_CATEGORIES).includes(category as IncomeCategory);
};

/**
 * 카테고리가 지출 카테고리인지 확인
 */
export const isExpenseCategory = (category: Category): category is ExpenseCategory => {
  return Object.values(EXPENSE_CATEGORIES).includes(category as ExpenseCategory);
};

/**
 * 카테고리의 거래 타입 반환
 */
export const getCategoryType = (category: Category): TransactionType => {
  if (isIncomeCategory(category)) {
    return TRANSACTION_TYPES.INCOME;
  }
  if (isExpenseCategory(category)) {
    return TRANSACTION_TYPES.EXPENSE;
  }
  throw new Error(`Unknown category: ${category}`);
};

/**
 * 카테고리 메타데이터 가져오기
 */
export const getCategoryMetadata = (category: Category): CategoryMetadata | undefined => {
  return CATEGORY_METADATA[category as keyof typeof CATEGORY_METADATA];
};

/**
 * 카테고리 이름 가져오기
 */
export const getCategoryName = (category: Category): string => {
  const metadata = getCategoryMetadata(category);
  return metadata?.name || category;
};

/**
 * 카테고리 아이콘 가져오기
 */
export const getCategoryIcon = (category: Category): string => {
  const metadata = getCategoryMetadata(category);
  return metadata?.icon || '💸';
};

/**
 * 카테고리 색상 가져오기
 */
export const getCategoryColor = (category: Category): string => {
  const metadata = getCategoryMetadata(category);
  return metadata?.color || '#6B7280';
};

/**
 * 유효한 카테고리인지 확인
 */
export const isValidCategory = (category: string): category is Category => {
  return (
    Object.values(INCOME_CATEGORIES).includes(category as IncomeCategory) ||
    Object.values(EXPENSE_CATEGORIES).includes(category as ExpenseCategory)
  );
};

/**
 * 거래 타입별 카테고리 목록 가져오기
 */
export const getCategoriesByType = (type: TransactionType): Category[] => {
  switch (type) {
    case TRANSACTION_TYPES.INCOME:
      return Object.values(INCOME_CATEGORIES);
    case TRANSACTION_TYPES.EXPENSE:
      return Object.values(EXPENSE_CATEGORIES);
    default:
      return [];
  }
};

/**
 * 카테고리 검색 (이름으로)
 */
export const searchCategories = (query: string, type?: TransactionType): Category[] => {
  const categories = type ? getCategoriesByType(type) : Object.values({ ...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES });
  
  if (!query.trim()) {
    return categories;
  }

  const lowercaseQuery = query.toLowerCase();
  
  return categories.filter(category => {
    const metadata = getCategoryMetadata(category);
    const name = metadata?.name.toLowerCase() || category.toLowerCase();
    const description = metadata?.description.toLowerCase() || '';
    
    return name.includes(lowercaseQuery) || description.includes(lowercaseQuery);
  });
};

/**
 * 지출 카테고리 그룹별로 분류
 */
export const getExpenseCategoriesByGroup = () => {
  return EXPENSE_CATEGORY_GROUPS;
};

/**
 * 특정 그룹의 카테고리들 가져오기
 */
export const getCategoriesByGroup = (groupKey: keyof typeof EXPENSE_CATEGORY_GROUPS): ExpenseCategory[] => {
  const group = EXPENSE_CATEGORY_GROUPS[groupKey];
  return group ? [...group.categories] as ExpenseCategory[] : [];
};

/**
 * 카테고리가 속한 그룹 찾기
 */
export const findCategoryGroup = (category: ExpenseCategory): keyof typeof EXPENSE_CATEGORY_GROUPS | null => {
  for (const [groupKey, group] of Object.entries(EXPENSE_CATEGORY_GROUPS)) {
    if ((group.categories as readonly ExpenseCategory[]).includes(category)) {
      return groupKey as keyof typeof EXPENSE_CATEGORY_GROUPS;
    }
  }
  return null;
};

/**
 * 카테고리 통계용 헬퍼
 */
export const getCategoryStats = (categories: Category[]) => {
  const incomeCount = categories.filter(isIncomeCategory).length;
  const expenseCount = categories.filter(isExpenseCategory).length;
  
  return {
    total: categories.length,
    income: incomeCount,
    expense: expenseCount,
  };
};

/**
 * 기본 카테고리 세트 (자주 사용되는 카테고리들)
 */
export const getDefaultCategories = () => ({
  income: [
    INCOME_CATEGORIES.SALARY,
    INCOME_CATEGORIES.FREELANCE,
    INCOME_CATEGORIES.INVESTMENT,
    INCOME_CATEGORIES.OTHER_INCOME,
  ],
  expense: [
    EXPENSE_CATEGORIES.FOOD,
    EXPENSE_CATEGORIES.TRANSPORT,
    EXPENSE_CATEGORIES.SHOPPING,
    EXPENSE_CATEGORIES.ENTERTAINMENT,
    EXPENSE_CATEGORIES.UTILITIES,
    EXPENSE_CATEGORIES.OTHER_EXPENSE,
  ],
});

/**
 * 카테고리 옵션 생성 (드롭다운 등에서 사용)
 */
export const getCategoryOptions = (type?: TransactionType) => {
  const categories = type ? getCategoriesByType(type) : Object.values({ ...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES });
  
  return categories.map(category => ({
    value: category,
    label: getCategoryName(category),
    icon: getCategoryIcon(category),
    color: getCategoryColor(category),
    type: getCategoryType(category),
  }));
};

/**
 * 그룹별 카테고리 옵션 생성
 */
export const getGroupedCategoryOptions = () => {
  return {
    income: {
      label: '수입',
      options: getCategoryOptions(TRANSACTION_TYPES.INCOME),
    },
    expense: {
      label: '지출',
      options: getCategoryOptions(TRANSACTION_TYPES.EXPENSE),
    },
  };
};