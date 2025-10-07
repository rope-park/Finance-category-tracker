/**
 * 카테고리별 통계 훅
 * 
 * 주요 기능:
 * - 거래 내역을 카테고리별로 집계하여 수입, 지출, 거래 횟수 계산.
 * - 카테고리별 통계 데이터를 총액 기준으로 정렬.
 * - 상위 5개 카테고리와 전체 카테고리의 총액 별도로 제공.
 */
import { useMemo } from 'react';
import type { Transaction } from '../../../index';

// 카테고리별 통계 데이터 타입 인터페이스
interface CategoryStat {
  income: number;
  expense: number;
  transactionCount: number;
  category: string;
}

/**
 * 카테고리별 통계 훅
 * @param transactions - 거래 내역 배열
 * @returns 카테고리별 통계 데이터, 상위 5개 카테고리, 전체 카테고리 총액
 */
export const useCategoryStats = (transactions: Transaction[]) => {
  const categoryStats = useMemo(() => {
    const stats: Record<string, CategoryStat> = {};

    // 거래 내역을 순회하며 카테고리별로 집계
    transactions.forEach(transaction => {
      const category = transaction.category;
      
      if (!stats[category]) {
        stats[category] = {
          income: 0,
          expense: 0,
          transactionCount: 0,
          category: category
        };
      }

      stats[category].transactionCount++;
      
      if (transaction.transaction_type === 'income') {
        stats[category].income += transaction.amount;
      } else {
        stats[category].expense += transaction.amount;
      }
    });

    return Object.values(stats).sort((a, b) => 
      (b.income + b.expense) - (a.income + a.expense)
    );
  }, [transactions]);

  // 상위 5개 카테고리
  const topCategories = useMemo(() => 
    categoryStats.slice(0, 5),
    [categoryStats]
  );

  // 전체 카테고리 총액
  const totalCategoriesAmount = useMemo(() => 
    categoryStats.reduce((sum, stat) => sum + stat.income + stat.expense, 0),
    [categoryStats]
  );

  return {
    categoryStats,
    topCategories,
    totalCategoriesAmount
  };
};
