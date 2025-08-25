import { Request, Response } from 'express';
import { query } from '../utils/database';
import { ApiResponse } from '@finance-tracker/shared';

interface MonthlyStats {
  month: string;
  income: number;
  expense: number;
  balance: number;
  transaction_count: number;
}

interface CategoryStats {
  category_id: number;
  category_name: string;
  total_amount: number;
  transaction_count: number;
  percentage: number;
  color: string;
  icon: string;
}

interface TrendData {
  date: string;
  amount: number;
  transaction_count: number;
}

// 월별 통계 조회
export const getMonthlyStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { months = 6 } = req.query;

    const result = await query(`
      WITH monthly_data AS (
        SELECT 
          DATE_TRUNC('month', transaction_date) as month,
          SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as expense,
          COUNT(*) as transaction_count
        FROM transactions 
        WHERE user_id = $1 
          AND transaction_date >= CURRENT_DATE - INTERVAL '${months} months'
        GROUP BY DATE_TRUNC('month', transaction_date)
        ORDER BY month DESC
      )
      SELECT 
        TO_CHAR(month, 'YYYY-MM') as month,
        income,
        expense,
        (income - expense) as balance,
        transaction_count
      FROM monthly_data
    `, [userId]);

    const monthlyStats: MonthlyStats[] = result.rows;

    res.json({
      success: true,
      data: monthlyStats
    } as ApiResponse<MonthlyStats[]>);

  } catch (error) {
    console.error('월별 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '월별 통계를 불러오는 중 오류가 발생했습니다.'
    } as ApiResponse);
  }
};

// 카테고리별 지출 통계
export const getCategoryStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { period = 'month' } = req.query;

    let dateFilter = '';
    switch (period) {
      case 'week':
        dateFilter = "AND transaction_date >= CURRENT_DATE - INTERVAL '7 days'";
        break;
      case 'month':
        dateFilter = "AND transaction_date >= CURRENT_DATE - INTERVAL '1 month'";
        break;
      case 'year':
        dateFilter = "AND transaction_date >= CURRENT_DATE - INTERVAL '1 year'";
        break;
    }

    const result = await query(`
      WITH category_totals AS (
        SELECT 
          c.id as category_id,
          c.name as category_name,
          c.color,
          c.icon,
          SUM(ABS(t.amount)) as total_amount,
          COUNT(t.id) as transaction_count
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        WHERE t.user_id = $1 
          AND t.amount < 0 
          ${dateFilter}
        GROUP BY c.id, c.name, c.color, c.icon
      ),
      total_expense AS (
        SELECT SUM(total_amount) as total
        FROM category_totals
      )
      SELECT 
        ct.category_id,
        ct.category_name,
        ct.total_amount,
        ct.transaction_count,
        ct.color,
        ct.icon,
        ROUND((ct.total_amount / te.total * 100)::numeric, 2) as percentage
      FROM category_totals ct
      CROSS JOIN total_expense te
      ORDER BY ct.total_amount DESC
    `, [userId]);

    const categoryStats: CategoryStats[] = result.rows;

    res.json({
      success: true,
      data: categoryStats
    } as ApiResponse<CategoryStats[]>);

  } catch (error) {
    console.error('카테고리 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '카테고리 통계를 불러오는 중 오류가 발생했습니다.'
    } as ApiResponse);
  }
};

// 지출 트렌드 분석
export const getSpendingTrend = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { days = 30 } = req.query;

    const result = await query(`
      WITH daily_data AS (
        SELECT 
          DATE(transaction_date) as date,
          SUM(ABS(amount)) as total_expense,
          COUNT(*) as transaction_count
        FROM transactions 
        WHERE user_id = $1 
          AND amount < 0
          AND transaction_date >= CURRENT_DATE - INTERVAL '${days} days'
        GROUP BY DATE(transaction_date)
        ORDER BY date
      ),
      date_series AS (
        SELECT generate_series(
          CURRENT_DATE - INTERVAL '${days} days',
          CURRENT_DATE,
          INTERVAL '1 day'
        )::date as date
      )
      SELECT 
        ds.date::text,
        COALESCE(dd.total_expense, 0) as amount,
        COALESCE(dd.transaction_count, 0) as transaction_count
      FROM date_series ds
      LEFT JOIN daily_data dd ON ds.date = dd.date
      ORDER BY ds.date
    `, [userId]);

    const trendData: TrendData[] = result.rows;

    // 평균 계산
    const totalAmount = trendData.reduce((sum, day) => sum + day.amount, 0);
    const averageDaily = totalAmount / trendData.length;

    // 최대/최소 찾기
    const maxDay = trendData.reduce((max, day) => day.amount > max.amount ? day : max);
    const minDay = trendData.reduce((min, day) => day.amount < min.amount ? day : min);

    res.json({
      success: true,
      data: {
        trend: trendData,
        summary: {
          total: totalAmount,
          average_daily: averageDaily,
          max_day: maxDay,
          min_day: minDay
        }
      }
    } as ApiResponse);

  } catch (error) {
    console.error('지출 트렌드 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '지출 트렌드를 불러오는 중 오류가 발생했습니다.'
    } as ApiResponse);
  }
};

