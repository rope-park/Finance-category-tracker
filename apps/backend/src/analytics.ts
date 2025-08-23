import express from 'express';
import pool from '../config/database';
import { authenticateToken } from '../features/auth/middleware/authMiddleware';

const router = express.Router();

// 대시보드 요약 정보
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    // 현재 월 수입/지출 합계
    const currentMonthQuery = `
      SELECT 
        transaction_type,
        SUM(amount) as total_amount,
        COUNT(*) as count
      FROM transactions 
      WHERE user_id = $1 
      AND EXTRACT(YEAR FROM transaction_date) = $2
      AND EXTRACT(MONTH FROM transaction_date) = $3
      GROUP BY transaction_type
    `;

    // 지난 6개월 월별 트렌드
    const trendQuery = `
      SELECT 
        EXTRACT(YEAR FROM transaction_date) as year,
        EXTRACT(MONTH FROM transaction_date) as month,
        transaction_type,
        SUM(amount) as total_amount
      FROM transactions 
      WHERE user_id = $1 
      AND transaction_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '6 months')
      GROUP BY EXTRACT(YEAR FROM transaction_date), EXTRACT(MONTH FROM transaction_date), transaction_type
      ORDER BY year, month
    `;

    // 카테고리별 지출 (현재 월)
    const categoryQuery = `
      SELECT 
        t.category_key,
        c.label_ko as category_name,
        c.icon as category_icon,
        c.color as category_color,
        SUM(t.amount) as total_amount,
        COUNT(*) as count
      FROM transactions t
      LEFT JOIN categories c ON t.category_key = c.category_key
      WHERE t.user_id = $1 
      AND t.transaction_type = 'expense'
      AND EXTRACT(YEAR FROM t.transaction_date) = $2
      AND EXTRACT(MONTH FROM t.transaction_date) = $3
      GROUP BY t.category_key, c.label_ko, c.icon, c.color
      ORDER BY total_amount DESC
      LIMIT 10
    `;

    // 최근 거래 내역
    const recentTransactionsQuery = `
      SELECT 
        t.*,
        c.label_ko as category_name,
        c.icon as category_icon,
        c.color as category_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_key = c.category_key
      WHERE t.user_id = $1 
      ORDER BY t.transaction_date DESC, t.created_at DESC
      LIMIT 5
    `;

    // 현재 월 예산 현황
    const budgetQuery = `
      SELECT 
        b.budget_amount,
        COALESCE(SUM(t.amount), 0) as spent_amount,
        c.label_ko as category_name
      FROM budgets b
  LEFT JOIN transactions t ON b.category_key = t.category_key 
           AND t.user_id = b.user_id
           AND t.transaction_type = 'expense'
           AND EXTRACT(YEAR FROM t.transaction_date) = EXTRACT(YEAR FROM b.start_date)
           AND EXTRACT(MONTH FROM t.transaction_date) = EXTRACT(MONTH FROM b.start_date)
      LEFT JOIN categories c ON b.category_key = c.category_key
  WHERE b.user_id = $1 
  AND EXTRACT(YEAR FROM b.start_date) = $2 
  AND EXTRACT(MONTH FROM b.start_date) = $3
      GROUP BY b.id, b.budget_amount, c.label_ko
    `;

    const [
      currentMonthResult,
      trendResult,
      categoryResult,
      recentTransactionsResult,
      budgetResult
    ] = await Promise.all([
      pool.query(currentMonthQuery, [userId, currentYear, currentMonth]),
      pool.query(trendQuery, [userId]),
      pool.query(categoryQuery, [userId, currentYear, currentMonth]),
      pool.query(recentTransactionsQuery, [userId]),
      pool.query(budgetQuery, [userId, currentYear, currentMonth])
    ]);

    // 현재 월 수입/지출 정리
    const currentMonthData = {
      income: 0,
      expense: 0,
      incomeCount: 0,
      expenseCount: 0
    };

    currentMonthResult.rows.forEach(row => {
      if (row.transaction_type === 'income') {
        currentMonthData.income = parseFloat(row.total_amount);
        currentMonthData.incomeCount = parseInt(row.count);
      } else {
        currentMonthData.expense = parseFloat(row.total_amount);
        currentMonthData.expenseCount = parseInt(row.count);
      }
    });

    // 월별 트렌드 정리
    const monthlyTrend: { [key: string]: { income: number; expense: number } } = {};
    trendResult.rows.forEach(row => {
      const key = `${row.year}-${String(row.month).padStart(2, '0')}`;
      if (!monthlyTrend[key]) {
        monthlyTrend[key] = { income: 0, expense: 0 };
      }
      monthlyTrend[key][row.transaction_type as 'income' | 'expense'] = parseFloat(row.total_amount);
    });

    // 예산 현황 정리
    const budgetSummary = {
      totalBudget: 0,
      totalSpent: 0,
      categories: budgetResult.rows.map(row => ({
        category_name: row.category_name,
        budget_amount: parseFloat(row.budget_amount),
        spent_amount: parseFloat(row.spent_amount),
        usage_percentage: parseFloat(row.budget_amount) > 0 
          ? (parseFloat(row.spent_amount) / parseFloat(row.budget_amount)) * 100 
          : 0
      }))
    };

    budgetSummary.totalBudget = budgetSummary.categories.reduce((sum, cat) => sum + cat.budget_amount, 0);
    budgetSummary.totalSpent = budgetSummary.categories.reduce((sum, cat) => sum + cat.spent_amount, 0);

    res.json({
      success: true,
      data: {
        currentMonth: {
          ...currentMonthData,
          balance: currentMonthData.income - currentMonthData.expense,
          totalTransactions: currentMonthData.incomeCount + currentMonthData.expenseCount
        },
        monthlyTrend: Object.entries(monthlyTrend).map(([month, data]) => ({
          month,
          ...data,
          balance: data.income - data.expense
        })),
        topCategories: categoryResult.rows.map(row => ({
          ...row,
          total_amount: parseFloat(row.total_amount),
          count: parseInt(row.count)
        })),
        recentTransactions: recentTransactionsResult.rows,
        budgetSummary
      }
    });

  } catch (error) {
    console.error('❌ 대시보드 데이터 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '대시보드 데이터를 조회하는 중 오류가 발생했습니다.'
    });
  }
});

