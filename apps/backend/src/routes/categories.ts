import express from 'express';
import pool from '../config/database';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// 모든 카테고리 조회
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;

    let query = 'SELECT * FROM categories';
    const queryParams: any[] = [];
    
    if (type && (type === 'income' || type === 'expense')) {
      query += ' WHERE type = $1';
      queryParams.push(type);
    }
    
    query += ' ORDER BY display_order ASC, name ASC';

    const result = await pool.query(query, queryParams);

    res.json({
      success: true,
      data: {
        categories: result.rows
      }
    });

  } catch (error) {
    console.error('❌ 카테고리 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '카테고리를 조회하는 중 오류가 발생했습니다.'
    });
  }
});

// 특정 카테고리 조회
router.get('/:categoryKey', async (req, res) => {
  try {
    const { categoryKey } = req.params;

    const result = await pool.query(
      'SELECT * FROM categories WHERE category_key = $1',
      [categoryKey]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '카테고리를 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      data: {
        category: result.rows[0]
      }
    });

  } catch (error) {
    console.error('❌ 카테고리 상세 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '카테고리를 조회하는 중 오류가 발생했습니다.'
    });
  }
});

// 사용자별 카테고리 사용 통계
router.get('/usage/stats', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { startDate, endDate, type } = req.query;

    let query = `
      SELECT 
        c.category_key,
        c.name,
        c.icon,
        c.color,
        c.type,
        COUNT(t.id) as usage_count,
        COALESCE(SUM(t.amount), 0) as total_amount,
        COALESCE(AVG(t.amount), 0) as avg_amount
      FROM categories c
      LEFT JOIN transactions t ON c.category_key = t.category_key AND t.user_id = $1
    `;

    const queryParams: any[] = [userId];
    let paramCount = 1;

    // 날짜 필터 추가
    if (startDate) {
      paramCount++;
      query += ` AND t.transaction_date >= $${paramCount}`;
      queryParams.push(startDate);
    }

    if (endDate) {
      paramCount++;
      query += ` AND t.transaction_date <= $${paramCount}`;
      queryParams.push(endDate);
    }

    // 카테고리 타입 필터
    if (type && (type === 'income' || type === 'expense')) {
      query += ` WHERE c.type = $${paramCount + 1}`;
      queryParams.push(type);
    }

    query += `
      GROUP BY c.category_key, c.name, c.icon, c.color, c.type, c.display_order
      ORDER BY usage_count DESC, total_amount DESC, c.display_order ASC
    `;

    const result = await pool.query(query, queryParams);

    res.json({
      success: true,
      data: {
        categoryStats: result.rows.map(row => ({
          ...row,
          usage_count: parseInt(row.usage_count),
          total_amount: parseFloat(row.total_amount),
          avg_amount: parseFloat(row.avg_amount)
        }))
      }
    });

  } catch (error) {
    console.error('❌ 카테고리 사용 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '카테고리 사용 통계를 조회하는 중 오류가 발생했습니다.'
    });
  }
});

// 카테고리별 월별 통계
router.get('/:categoryKey/monthly-stats', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { categoryKey } = req.params;
    const { year } = req.query;

    // 카테고리 존재 확인
    const categoryResult = await pool.query(
      'SELECT * FROM categories WHERE category_key = $1',
      [categoryKey]
    );

    if (categoryResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '카테고리를 찾을 수 없습니다.'
      });
    }

    let dateFilter = '';
    const queryParams: any[] = [userId, categoryKey];
    
    if (year) {
      dateFilter = `AND EXTRACT(YEAR FROM transaction_date) = $3`;
      queryParams.push(year);
    }

    const query = `
      SELECT 
        EXTRACT(YEAR FROM transaction_date) as year,
        EXTRACT(MONTH FROM transaction_date) as month,
        COUNT(*) as transaction_count,
        SUM(amount) as total_amount,
        AVG(amount) as avg_amount
      FROM transactions 
      WHERE user_id = $1 AND category_key = $2 ${dateFilter}
      GROUP BY EXTRACT(YEAR FROM transaction_date), EXTRACT(MONTH FROM transaction_date)
      ORDER BY year DESC, month DESC
    `;

    const result = await pool.query(query, queryParams);

    res.json({
      success: true,
      data: {
        category: categoryResult.rows[0],
        monthlyStats: result.rows.map(row => ({
          year: parseInt(row.year),
          month: parseInt(row.month),
          transaction_count: parseInt(row.transaction_count),
          total_amount: parseFloat(row.total_amount),
          avg_amount: parseFloat(row.avg_amount)
        }))
      }
    });

  } catch (error) {
    console.error('❌ 카테고리 월별 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '카테고리 월별 통계를 조회하는 중 오류가 발생했습니다.'
    });
  }
});

export default router;