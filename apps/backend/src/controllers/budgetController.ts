import { Response } from 'express';
import pool from '../config/database';
import { CreateBudgetRequest, ApiResponse } from '../types';
import { AuthRequest } from '../middleware/auth';

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

    // 중복 예산 확인 (같은 기간, 같은 카테고리)
    const existingBudget = await pool.query(
      `SELECT id FROM budgets 
       WHERE user_id = $1 AND category_key = $2 
         AND period_start = $3 AND period_end = $4`,
      [userId, category_key, period_start, period_end]
    );

    if (existingBudget.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: '해당 기간에 이미 예산이 설정되어 있습니다.'
      });
    }

    // 예산 생성
    const result = await pool.query(
      `INSERT INTO budgets (user_id, category_key, amount, period_start, period_end)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, category_key, amount, period_start, period_end]
    );

    const response: ApiResponse = {
      success: true,
      data: { budget: result.rows[0] },
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
    const { period_start, period_end, category_key } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '인증이 필요합니다.'
      });
    }

    let query = `
      SELECT b.*, c.label_ko as category_name, c.primary_category, c.secondary_category, c.icon, c.color
      FROM budgets b
      LEFT JOIN categories c ON b.category_key = c.category_key
      WHERE b.user_id = $1
    `;

    const values: (string | number)[] = [userId];
    let paramCounter = 2;

    // 필터 조건 추가
    if (period_start) {
      query += ` AND b.period_start >= $${paramCounter++}`;
      values.push(period_start as string);
    }

    if (period_end) {
      query += ` AND b.period_end <= $${paramCounter++}`;
      values.push(period_end as string);
    }

    if (category_key) {
      query += ` AND b.category_key = $${paramCounter++}`;
      values.push(category_key as string);
    }

    query += ` ORDER BY b.period_start DESC, b.created_at DESC`;

    const result = await pool.query(query, values);

    const response: ApiResponse = {
      success: true,
      data: { budgets: result.rows },
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

    // 예산 정보 조회
    const budgetResult = await pool.query(
      `SELECT b.*, c.label_ko as category_name, c.primary_category, c.secondary_category, c.icon, c.color
       FROM budgets b
       LEFT JOIN categories c ON b.category_key = c.category_key
       WHERE b.id = $1 AND b.user_id = $2`,
      [id, userId]
    );

    if (budgetResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '예산을 찾을 수 없습니다.'
      });
    }

    const budget = budgetResult.rows[0];

    // 해당 기간의 실제 지출 조회
    const expenseResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total_spent, COUNT(*) as transaction_count
       FROM transactions 
       WHERE user_id = $1 AND category_key = $2 
         AND transaction_type = 'expense'
         AND transaction_date >= $3 AND transaction_date <= $4`,
      [userId, budget.category_key, budget.period_start, budget.period_end]
    );

    const totalSpent = parseFloat(expenseResult.rows[0].total_spent);
    const transactionCount = parseInt(expenseResult.rows[0].transaction_count);
    const budgetAmount = parseFloat(budget.amount);
    const remaining = budgetAmount - totalSpent;
    const percentage = budgetAmount > 0 ? (totalSpent / budgetAmount) * 100 : 0;

    const response: ApiResponse = {
      success: true,
      data: { 
        budget: {
          ...budget,
          total_spent: totalSpent,
          remaining: remaining,
          percentage_used: percentage,
          transaction_count: transactionCount,
          is_over_budget: totalSpent > budgetAmount
        }
      },
      message: '예산을 조회했습니다.'
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
