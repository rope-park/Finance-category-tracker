import { useMemo, useCallback } from 'react';
import { useApp } from './useApp';
import type { AnalysisPeriod, DateRange } from '../types';

export const useTransactionFilter = (period?: AnalysisPeriod, customRange?: DateRange) => {
  const { transactions } = useApp();

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
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions]
  );

  const totalExpense = useMemo(() =>
    filteredTransactions
      .filter(t => t.type === 'expense')
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
