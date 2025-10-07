/**
 * 거래 데이터 관리 및 분석을 위한 커스텀 훅
 * 
 * 주요 기능:
 * - 거래 추가, 수정, 삭제
 * - 거래 필터링 (날짜, 금액, 카테고리, 거래처 등)
 * - 거래 통계 계산 (총 수입/지출, 순이익, 평균 거래액 등)
 * - 필터 및 통계 실시간 업데이트
 */
import { useState, useCallback, useMemo } from 'react';
import { 
  Category,
  TransactionType,
  getCategoryName 
} from '../constants';
import type {
  Transaction,
  TransactionFilters
} from '../types';

/**
 * 거래 데이터 관리 및 분석을 위한 커스텀 훅
 * @param initialTransactions 초기 거래 데이터
 * @returns 거래 데이터 및 관련 함수들
 */
export function useTransactions(initialTransactions: Transaction[] = []) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [filters, setFilters] = useState<TransactionFilters>({});

  // 필터링된 거래 목록
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      if (filters.transaction_type && transaction.transaction_type !== filters.transaction_type) {
        return false;
      }
      if (filters.category_key && transaction.category_key !== filters.category_key) {
        return false;
      }
      if (filters.date_from && transaction.transaction_date < filters.date_from) {
        return false;
      }
      if (filters.date_to && transaction.transaction_date > filters.date_to) {
        return false;
      }
      if (filters.min_amount && transaction.amount < filters.min_amount) {
        return false;
      }
      if (filters.max_amount && transaction.amount > filters.max_amount) {
        return false;
      }
      if (filters.merchant && !transaction.merchant?.toLowerCase().includes(filters.merchant.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [transactions, filters]);

  // 거래 통계 계산
  const statistics = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.transaction_type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = filteredTransactions
      .filter(t => t.transaction_type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netAmount = income - expense;
    const transactionCount = filteredTransactions.length;
    const averageTransaction = transactionCount > 0 ? (income + expense) / transactionCount : 0;

    const expenseTransactions = filteredTransactions.filter(t => t.transaction_type === 'expense');
    const incomeTransactions = filteredTransactions.filter(t => t.transaction_type === 'income');

    const largestExpense = expenseTransactions.length > 0 
      ? Math.max(...expenseTransactions.map(t => t.amount)) 
      : 0;
    
    const largestIncome = incomeTransactions.length > 0 
      ? Math.max(...incomeTransactions.map(t => t.amount)) 
      : 0;

    return {
      total_income: income,
      total_expense: expense,
      net_amount: netAmount,
      transaction_count: transactionCount,
      average_transaction: averageTransaction,
      largest_expense: largestExpense,
      largest_income: largestIncome,
    };
  }, [filteredTransactions]);

  // 거래 추가
  const addTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setTransactions(prev => [...prev, newTransaction]);
    return newTransaction;
  }, []);

  // 거래 업데이트
  const updateTransaction = useCallback((id: number, updates: Partial<Transaction>) => {
    setTransactions(prev => 
      prev.map(transaction => 
        transaction.id === id 
          ? { ...transaction, ...updates, updated_at: new Date().toISOString() }
          : transaction
      )
    );
  }, []);

  // 거래 삭제
  const deleteTransaction = useCallback((id: number) => {
    setTransactions(prev => prev.filter(transaction => transaction.id !== id));
  }, []);

  // 필터 업데이트
  const updateFilters = useCallback((newFilters: Partial<TransactionFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // 필터 초기화
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  return {
    transactions: filteredTransactions,
    allTransactions: transactions,
    filters,
    statistics,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    updateFilters,
    clearFilters,
  };
}