// 예산 대비 지출 분석
export const getBudgetAnalysis = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const result = await query(`
      WITH current_month_spending AS (
        SELECT 
          category_id,
          SUM(ABS(amount)) as spent
        FROM transactions 
        WHERE user_id = $1 
          AND amount < 0
          AND DATE_TRUNC('month', transaction_date) = DATE_TRUNC('month', CURRENT_DATE)
        GROUP BY category_id
      )
      SELECT 
        b.id as budget_id,
        c.name as category_name,
        c.color,
        c.icon,
        b.amount as budget_amount,
        COALESCE(cms.spent, 0) as spent_amount,
        ROUND((COALESCE(cms.spent, 0) / b.amount * 100)::numeric, 2) as usage_percentage,
        (b.amount - COALESCE(cms.spent, 0)) as remaining_amount,
        CASE 
          WHEN COALESCE(cms.spent, 0) / b.amount > b.alert_threshold THEN true
          ELSE false
        END as alert_triggered
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
      LEFT JOIN current_month_spending cms ON b.category_id = cms.category_id
      WHERE b.user_id = $1 
        AND b.period = 'monthly'
        AND b.start_date <= CURRENT_DATE
      ORDER BY usage_percentage DESC
    `, [userId]);

    const budgetAnalysis = result.rows;

    res.json({
      success: true,
      data: budgetAnalysis
    } as ApiResponse);

  } catch (error) {
    console.error('예산 분석 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '예산 분석을 불러오는 중 오류가 발생했습니다.'
    } as ApiResponse);
  }
};

// 대시보드 요약 데이터
export const getDashboardSummary = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // 이번 달 데이터
    const monthlyResult = await query(`
      SELECT 
        SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as total_expense,
        COUNT(*) as transaction_count
      FROM transactions 
      WHERE user_id = $1 
        AND DATE_TRUNC('month', transaction_date) = DATE_TRUNC('month', CURRENT_DATE)
    `, [userId]);

    // 지난 달 데이터 (비교용)
    const lastMonthResult = await query(`
      SELECT 
        SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as last_month_expense
      FROM transactions 
      WHERE user_id = $1 
        AND DATE_TRUNC('month', transaction_date) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
    `, [userId]);

    // 가장 많이 지출한 카테고리
    const topCategoryResult = await query(`
      SELECT c.name
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = $1 
        AND t.amount < 0
        AND DATE_TRUNC('month', t.transaction_date) = DATE_TRUNC('month', CURRENT_DATE)
      GROUP BY c.id, c.name
      ORDER BY SUM(ABS(t.amount)) DESC
      LIMIT 1
    `, [userId]);

    const currentMonth = monthlyResult.rows[0];
    const lastMonth = lastMonthResult.rows[0];
    const topCategory = topCategoryResult.rows[0];

    const totalIncome = parseFloat(currentMonth.total_income || '0');
    const totalExpense = parseFloat(currentMonth.total_expense || '0');
    const lastMonthExpense = parseFloat(lastMonth.last_month_expense || '0');
    
    const balance = totalIncome - totalExpense;
    const monthlyChange = lastMonthExpense > 0 
      ? ((totalExpense - lastMonthExpense) / lastMonthExpense * 100)
      : 0;

    const summaryData = {
      totalIncome,
      totalExpense,
      balance,
      monthlyChange: Math.round(monthlyChange * 100) / 100,
      transactionCount: parseInt(currentMonth.transaction_count || '0'),
      topCategory: topCategory?.name || '없음'
    };

    res.json({
      success: true,
      data: summaryData
    } as ApiResponse);

  } catch (error) {
    console.error('대시보드 요약 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '대시보드 요약을 불러오는 중 오류가 발생했습니다.'
    } as ApiResponse);
  }
};