/**
 * 거래 필터링 훅
 * 
 * 주요 기능:
 * - 주어진 기간 또는 사용자 지정 날짜 범위에 따라 거래 필터링
 * - 필터링된 거래의 총 수입, 총 지출, 순 잔액 계산
 * - 날짜 범위 계산 유틸리티 제공
 */
import { useMemo, useCallback } from 'react';
import { useApp } from '../../../app/hooks/useApp';
import type { AnalysisPeriod, DateRange } from '../../../index';

/**
 * 거래 필터링 훅
 * @param period - 분석 기간
 * @param customRange - 사용자 지정 날짜 범위
 * @returns 필터링된 거래, 총 수입, 총 지출, 순 잔액, 날짜 범위 계산 함수
 */
export const useTransactionFilter = (period?: AnalysisPeriod, customRange?: DateRange) => {
  const { transactions } = useApp();

  // 주어진 기간에 따른 날짜 범위 계산 함수
  const getDateRange = useCallback((period: AnalysisPeriod): DateRange => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (period) {
      case 'week': {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return {
          start: weekAgo.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0]
        };
      }
      case 'month': {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return {
          start: monthAgo.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0]
        };
      }
      case 'year': {
        const yearAgo = new Date(today);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        return {
          start: yearAgo.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0]
        };
      }
      case 'all':
        return {
          start: '2020-01-01',
          end: today.toISOString().split('T')[0]
        };
      case 'custom':
        return customRange || {
          start: today.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0]
        };
      default:
        return {
          start: today.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0]
        };
    }
  }, [customRange]);

  // 거래 필터링 및 총 수입/지출 계산
  const filteredTransactions = useMemo(() => {
    if (!period) return transactions;
    
    const dateRange = getDateRange(period);
    
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date).toISOString().split('T')[0];
      return transactionDate >= dateRange.start && transactionDate <= dateRange.end;
    });
  }, [transactions, period, getDateRange]);

  const totalIncome = useMemo(() => 
    filteredTransactions
      .filter(t => t.transaction_type === 'income')
      .reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions]
  );

  const totalExpense = useMemo(() =>
    filteredTransactions
      .filter(t => t.transaction_type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions]
  );

  const netBalance = totalIncome - totalExpense;

  return {
    filteredTransactions,
    totalIncome,
    totalExpense,
    netBalance,
    getDateRange
  };
};