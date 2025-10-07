/**
 * 예산 및 목표 관리를 위한 공통 커스텀 훅
 * 
 * 주요 기능:
 * - 예산 및 목표 CRUD
 * - 예산 분석 (사용 현황, 남은 금액, 초과 여부 등)
 * - 카테고리별 예산 사용률 계산
 * - 목표 달성률 계산
 * - 월별 예산 요약
 */
import { useState, useCallback, useEffect } from 'react';
import type { Budget, Goal, Transaction } from '../types';
import { EXPENSE_CATEGORIES, type Category } from '../constants';

/**
 * 예산 및 목표 관리를 위한 훅
 */
export function useBudget() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  // 예산 CRUD
  const addBudget = useCallback((budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newBudget: Budget = {
      ...budget,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setBudgets(prev => [...prev, newBudget]);
    return newBudget;
  }, []);

  const updateBudget = useCallback((id: string, updates: Partial<Budget>) => {
    setBudgets(prev => prev.map(budget => 
      budget.id === id 
        ? { ...budget, ...updates, updatedAt: new Date().toISOString() }
        : budget
    ));
  }, []);

  const deleteBudget = useCallback((id: string) => {
    setBudgets(prev => prev.filter(budget => budget.id !== id));
  }, []);

  // 목표 CRUD
  const addGoal = useCallback((goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newGoal: Goal = {
      ...goal,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setGoals(prev => [...prev, newGoal]);
    return newGoal;
  }, []);

  const updateGoal = useCallback((id: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(goal => 
      goal.id === id 
        ? { ...goal, ...updates, updatedAt: new Date().toISOString() }
        : goal
    ));
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== id));
  }, []);

  // 예산 분석
  const getBudgetAnalysis = useCallback((transactions: Transaction[]) => {
    return budgets.map(budget => {
      const relevantTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        const budgetStart = new Date(budget.startDate);
        const budgetEnd = new Date(budget.endDate);
        
        return t.category === budget.category &&
               transactionDate >= budgetStart &&
               transactionDate <= budgetEnd;
      });

      const spent = relevantTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const remaining = budget.amount - spent;
      const percentage = (spent / budget.amount) * 100;

      return {
        budget,
        spent,
        remaining,
        percentage,
        isOverBudget: spent > budget.amount,
        transactionCount: relevantTransactions.length,
      };
    });
  }, [budgets]);

  // 카테고리별 예산 사용률
  const getCategoryBudgetUsage = useCallback((transactions: Transaction[]) => {
    const usage: Record<Category, { budgeted: number; spent: number; percentage: number }> = {} as any;

    Object.values(EXPENSE_CATEGORIES).forEach(category => {
      const categoryBudgets = budgets.filter(b => b.category === category);
      const totalBudgeted = categoryBudgets.reduce((sum, b) => sum + b.amount, 0);
      
      const categoryTransactions = transactions.filter(t => t.category === category);
      const totalSpent = categoryTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      usage[category] = {
        budgeted: totalBudgeted,
        spent: totalSpent,
        percentage: totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0,
      };
    });

    return usage;
  }, [budgets]);

  // 목표 달성률 계산
  const getGoalProgress = useCallback((transactions: Transaction[]) => {
    return goals.map(goal => {
      const relevantTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        const goalStart = new Date(goal.startDate);
        const goalEnd = new Date(goal.endDate);
        
        return (goal.category ? t.category === goal.category : true) &&
               transactionDate >= goalStart &&
               transactionDate <= goalEnd;
      });

      let currentAmount = 0;
      if (goal.type === 'saving') {
        // 저축 목표: 입금 - 출금
        currentAmount = relevantTransactions.reduce((sum, t) => sum + t.amount, 0);
      } else if (goal.type === 'spending_limit') {
        // 지출 제한: 총 지출 금액
        currentAmount = relevantTransactions
          .filter(t => t.amount < 0)
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      }

      const percentage = (currentAmount / goal.targetAmount) * 100;
      const isAchieved = currentAmount >= goal.targetAmount;

      return {
        goal,
        currentAmount,
        percentage,
        isAchieved,
        remainingAmount: goal.targetAmount - currentAmount,
        transactionCount: relevantTransactions.length,
      };
    });
  }, [goals]);

  // 월별 예산 요약
  const getMonthlyBudgetSummary = useCallback((year: number, month: number, transactions: Transaction[]) => {
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);
    
    const monthlyBudgets = budgets.filter(budget => {
      const budgetStart = new Date(budget.startDate);
      const budgetEnd = new Date(budget.endDate);
      
      return budgetStart <= monthEnd && budgetEnd >= monthStart;
    });

    const monthlyTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= monthStart && transactionDate <= monthEnd;
    });

    const totalBudgeted = monthlyBudgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = monthlyTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return {
      totalBudgeted,
      totalSpent,
      remaining: totalBudgeted - totalSpent,
      percentage: totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0,
      budgetCount: monthlyBudgets.length,
      transactionCount: monthlyTransactions.length,
    };
  }, [budgets]);

  return {
    budgets,
    goals,
    setBudgets,
    setGoals,
    
    // 예산 CRUD
    addBudget,
    updateBudget,
    deleteBudget,
    
    // 목표 CRUD
    addGoal,
    updateGoal,
    deleteGoal,
    
    // 분석 함수들
    getBudgetAnalysis,
    getCategoryBudgetUsage,
    getGoalProgress,
    getMonthlyBudgetSummary,
  };
}