// 월별 상세 분석
router.get('/monthly/:year/:month', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { year, month } = req.params;

    // 해당 월 기본 통계
    const monthlyStatsQuery = `
      SELECT 
        transaction_type,
        SUM(amount) as total_amount,
        COUNT(*) as count,
        AVG(amount) as avg_amount,
        MIN(amount) as min_amount,
        MAX(amount) as max_amount
      FROM transactions 
      WHERE user_id = $1 
      AND EXTRACT(YEAR FROM transaction_date) = $2
      AND EXTRACT(MONTH FROM transaction_date) = $3
      GROUP BY transaction_type
    `;

    // 일별 현황
    const dailyQuery = `
      SELECT 
        DATE(transaction_date) as date,
        transaction_type,
        SUM(amount) as daily_amount,
        COUNT(*) as daily_count
      FROM transactions 
      WHERE user_id = $1 
      AND EXTRACT(YEAR FROM transaction_date) = $2
      AND EXTRACT(MONTH FROM transaction_date) = $3
      GROUP BY DATE(transaction_date), transaction_type
      ORDER BY date
    `;

    // 카테고리별 분석
    const categoryAnalysisQuery = `
      SELECT 
        t.category_key,
        c.label_ko as category_name,
        c.icon as category_icon,
        c.color as category_color,
        t.transaction_type,
        SUM(t.amount) as total_amount,
        COUNT(*) as count,
        AVG(t.amount) as avg_amount
      FROM transactions t
      LEFT JOIN categories c ON t.category_key = c.category_key
      WHERE t.user_id = $1 
      AND EXTRACT(YEAR FROM t.transaction_date) = $2
      AND EXTRACT(MONTH FROM t.transaction_date) = $3
      GROUP BY t.category_key, c.label_ko, c.icon, c.color, t.transaction_type
      ORDER BY total_amount DESC
    `;

    // 주별 트렌드
    const weeklyQuery = `
      SELECT 
        EXTRACT(WEEK FROM transaction_date) as week,
        transaction_type,
        SUM(amount) as weekly_amount,
        COUNT(*) as weekly_count
      FROM transactions 
      WHERE user_id = $1 
      AND EXTRACT(YEAR FROM transaction_date) = $2
      AND EXTRACT(MONTH FROM transaction_date) = $3
      GROUP BY EXTRACT(WEEK FROM transaction_date), transaction_type
      ORDER BY week
    `;

    const [monthlyStatsResult, dailyResult, categoryAnalysisResult, weeklyResult] = await Promise.all([
      pool.query(monthlyStatsQuery, [userId, year, month]),
      pool.query(dailyQuery, [userId, year, month]),
      pool.query(categoryAnalysisQuery, [userId, year, month]),
      pool.query(weeklyQuery, [userId, year, month])
    ]);

    // 월 통계 정리
    const monthlyStats = {
      income: { total: 0, count: 0, avg: 0, min: 0, max: 0 },
      expense: { total: 0, count: 0, avg: 0, min: 0, max: 0 }
    };

    monthlyStatsResult.rows.forEach(row => {
      const type = row.transaction_type as 'income' | 'expense';
      monthlyStats[type] = {
        total: parseFloat(row.total_amount),
        count: parseInt(row.count),
        avg: parseFloat(row.avg_amount),
        min: parseFloat(row.min_amount),
        max: parseFloat(row.max_amount)
      };
    });

    // 일별 데이터 정리
    const dailyData: { [key: string]: { income: number; expense: number } } = {};
    dailyResult.rows.forEach(row => {
      const dateKey = row.date.toISOString().split('T')[0];
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { income: 0, expense: 0 };
      }
      dailyData[dateKey][row.transaction_type as 'income' | 'expense'] = parseFloat(row.daily_amount);
    });

    res.json({
      success: true,
      data: {
        period: { year: parseInt(year), month: parseInt(month) },
        summary: {
          ...monthlyStats,
          balance: monthlyStats.income.total - monthlyStats.expense.total,
          totalTransactions: monthlyStats.income.count + monthlyStats.expense.count
        },
        dailyData: Object.entries(dailyData).map(([date, data]) => ({
          date,
          ...data,
          balance: data.income - data.expense
        })),
        categoryAnalysis: categoryAnalysisResult.rows.map(row => ({
          ...row,
          total_amount: parseFloat(row.total_amount),
          count: parseInt(row.count),
          avg_amount: parseFloat(row.avg_amount)
        })),
        weeklyTrend: weeklyResult.rows.map(row => ({
          week: parseInt(row.week),
          transaction_type: row.transaction_type,
          weekly_amount: parseFloat(row.weekly_amount),
          weekly_count: parseInt(row.weekly_count)
        }))
      }
    });

  } catch (error) {
    console.error('❌ 월별 분석 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '월별 분석을 조회하는 중 오류가 발생했습니다.'
    });
  }
});

