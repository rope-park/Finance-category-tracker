import type { Transaction } from '../types';
import { getCategoryName } from './index';

export interface ExportOptions {
  dateRange?: {
    start: Date;
    end: Date;
  };
  categories?: string[];
  type?: 'all' | 'income' | 'expense';
}

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
    filteredTransactions = filteredTransactions.filter(t => t.type === options.type);
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
    transaction.type === 'income' ? '수입' : '지출',
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

export const generateMonthlyReport = (transactions: Transaction[], year: number, month: number) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  const monthlyTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= startDate && transactionDate <= endDate;
  });

  const totalIncome = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const categoryExpenses = monthlyTransactions
    .filter(t => t.type === 'expense')
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
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      month: i + 1,
      income,
      expense,
      balance: income - expense
    };
  });

  const totalIncome = yearlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = yearlyTransactions
    .filter(t => t.type === 'expense')
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
