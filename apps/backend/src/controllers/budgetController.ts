import { Response } from 'express';
import pool from '../config/database';
import { 
  CreateBudgetRequest, 
  UpdateBudgetRequest,
  ApiResponse,
  Budget,
  BudgetSummary
} from '@finance-tracker/shared';
import type { BudgetRecord } from '../repositories/BudgetRepository';
import { AuthRequest } from '../middleware/auth';
import { budgetRepository } from '../repositories';

// 예산 생성
export const createBudget = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { category_key, amount, period_start, period_end }: CreateBudgetRequest = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '인증이 필요합니다.'
      });
    }

    // 필수 필드 검증
    if (!category_key || !amount || !period_start || !period_end) {
      return res.status(400).json({
        success: false,
        error: '카테고리, 금액, 시작일, 종료일은 필수입니다.'
      });
    }

    // 카테고리 존재 여부 확인 (지출 카테고리만)
    const categoryCheck = await pool.query(
      'SELECT id FROM categories WHERE category_key = $1 AND transaction_type = $2',
      [category_key, 'expense']
    );

    if (categoryCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 지출 카테고리입니다.'
      });
    }

    const startDate = new Date(period_start);
    const endDate = new Date(period_end);

    // Repository를 사용하여 중복 예산 확인
    const overlappingBudgets = await budgetRepository.findOverlappingBudgets(
      userId,
      category_key,
      startDate,
      endDate
    );

    if (overlappingBudgets.length > 0) {
      return res.status(409).json({
        success: false,
        error: '해당 기간에 이미 예산이 설정되어 있습니다.'
      });
    }

    // Repository를 사용하여 예산 생성
    const budgetData = {
      user_id: userId,
      category_key,
      amount: parseFloat(amount.toString()),
      period_type: 'monthly' as const, // 기본값
      start_date: startDate,
      end_date: endDate
    };

    const budget = await budgetRepository.createBudget(budgetData);

    const response: ApiResponse = {
      success: true,
      data: { budget },
      message: '예산이 설정되었습니다.'
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('예산 생성 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    });
  }
};

// 예산 목록 조회
export const getBudgets = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { period_start, period_end, category_key, is_active = 'true' } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '인증이 필요합니다.'
      });
    }

    // Repository 필터 구성
    const filters: any = {
      user_id: userId
    };

    if (category_key) filters.category_key = category_key as string;
    if (is_active !== undefined) filters.is_active = is_active === 'true';
    if (period_start) filters.start_date_from = new Date(period_start as string);
    if (period_end) filters.start_date_to = new Date(period_end as string);

    // Repository를 사용하여 예산 조회
  const { budgets } = await budgetRepository.findManyBudgets(filters);

    // 카테고리 정보 추가

    type EnhancedBudget = BudgetRecord & {
      category_name: string;
      primary_category?: string;
      secondary_category?: string;
      icon?: string;
      color?: string;
    };

    let enhancedBudgets: EnhancedBudget[] = budgets.map(budget => ({
      ...budget,
      category_name: budget.category_key,
    }));
    if (budgets.length > 0) {
      const categoryKeys = [...new Set(budgets.map(b => b.category_key))];
      const categoryResult = await pool.query(
        'SELECT category_key, label_ko as category_name, primary_category, secondary_category, icon, color FROM categories WHERE category_key = ANY($1)',
        [categoryKeys]
      );

      const categoryMap = new Map(
        categoryResult.rows.map(cat => [cat.category_key, cat])
      );

      enhancedBudgets = budgets.map(budget => ({
        ...budget,
        category_name: categoryMap.get(budget.category_key)?.category_name || budget.category_key,
        primary_category: categoryMap.get(budget.category_key)?.primary_category,
        secondary_category: categoryMap.get(budget.category_key)?.secondary_category,
        icon: categoryMap.get(budget.category_key)?.icon,
        color: categoryMap.get(budget.category_key)?.color
      }));
    }

    const response: ApiResponse = {
      success: true,
      data: { budgets: enhancedBudgets },
      message: '예산 목록을 조회했습니다.'
    };

    res.json(response);
  } catch (error) {
    console.error('예산 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    });
  }
};

// 단일 예산 조회 (실제 지출과 비교)
export const getBudget = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '인증이 필요합니다.'
      });
    }

    // Repository를 사용하여 예산 진행 상황 조회
    const progress = await budgetRepository.getBudgetProgress(parseInt(id), userId);

    if (!progress) {
      return res.status(404).json({
        success: false,
        error: '예산을 찾을 수 없습니다.'
      });
    }

    // 카테고리 정보 추가
    const categoryResult = await pool.query(
      'SELECT label_ko as category_name, primary_category, secondary_category, icon, color FROM categories WHERE category_key = $1',
      [progress.budget.category_key]
    );

    const enhancedBudget = {
      ...progress.budget,
      category_name: categoryResult.rows[0]?.category_name || progress.budget.category_key,
      primary_category: categoryResult.rows[0]?.primary_category,
      secondary_category: categoryResult.rows[0]?.secondary_category,
      icon: categoryResult.rows[0]?.icon,
      color: categoryResult.rows[0]?.color
    };

    const response: ApiResponse = {
      success: true,
      data: { 
        budget: enhancedBudget,
        progress: {
          spent_amount: progress.spent_amount,
          remaining_amount: progress.remaining_amount,
          percentage_used: progress.percentage_used,
          days_remaining: progress.days_remaining,
          is_exceeded: progress.is_exceeded,
          daily_average_spending: progress.daily_average_spending,
          projected_spending: progress.projected_spending,
          is_on_track: progress.is_on_track
        }
      },
      message: '예산 정보를 조회했습니다.'
    };

    res.json(response);
  } catch (error) {
    console.error('예산 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    });
  }
};