// 연간 분석
router.get('/yearly/:year', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { year } = req.params;

    // 연간 월별 통계
    const yearlyStatsQuery = `
      SELECT 
        EXTRACT(MONTH FROM transaction_date) as month,
        transaction_type,
        SUM(amount) as total_amount,
        COUNT(*) as count
      FROM transactions 
      WHERE user_id = $1 
      AND EXTRACT(YEAR FROM transaction_date) = $2
      GROUP BY EXTRACT(MONTH FROM transaction_date), transaction_type
      ORDER BY month
    `;

    // 연간 카테고리별 통계
    const categoryYearlyQuery = `
      SELECT 
        t.category_key,
        c.label_ko as category_name,
        c.icon as category_icon,
        c.color as category_color,
        t.transaction_type,
        SUM(t.amount) as total_amount,
        COUNT(*) as count,
        AVG(t.amount) as avg_amount
      FROM transactions t
      LEFT JOIN categories c ON t.category_key = c.category_key
      WHERE t.user_id = $1 
      AND EXTRACT(YEAR FROM t.transaction_date) = $2
      GROUP BY t.category_key, c.label_ko, c.icon, c.color, t.transaction_type
      ORDER BY total_amount DESC
    `;

    // 분기별 통계
    const quarterlyQuery = `
      SELECT 
        EXTRACT(QUARTER FROM transaction_date) as quarter,
        transaction_type,
        SUM(amount) as total_amount,
        COUNT(*) as count
      FROM transactions 
      WHERE user_id = $1 
      AND EXTRACT(YEAR FROM transaction_date) = $2
      GROUP BY EXTRACT(QUARTER FROM transaction_date), transaction_type
      ORDER BY quarter
    `;

    const [yearlyStatsResult, categoryYearlyResult, quarterlyResult] = await Promise.all([
      pool.query(yearlyStatsQuery, [userId, year]),
      pool.query(categoryYearlyQuery, [userId, year]),
      pool.query(quarterlyQuery, [userId, year])
    ]);

    // 월별 데이터 정리
    const monthlyData: { [key: number]: { income: number; expense: number } } = {};
    for (let i = 1; i <= 12; i++) {
      monthlyData[i] = { income: 0, expense: 0 };
    }

    yearlyStatsResult.rows.forEach(row => {
      const month = parseInt(row.month);
      monthlyData[month][row.transaction_type as 'income' | 'expense'] = parseFloat(row.total_amount);
    });

    // 분기별 데이터 정리
    const quarterlyData: { [key: number]: { income: number; expense: number } } = {};
    for (let i = 1; i <= 4; i++) {
      quarterlyData[i] = { income: 0, expense: 0 };
    }

    quarterlyResult.rows.forEach(row => {
      const quarter = parseInt(row.quarter);
      quarterlyData[quarter][row.transaction_type as 'income' | 'expense'] = parseFloat(row.total_amount);
    });

    // 연간 총계
    const yearlyTotal = {
      income: Object.values(monthlyData).reduce((sum, month) => sum + month.income, 0),
      expense: Object.values(monthlyData).reduce((sum, month) => sum + month.expense, 0)
    };

    res.json({
      success: true,
      data: {
        year: parseInt(year),
        summary: {
          ...yearlyTotal,
          balance: yearlyTotal.income - yearlyTotal.expense
        },
        monthlyData: Object.entries(monthlyData).map(([month, data]) => ({
          month: parseInt(month),
          ...data,
          balance: data.income - data.expense
        })),
        quarterlyData: Object.entries(quarterlyData).map(([quarter, data]) => ({
          quarter: parseInt(quarter),
          ...data,
          balance: data.income - data.expense
        })),
        categoryAnalysis: categoryYearlyResult.rows.map(row => ({
          ...row,
          total_amount: parseFloat(row.total_amount),
          count: parseInt(row.count),
          avg_amount: parseFloat(row.avg_amount)
        }))
      }
    });

  } catch (error) {
    console.error('❌ 연간 분석 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '연간 분석을 조회하는 중 오류가 발생했습니다.'
    });
  }
});

