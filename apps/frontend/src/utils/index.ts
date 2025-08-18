import type { TransactionCategory, Transaction, Currency } from '../types';
import { getCategoryLabel, getCategoryIcon } from '../types';

// getCategoryName은 getCategoryLabel의 별칭
export const getCategoryName = getCategoryLabel;

// getCategoryIcon을 다시 export
export { getCategoryIcon };

// 공통 유틸리티 함수들
export const formatCurrency = (amount: number, currency: Currency = 'KRW'): string => {
  const currencyMap = {
    'KRW': { code: 'KRW', locale: 'ko-KR' },
    'USD': { code: 'USD', locale: 'en-US' },
    'EUR': { code: 'EUR', locale: 'de-DE' },
    'JPY': { code: 'JPY', locale: 'ja-JP' },
    'GBP': { code: 'GBP', locale: 'en-GB' },
    'CNY': { code: 'CNY', locale: 'zh-CN' }
  };

  const { code, locale } = currencyMap[currency];
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: code
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('ko-KR');
};

export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString('ko-KR');
};

export const calculatePercentage = (value: number, total: number): number => {
  return total > 0 ? (value / total) * 100 : 0;
};

export const formatPercentage = (value: number, total: number): string => {
  return `${calculatePercentage(value, total).toFixed(1)}%`;
};

// 카테고리 관련 유틸리티 함수들
export const getCategoryDisplayInfo = (category: TransactionCategory) => {
  // 기본 카테고리 정보 매핑
  const defaultCategories: Record<string, { name: string; icon: string; color: string }> = {
    // 지출 카테고리
    'restaurant_fast_food': { name: '패스트푸드', icon: '🍔', color: '#ef4444' },
    'cafe_coffee': { name: '커피', icon: '☕', color: '#8b5cf6' },
    'bus_subway': { name: '버스/지하철', icon: '🚇', color: '#3b82f6' },
    'taxi': { name: '택시', icon: '🚕', color: '#06b6d4' },
    'fashion_clothing': { name: '의류', icon: '👕', color: '#ec4899' },
    'electronics_mobile': { name: '모바일/폰', icon: '📱', color: '#6366f1' },
    'beauty_cosmetics': { name: '화장품', icon: '💄', color: '#f59e0b' },
    'hospital': { name: '병원', icon: '🏥', color: '#10b981' },
    'movie': { name: '영화', icon: '🎬', color: '#8b5cf6' },
    'rent': { name: '월세/전세', icon: '🏠', color: '#84cc16' },
    
    // 수입 카테고리
    'base_salary': { name: '기본급', icon: '💼', color: '#059669' },
    'bonus': { name: '보너스', icon: '🎁', color: '#0891b2' }
  };

  const info = defaultCategories[category];
  return info || { name: category, icon: '📋', color: '#6b7280' };
};

// 거래 필터링 함수들
export const filterTransactionsByCategory = (transactions: Transaction[], category: TransactionCategory): Transaction[] => {
  return transactions.filter(transaction => transaction.category === category);
};

export const filterTransactionsByDateRange = (
  transactions: Transaction[], 
  startDate: string, 
  endDate: string
): Transaction[] => {
  return transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return transactionDate >= start && transactionDate <= end;
  });
};

export const filterTransactionsByType = (transactions: Transaction[], type: 'income' | 'expense'): Transaction[] => {
  return transactions.filter(transaction => transaction.type === type);
};

// 통계 계산 함수들
export const calculateTotalAmount = (transactions: Transaction[]): number => {
  return transactions.reduce((total, transaction) => total + transaction.amount, 0);
};

export const calculateMonthlySpending = (transactions: Transaction[], year: number, month: number): number => {
  const monthlyTransactions = transactions.filter(transaction => {
    const date = new Date(transaction.date);
    return date.getFullYear() === year && 
           date.getMonth() === month - 1 && 
           transaction.type === 'expense';
  });
  
  return calculateTotalAmount(monthlyTransactions);
};

export const calculateCategorySpending = (
  transactions: Transaction[], 
  category: TransactionCategory
): number => {
  const categoryTransactions = filterTransactionsByCategory(transactions, category);
  const expenseTransactions = filterTransactionsByType(categoryTransactions, 'expense');
  return calculateTotalAmount(expenseTransactions);
};

// 예산 상태 계산 함수
export const getBudgetStatus = (
  spent: number, 
  limit: number, 
  warningThreshold: number
): 'safe' | 'warning' | 'danger' => {
  const percentage = (spent / limit) * 100;
  
  if (percentage >= 100) {
    return 'danger';
  } else if (percentage >= warningThreshold) {
    return 'warning';
  } else {
    return 'safe';
  }
};

// 날짜 관련 유틸리티
export const getCurrentMonth = (): { year: number; month: number } => {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1
  };
};

export const getMonthName = (month: number): string => {
  const months = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];
  return months[month - 1] || `${month}월`;
};

export const getMonthRange = (year: number, month: number): { start: string; end: string } => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  };
};

// 검색 및 정렬 함수들
export const searchTransactions = (transactions: Transaction[], query: string): Transaction[] => {
  const lowercaseQuery = query.toLowerCase();
  return transactions.filter(transaction => 
    transaction.description.toLowerCase().includes(lowercaseQuery) ||
    getCategoryDisplayInfo(transaction.category).name.toLowerCase().includes(lowercaseQuery)
  );
};

export const sortTransactionsByDate = (transactions: Transaction[], order: 'asc' | 'desc' = 'desc'): Transaction[] => {
  return [...transactions].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return order === 'desc' ? dateB - dateA : dateA - dateB;
  });
};

export const sortTransactionsByAmount = (transactions: Transaction[], order: 'asc' | 'desc' = 'desc'): Transaction[] => {
  return [...transactions].sort((a, b) => {
    return order === 'desc' ? b.amount - a.amount : a.amount - b.amount;
  });
};

// ID 생성 함수
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// 검증 함수들
export const isValidAmount = (amount: number): boolean => {
  return !isNaN(amount) && amount > 0 && isFinite(amount);
};

export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

export const isValidCategory = (category: string): boolean => {
  // 간단한 카테고리 유효성 검사
  return typeof category === 'string' && category.length > 0;
};

// 데이터 변환 함수들
export const groupTransactionsByCategory = (transactions: Transaction[]): Record<string, Transaction[]> => {
  return transactions.reduce((groups, transaction) => {
    const category = transaction.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(transaction);
    return groups;
  }, {} as Record<string, Transaction[]>);
};

export const groupTransactionsByMonth = (transactions: Transaction[]): Record<string, Transaction[]> => {
  return transactions.reduce((groups, transaction) => {
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    groups[monthKey].push(transaction);
    return groups;
  }, {} as Record<string, Transaction[]>);
};

// 문자열 유틸리티
export const truncateText = (text: string, maxLength: number = 50): string => {
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

// 색상 유틸리티
export const getRandomColor = (): string => {
  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const lightenColor = (color: string, amount: number = 0.3): string => {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const amt = Math.round(2.55 * amount * 100);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
};
