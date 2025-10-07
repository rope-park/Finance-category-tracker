/**
 * 데이터 내보내기 유틸리티 (Frontend 전용)
 * 
 * 주요 기능:
 * - 거래 내역을 CSV 형식으로 내보내기
 * - Excel 호환 CSV 생성 (UTF-8 BOM 포함)
 * - 날짜, 카테고리, 타입별 필터링 지원
 * - 월별/연도별 요약 리포트 생성
 * - 브라우저 다운로드 기능
 * 
 * 브라우저 전용 API를 사용하므로 서버 사이드에서는 사용 불가.
 * packages/shared의 getCategoryName 함수를 활용하여 카테고리 정보 처리.
 * 
 * @author Ju Eul Park (rope-park)
 */

import type { Transaction } from '../types';
import { getCategoryName } from '@finance-tracker/shared';

// 내보내기 옵션 인터페이스
export interface ExportOptions {
  dateRange?: {
    start: Date;
    end: Date;
  };
  categories?: string[];
  type?: 'all' | 'income' | 'expense';
}

/**
 * 거래 내역을 CSV 파일로 내보내기
 * @param transactions - 거래 내역 배열
 * @param options  - 내보내기 옵션 (날짜 범위, 카테고리, 타입)
 * @returns  CSV 문자열
 */
export const exportToCSV = (transactions: Transaction[], options: ExportOptions = {}) => {
  // 필터링
  let filteredTransactions = [...transactions];

  // 날짜 범위 필터
  if (options.dateRange) {
    filteredTransactions = filteredTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= options.dateRange!.start && transactionDate <= options.dateRange!.end;
    });
  }

  // 카테고리 필터
  if (options.categories && options.categories.length > 0) {
    filteredTransactions = filteredTransactions.filter(t => 
      options.categories!.includes(t.category)
    );
  }

  // 타입 필터
  if (options.type && options.type !== 'all') {
    filteredTransactions = filteredTransactions.filter(t => t.transaction_type === options.type);
  }

  // CSV 헤더
  const headers = [
    '날짜',
    '타입',
    '카테고리', 
    '설명',
    '금액',
    '화폐'
  ];

  // CSV 데이터 생성
  const csvData = filteredTransactions.map(transaction => [
    new Date(transaction.date).toLocaleDateString('ko-KR'),
    transaction.transaction_type === 'income' ? '수입' : '지출',
    getCategoryName(transaction.category),
    transaction.description,
    transaction.amount.toLocaleString(),
    'KRW'
  ]);

  // CSV 문자열 생성
  const csvContent = [
    headers.join(','),
    ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // BOM 추가 (Excel에서 한글 깨짐 방지)
  const BOM = '\uFEFF';
  
  return BOM + csvContent;
};

/**
 * CSV 파일 다운로드
 * @param csvContent - CSV 문자열
 * @param filename - 다운로드할 파일명
 */
export const downloadCSV = (csvContent: string, filename: string) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * 월별 리포트 생성
 * @param transactions - 거래 내역 배열
 * @param year - 대상 연도
 * @param month - 대상 월
 * @returns - 월별 리포트 객체
 */
export const generateMonthlyReport = (transactions: Transaction[], year: number, month: number) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  const monthlyTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= startDate && transactionDate <= endDate;
  });

  const totalIncome = monthlyTransactions
    .filter(t => t.transaction_type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = monthlyTransactions
    .filter(t => t.transaction_type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const categoryExpenses = monthlyTransactions
    .filter(t => t.transaction_type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  return {
    period: `${year}년 ${month}월`,
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    categoryExpenses,
    transactions: monthlyTransactions
  };
};

/**
 * 연도별 리포트 생성
 * @param transactions - 거래 내역 배열
 * @param year - 대상 연도
 * @returns - 연도별 리포트 객체
 */
export const generateYearlyReport = (transactions: Transaction[], year: number) => {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  
  const yearlyTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= startDate && transactionDate <= endDate;
  });

  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const monthTransactions = yearlyTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === i;
    });

    const income = monthTransactions
      .filter(t => t.transaction_type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = monthTransactions
      .filter(t => t.transaction_type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      month: i + 1,
      income,
      expense,
      balance: income - expense
    };
  });

  const totalIncome = yearlyTransactions
    .filter(t => t.transaction_type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = yearlyTransactions
    .filter(t => t.transaction_type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    year,
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    monthlyData,
    transactions: yearlyTransactions
  };
};