// 비교 분석 (기간별 비교)
router.get('/compare', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { 
      startDate1, endDate1, 
      startDate2, endDate2 
    } = req.query;

    if (!startDate1 || !endDate1 || !startDate2 || !endDate2) {
      return res.status(400).json({
        success: false,
        error: '비교할 두 기간의 시작일과 종료일을 모두 입력해주세요.'
      });
    }

    const compareQuery = `
      SELECT 
        CASE 
          WHEN transaction_date BETWEEN $2 AND $3 THEN 'period1'
          WHEN transaction_date BETWEEN $4 AND $5 THEN 'period2'
        END as period,
        transaction_type,
        SUM(amount) as total_amount,
        COUNT(*) as count,
        AVG(amount) as avg_amount
      FROM transactions 
      WHERE user_id = $1 
      AND (
        (transaction_date BETWEEN $2 AND $3) OR 
        (transaction_date BETWEEN $4 AND $5)
      )
      GROUP BY period, transaction_type
    `;

    const categoryCompareQuery = `
      SELECT 
        CASE 
          WHEN t.transaction_date BETWEEN $2 AND $3 THEN 'period1'
          WHEN t.transaction_date BETWEEN $4 AND $5 THEN 'period2'
        END as period,
        t.category_key,
        c.label_ko as category_name,
        t.transaction_type,
        SUM(t.amount) as total_amount,
        COUNT(*) as count
      FROM transactions t
      LEFT JOIN categories c ON t.category_key = c.category_key
      WHERE t.user_id = $1 
      AND (
        (t.transaction_date BETWEEN $2 AND $3) OR 
        (t.transaction_date BETWEEN $4 AND $5)
      )
      GROUP BY period, t.category_key, c.label_ko, t.transaction_type
      ORDER BY period, total_amount DESC
    `;

    const [compareResult, categoryCompareResult] = await Promise.all([
      pool.query(compareQuery, [userId, startDate1, endDate1, startDate2, endDate2]),
      pool.query(categoryCompareQuery, [userId, startDate1, endDate1, startDate2, endDate2])
    ]);

    // 기간별 데이터 정리
    const periodData = {
      period1: { income: 0, expense: 0, incomeCount: 0, expenseCount: 0 },
      period2: { income: 0, expense: 0, incomeCount: 0, expenseCount: 0 }
    };

    compareResult.rows.forEach(row => {
      const period = row.period as 'period1' | 'period2';
      const type = row.transaction_type;
      periodData[period][type as 'income' | 'expense'] = parseFloat(row.total_amount);
      periodData[period][`${type}Count` as 'incomeCount' | 'expenseCount'] = parseInt(row.count);
    });

    // 카테고리별 비교 데이터 정리
    const categoryComparison: { [key: string]: any } = {};
    categoryCompareResult.rows.forEach(row => {
      const key = `${row.category_key}_${row.transaction_type}`;
      if (!categoryComparison[key]) {
        categoryComparison[key] = {
          category_key: row.category_key,
          category_name: row.category_name,
          transaction_type: row.transaction_type,
          period1: { amount: 0, count: 0 },
          period2: { amount: 0, count: 0 }
        };
      }
      categoryComparison[key][row.period] = {
        amount: parseFloat(row.total_amount),
        count: parseInt(row.count)
      };
    });

    res.json({
      success: true,
      data: {
        periods: {
          period1: { startDate: startDate1, endDate: endDate1 },
          period2: { startDate: startDate2, endDate: endDate2 }
        },
        comparison: {
          period1: {
            ...periodData.period1,
            balance: periodData.period1.income - periodData.period1.expense
          },
          period2: {
            ...periodData.period2,
            balance: periodData.period2.income - periodData.period2.expense
          },
          changes: {
            income: periodData.period2.income - periodData.period1.income,
            expense: periodData.period2.expense - periodData.period1.expense,
            balance: (periodData.period2.income - periodData.period2.expense) - 
                    (periodData.period1.income - periodData.period1.expense)
          }
        },
        categoryComparison: Object.values(categoryComparison)
      }
    });

  } catch (error) {
    console.error('❌ 비교 분석 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '비교 분석을 조회하는 중 오류가 발생했습니다.'
    });
  }
});

export default router;
