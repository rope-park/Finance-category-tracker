import express from 'express';
import pool from '../config/database';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// 예측 분석: 다음 달 예상 지출/수입 (간단 예시)
router.get('/prediction/next-month', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    // 최근 3개월 평균을 기반으로 다음 달 예측
    const query = `
      SELECT transaction_type, AVG(amount) as avg_amount
      FROM transactions
      WHERE user_id = $1
        AND transaction_date >= (CURRENT_DATE - INTERVAL '3 months')
      GROUP BY transaction_type
    `;
    const result = await pool.query(query, [userId]);
    const prediction: any = {};
    result.rows.forEach(row => {
      prediction[row.transaction_type] = parseFloat(row.avg_amount || 0);
    });
    res.json({
      success: true,
      data: {
        nextMonth: {
          income: prediction['income'] || 0,
          expense: prediction['expense'] || 0,
          balance: (prediction['income'] || 0) - (prediction['expense'] || 0)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: '예측 분석 중 오류 발생' });
  }
});

export default router;