// 예산 요약 정보 조회
export const getBudgetSummary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '인증이 필요합니다.'
      });
    }

    // Repository를 사용하여 예산 요약 조회
    const summary = await budgetRepository.getBudgetSummary(userId);

    const response: ApiResponse = {
      success: true,
      data: { summary },
      message: '예산 요약 정보를 조회했습니다.'
    };

    res.json(response);
  } catch (error) {
    console.error('예산 요약 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    });
  }
};

// 예산 알림 조회
export const getBudgetAlerts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '인증이 필요합니다.'
      });
    }

    // Repository를 사용하여 예산 알림 조회
    const alerts = await budgetRepository.getBudgetAlerts(userId);

    const response: ApiResponse = {
      success: true,
      data: { alerts },
      message: '예산 알림을 조회했습니다.'
    };

    res.json(response);
  } catch (error) {
    console.error('예산 알림 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    });
  }
};

// 예산 수정
export const updateBudget = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { amount, period_start, period_end } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '인증이 필요합니다.'
      });
    }

    // 예산 존재 여부 확인
    const existingBudget = await pool.query(
      'SELECT id FROM budgets WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existingBudget.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '예산을 찾을 수 없습니다.'
      });
    }

    // 업데이트할 필드들을 동적으로 구성
    const updateFields: string[] = [];
    const values: (string | number)[] = [];
    let paramCounter = 1;

    if (amount !== undefined) {
      updateFields.push(`amount = $${paramCounter++}`);
      values.push(amount);
    }

    if (period_start !== undefined) {
      updateFields.push(`period_start = $${paramCounter++}`);
      values.push(period_start);
    }

    if (period_end !== undefined) {
      updateFields.push(`period_end = $${paramCounter++}`);
      values.push(period_end);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: '업데이트할 필드가 없습니다.'
      });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id, userId);

    const query = `
      UPDATE budgets 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCounter++} AND user_id = $${paramCounter}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    const response: ApiResponse = {
      success: true,
      data: { budget: result.rows[0] },
      message: '예산이 수정되었습니다.'
    };

    res.json(response);
  } catch (error) {
    console.error('예산 수정 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    });
  }
};

// 예산 삭제
export const deleteBudget = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '인증이 필요합니다.'
      });
    }

    const result = await pool.query(
      'DELETE FROM budgets WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '예산을 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      message: '예산이 삭제되었습니다.'
    });
  } catch (error) {
    console.error('예산 삭제 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    });
  }
};

// 현재 월의 예산 현황 요약
export const getCurrentMonthBudgetSummary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '인증이 필요합니다.'
      });
    }

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const monthStart = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
    const monthEnd = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];

    // 현재 월의 모든 예산 조회
    const budgetsQuery = `
      SELECT b.*, c.label_ko as category_name, c.primary_category
      FROM budgets b
      LEFT JOIN categories c ON b.category_key = c.category_key
      WHERE b.user_id = $1 
        AND b.period_start <= $2 
        AND b.period_end >= $3
      ORDER BY c.primary_category, c.label_ko
    `;

    const budgets = await pool.query(budgetsQuery, [userId, monthEnd, monthStart]);

    // 각 예산별 실제 지출 계산
    const budgetSummary = await Promise.all(
      budgets.rows.map(async (budget) => {
        const expenseResult = await pool.query(
          `SELECT COALESCE(SUM(amount), 0) as total_spent
           FROM transactions 
           WHERE user_id = $1 AND category_key = $2 
             AND transaction_type = 'expense'
             AND transaction_date >= $3 AND transaction_date <= $4`,
          [userId, budget.category_key, monthStart, monthEnd]
        );

        const totalSpent = parseFloat(expenseResult.rows[0].total_spent);
        const budgetAmount = parseFloat(budget.amount);
        const remaining = budgetAmount - totalSpent;
        const percentage = budgetAmount > 0 ? (totalSpent / budgetAmount) * 100 : 0;

        return {
          ...budget,
          total_spent: totalSpent,
          remaining: remaining,
          percentage_used: percentage,
          is_over_budget: totalSpent > budgetAmount
        };
      })
    );

    // 전체 요약 계산
    const totalBudget = budgetSummary.reduce((sum, b) => sum + parseFloat(b.amount), 0);
    const totalSpent = budgetSummary.reduce((sum, b) => sum + b.total_spent, 0);
    const totalRemaining = totalBudget - totalSpent;
    const overBudgetCategories = budgetSummary.filter(b => b.is_over_budget).length;

    const response: ApiResponse = {
      success: true,
      data: { 
        summary: {
          total_budget: totalBudget,
          total_spent: totalSpent,
          total_remaining: totalRemaining,
          overall_percentage: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
          over_budget_count: overBudgetCategories,
          budget_count: budgetSummary.length
        },
        budgets: budgetSummary,
        period: { year: currentYear, month: currentMonth }
      },
      message: '현재 월 예산 현황을 조회했습니다.'
    };

    res.json(response);
  } catch (error) {
    console.error('예산 현황 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    });
  }
};