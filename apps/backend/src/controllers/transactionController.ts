import { Response } from 'express';
import pool from '../config/database';
import { CreateTransactionRequest, ApiResponse } from '../types';
import { AuthRequest } from '../middleware/auth';

// 거래 내역 생성
export const createTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { 
      category_key, 
      transaction_type, 
      amount, 
      description, 
      merchant, 
      transaction_date 
    }: CreateTransactionRequest = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '인증이 필요합니다.'
      });
    }

    // 필수 필드 검증
    if (!category_key || !transaction_type || !amount || !transaction_date) {
      return res.status(400).json({
        success: false,
        error: '카테고리, 거래 유형, 금액, 거래 날짜는 필수입니다.'
      });
    }

    // 카테고리 존재 여부 확인
    const categoryCheck = await pool.query(
      'SELECT id FROM categories WHERE category_key = $1 AND transaction_type = $2',
      [category_key, transaction_type]
    );

    if (categoryCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 카테고리입니다.'
      });
    }

    // 거래 내역 생성
    const result = await pool.query(
      `INSERT INTO transactions (user_id, category_key, transaction_type, amount, description, merchant, transaction_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, category_key, transaction_type, amount, description, merchant, transaction_date]
    );

    const response: ApiResponse = {
      success: true,
      data: { transaction: result.rows[0] },
      message: '거래 내역이 생성되었습니다.'
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('거래 내역 생성 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    });
  }
};

// 거래 내역 조회 (필터링 가능)
export const getTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { 
      category_key, 
      transaction_type, 
      start_date, 
      end_date, 
      limit = '50', 
      offset = '0' 
    } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '인증이 필요합니다.'
      });
    }

    let query = `
      SELECT t.*, c.label_ko as category_name, c.primary_category, c.secondary_category, c.icon, c.color
      FROM transactions t
      LEFT JOIN categories c ON t.category_key = c.category_key
      WHERE t.user_id = $1
    `;

    const values: (string | number)[] = [userId];
    let paramCounter = 2;

    // 필터 조건 추가
    if (category_key) {
      query += ` AND t.category_key = $${paramCounter++}`;
      values.push(category_key as string);
    }

    if (transaction_type) {
      query += ` AND t.transaction_type = $${paramCounter++}`;
      values.push(transaction_type as string);
    }

    if (start_date) {
      query += ` AND t.transaction_date >= $${paramCounter++}`;
      values.push(start_date as string);
    }

    if (end_date) {
      query += ` AND t.transaction_date <= $${paramCounter++}`;
      values.push(end_date as string);
    }

    query += ` ORDER BY t.transaction_date DESC, t.created_at DESC`;
    query += ` LIMIT $${paramCounter++} OFFSET $${paramCounter++}`;
    values.push(parseInt(limit as string), parseInt(offset as string));

    const result = await pool.query(query, values);

    // 총 개수 조회 (페이지네이션용)
    let countQuery = 'SELECT COUNT(*) FROM transactions WHERE user_id = $1';
    const countValues: (string | number)[] = [userId];
    let countParamCounter = 2;

    if (category_key) {
      countQuery += ` AND category_key = $${countParamCounter++}`;
      countValues.push(category_key as string);
    }

    if (transaction_type) {
      countQuery += ` AND transaction_type = $${countParamCounter++}`;
      countValues.push(transaction_type as string);
    }

    if (start_date) {
      countQuery += ` AND transaction_date >= $${countParamCounter++}`;
      countValues.push(start_date as string);
    }

    if (end_date) {
      countQuery += ` AND transaction_date <= $${countParamCounter++}`;
      countValues.push(end_date as string);
    }

    const countResult = await pool.query(countQuery, countValues);
    const totalCount = parseInt(countResult.rows[0].count);

    const response: ApiResponse = {
      success: true,
      data: { 
        transactions: result.rows,
        pagination: {
          total: totalCount,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          hasMore: (parseInt(offset as string) + parseInt(limit as string)) < totalCount
        }
      },
      message: '거래 내역을 조회했습니다.'
    };

    res.json(response);
  } catch (error) {
    console.error('거래 내역 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    });
  }
};

// 단일 거래 내역 조회
export const getTransaction = async (req: AuthRequest, res: Response) => {
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
      `SELECT t.*, c.label_ko as category_name, c.primary_category, c.secondary_category, c.icon, c.color
       FROM transactions t
       LEFT JOIN categories c ON t.category_key = c.category_key
       WHERE t.id = $1 AND t.user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '거래 내역을 찾을 수 없습니다.'
      });
    }

    const response: ApiResponse = {
      success: true,
      data: { transaction: result.rows[0] },
      message: '거래 내역을 조회했습니다.'
    };

    res.json(response);
  } catch (error) {
    console.error('거래 내역 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    });
  }
};

