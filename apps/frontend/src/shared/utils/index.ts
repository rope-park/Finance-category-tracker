/**
 * Frontend 전용 유틸리티 함수 모음
 * 
 * - packages/shared에서 공통 유틸리티들을 import
 * - Frontend 전용 유틸리티만 여기에 정의
 * 
 * @author Ju Eul Park (rope-park)
 */

// 공통 유틸리티들을 packages/shared에서 import
import {
  formatCurrency,
  formatNumber,
  isValidCurrency,
  convertCurrency,
  debounce,
  throttle,
  deepClone,
  formatDate,
  formatDateTime,
  getCategoryName,
  getCategoryIcon,
  getCategoryColor,
} from '@finance-tracker/shared';

import type { Category, Transaction } from '@finance-tracker/shared';

// 공통 유틸리티들 재export
export {
  formatCurrency,
  formatNumber,
  isValidCurrency,
  convertCurrency,
  debounce,
  throttle,
  deepClone,
  formatDate,
  formatDateTime,
  getCategoryName,
  getCategoryIcon,
  getCategoryColor
};

/**
 * 카테고리별 거래 필터링 함수
 * @param transactions - 거래 배열
 * @param category - 카테고리
 * @returns 필터링된 거래 배열
 */
export const filterTransactionsByCategory = (transactions: Transaction[], category: Category): Transaction[] => {
  return transactions.filter(transaction => transaction.category === category);
};

/**
 * 날짜 범위에 따른 거래 필터링 함수
 * @param transactions - 거래 배열
 * @param startDate - 시작일
 * @param endDate - 종료일
 * @returns 필터링된 거래 배열
 */
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

/** 거래 유형별 필터링 함수
 * @param transactions - 거래 배열
 * @param type - 'income' | 'expense'
 * @returns 필터링된 거래 배열
 */
export const filterTransactionsByType = (transactions: Transaction[], type: 'income' | 'expense'): Transaction[] => {
  return transactions.filter(transaction => transaction.transaction_type === type);
};

/**
 * 총 거래 금액 계산 함수
 * @param transactions - 거래 배열
 * @returns 총 금액
 */
export const calculateTotalAmount = (transactions: Transaction[]): number => {
  return transactions.reduce((total, transaction) => total + transaction.amount, 0);
};

/**
 * 월별 지출 계산 함수
 * @param transactions - 거래 배열
 * @param year - 연도
 * @param month - 월 (1~12)
 * @returns 총 지출 금액
 */
export const calculateMonthlySpending = (transactions: Transaction[], year: number, month: number): number => {
  const monthlyTransactions = transactions.filter(transaction => {
    const date = new Date(transaction.date);
    return date.getFullYear() === year && 
           date.getMonth() === month - 1 && 
           transaction.transaction_type === 'expense';
  });
  
  return calculateTotalAmount(monthlyTransactions);
};

/**
 * 카테고리별 지출 계산 함수
 * @param transactions - 거래 배열
 * @param category - 카테고리
 * @returns 총 지출 금액
 */
export const calculateCategorySpending = (
  transactions: Transaction[], 
  category: Category
): number => {
  const categoryTransactions = filterTransactionsByCategory(transactions, category);
  const expenseTransactions = filterTransactionsByType(categoryTransactions, 'expense');
  return calculateTotalAmount(expenseTransactions);
};

/**
 * 예산 상태 계산 함수
 * @param spent - 사용된 금액
 * @param limit - 예산 한도
 * @param warningThreshold - 경고 임계값 (백분율, 예: 80은 80%)
 * @returns 예산 상태 ('safe' | 'warning' | 'danger')
 */
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

/**
 * 현재 연도와 월을 반환하는 함수
 * @returns 현재 연도와 월
 */
export const getCurrentMonth = (): { year: number; month: number } => {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1
  };
};

