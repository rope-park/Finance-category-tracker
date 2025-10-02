import { useMemo } from 'react';
import type { Transaction } from '../../../index';

interface CategoryStat {
  income: number;
  expense: number;
  transactionCount: number;
  category: string;
}

export const useCategoryStats = (transactions: Transaction[]) => {
  const categoryStats = useMemo(() => {
    const stats: Record<string, CategoryStat> = {};

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

  const topCategories = useMemo(() => 
    categoryStats.slice(0, 5),
    [categoryStats]
  );

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