// 거래 내역 수정
export const updateTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { 
      category_key, 
      transaction_type, 
      amount, 
      description, 
      merchant, 
      transaction_date 
    } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '인증이 필요합니다.'
      });
    }

    // 거래 내역 존재 여부 확인
    const existingTransaction = await pool.query(
      'SELECT id FROM transactions WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existingTransaction.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '거래 내역을 찾을 수 없습니다.'
      });
    }

    // 업데이트할 필드들을 동적으로 구성
    const updateFields: string[] = [];
    const values: (string | number)[] = [];
    let paramCounter = 1;

    if (category_key !== undefined) {
      updateFields.push(`category_key = $${paramCounter++}`);
      values.push(category_key);
    }

    if (transaction_type !== undefined) {
      updateFields.push(`transaction_type = $${paramCounter++}`);
      values.push(transaction_type);
    }

    if (amount !== undefined) {
      updateFields.push(`amount = $${paramCounter++}`);
      values.push(amount);
    }

    if (description !== undefined) {
      updateFields.push(`description = $${paramCounter++}`);
      values.push(description);
    }

    if (merchant !== undefined) {
      updateFields.push(`merchant = $${paramCounter++}`);
      values.push(merchant);
    }

    if (transaction_date !== undefined) {
      updateFields.push(`transaction_date = $${paramCounter++}`);
      values.push(transaction_date);
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
      UPDATE transactions 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCounter++} AND user_id = $${paramCounter}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    const response: ApiResponse = {
      success: true,
      data: { transaction: result.rows[0] },
      message: '거래 내역이 수정되었습니다.'
    };

    res.json(response);
  } catch (error) {
    console.error('거래 내역 수정 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    });
  }
};

// 거래 내역 삭제
export const deleteTransaction = async (req: AuthRequest, res: Response) => {
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
      'DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '거래 내역을 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      message: '거래 내역이 삭제되었습니다.'
    });
  } catch (error) {
    console.error('거래 내역 삭제 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    });
  }
};

// 월별 통계
export const getMonthlyStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { year, month } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '인증이 필요합니다.'
      });
    }

    if (!year || !month) {
      return res.status(400).json({
        success: false,
        error: '년도와 월이 필요합니다.'
      });
    }

    // 해당 월의 시작일과 마지막일 계산
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(parseInt(year as string), parseInt(month as string), 0).toISOString().split('T')[0];

    const result = await pool.query(
      `SELECT 
         transaction_type,
         SUM(amount) as total_amount,
         COUNT(*) as transaction_count,
         c.primary_category,
         SUM(amount) as category_total
       FROM transactions t
       LEFT JOIN categories c ON t.category_key = c.category_key
       WHERE t.user_id = $1 
         AND t.transaction_date >= $2 
         AND t.transaction_date <= $3
       GROUP BY transaction_type, c.primary_category
       ORDER BY transaction_type, category_total DESC`,
      [userId, startDate, endDate]
    );

    // 데이터 정리
    const stats = {
      income: { total: 0, categories: [] as any[] },
      expense: { total: 0, categories: [] as any[] }
    };

    result.rows.forEach(row => {
      const type = row.transaction_type;
      stats[type as keyof typeof stats].total += parseFloat(row.total_amount);
      
      if (row.primary_category) {
        stats[type as keyof typeof stats].categories.push({
          category: row.primary_category,
          amount: parseFloat(row.category_total),
          count: parseInt(row.transaction_count)
        });
      }
    });

    const response: ApiResponse = {
      success: true,
      data: { 
        stats,
        period: { year: parseInt(year as string), month: parseInt(month as string) }
      },
      message: '월별 통계를 조회했습니다.'
    };

    res.json(response);
  } catch (error) {
    console.error('월별 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    });
  }
};