/**
 * 월 이름을 반환하는 함수
 * @param month 1~12
 * @returns 월 이름 (예: '1월', '2월', ..., '12월')
 */
export const getMonthName = (month: number): string => {
  const months = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];
  return months[month - 1] || `${month}월`;
};

/**
 * 특정 연도와 월의 시작일과 종료일을 반환하는 함수
 * @param year - 연도 (예: 2025)
 * @param month - 월 (1~12)
 * @returns 시작일과 종료일 (YYYY-MM-DD 형식)
 */
export const getMonthRange = (year: number, month: number): { start: string; end: string } => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  };
};

/**
 * 거래 내역 검색 함수  
 * @param transactions - 거래 배열
 * @param query - 검색어
 * @returns - 검색 결과 배열
 */
export const searchTransactions = (transactions: Transaction[], query: string): Transaction[] => {
  const lowercaseQuery = query.toLowerCase();
  return transactions.filter(transaction => 
    (typeof transaction.description === 'string' && transaction.description.toLowerCase().includes(lowercaseQuery)) ||
    getCategoryName(transaction.category as Category).toLowerCase().includes(lowercaseQuery)
  );
};

/**
 * 거래 내역을 날짜별로 정렬하는 함수
 * @param transactions - 거래 배열
 * @param order - 정렬 순서 ('asc' | 'desc')
 * @returns - 정렬된 거래 배열
 */
export const sortTransactionsByDate = (transactions: Transaction[], order: 'asc' | 'desc' = 'desc'): Transaction[] => {
  return [...transactions].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return order === 'desc' ? dateB - dateA : dateA - dateB;
  });
};

/**
 * 거래 내역을 금액별로 정렬하는 함수
 * @param transactions - 거래 배열
 * @param order - 정렬 순서 ('asc' | 'desc')
 * @returns - 정렬된 거래 배열
 */
export const sortTransactionsByAmount = (transactions: Transaction[], order: 'asc' | 'desc' = 'desc'): Transaction[] => {
  return [...transactions].sort((a, b) => {
    return order === 'desc' ? b.amount - a.amount : a.amount - b.amount;
  });
};

/**
 * 고유 ID 생성 함수
 * @returns 고유 ID 문자열
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * 금액 유효성 검사 함수
 * @param amount - 금액
 * @returns - 유효성 검사 결과 (true/false)
 */
export const isValidAmount = (amount: number): boolean => {
  return !isNaN(amount) && amount > 0 && isFinite(amount);
};

/**
 * 날짜 유효성 검사 함수
 * @param dateString - 날짜 문자열 (예: '2025-08-01')
 * @returns - 유효성 검사 결과 (true/false)
 */
export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

/**
 * 카테고리 유효성 검사 함수
 * @param category - 카테고리
 * @returns - 유효성 검사 결과 (true/false)
 */
export const isValidCategory = (category: string): boolean => {
  return typeof category === 'string' && category.length > 0;
};

/**
 * 거래 내역을 카테고리별로 그룹화하는 함수
 * @param transactions - 거래 배열
 * @returns - 카테고리별 거래 그룹
 */
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

/**
 * 월별로 거래를 그룹화하는 함수
 * @param transactions - 거래 배열
 * @returns - 월별 거래 그룹 (키: 'YYYY-MM', 값: 거래 배열)
 */
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

/**
 * 텍스트를 잘라내는 함수
 * @param text - 텍스트
 * @param maxLength - 최대 길이
 * @returns - 잘린 텍스트
 */
export const truncateText = (text: string, maxLength: number = 50): string => {
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * 랜덤 색상 코드를 생성하는 함수
 * @returns 랜덤 색상 코드 (HEX)
 */
export const getRandomColor = (): string => {
  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * 색상을 밝게 하는 함수
 * @param color - HEX 색상 코드
 * @param amount - 밝게 할 정도 (0~1)
 * @returns - 밝게 처리된 HEX 색상 코드
 */
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
