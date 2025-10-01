const express = require('express');
import { authenticateToken } from '../../shared/middleware/auth';
import { apiLimiter } from '../../shared/middleware/rateLimiter';
import { validateTransaction } from '../../shared/middleware/security';
import { asyncHandler } from '../../shared/middleware/errorHandler';
import pool from '../../core/config/database';
import DatabaseManager from '../../core/config/database';

import { CategoryAutoService } from './category-auto.service';
import { TransactionService } from './transaction.service';

const router = express.Router();

// 자동 카테고리 분류 기반 거래 생성
router.post('/auto-category',
  apiLimiter,
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { transaction_type, amount, description, merchant, transaction_date, account_id } = req.body;
    // category_key 없이 description/merchant만 받아 자동 분류
    const transaction = await CategoryAutoService.createWithAutoCategory({
      user_id: userId,
      account_id,
      type: transaction_type,
      amount,
      description,
      transaction_date: new Date(transaction_date)
    });
    res.status(201).json({
      success: true,
      data: transaction
    });
  })
);

// 개발용: 인증 없는 거래 내역 조회 (데모 사용자용)
router.get('/demo', 
  apiLimiter,
  asyncHandler(async (req, res) => {
    const {
      type,
      category,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 100
    } = req.query;

    // 직접 SQL 쿼리로 처리하여 타입 충돌 회피
    const client = await pool.connect();
    try {
      let whereClause = 'WHERE 1=1';
      const values: any[] = [];
      let paramIndex = 1;

      if (type) {
        whereClause += ` AND type = $${paramIndex}`;
        values.push(type);
        paramIndex++;
      }

      if (category) {
        whereClause += ` AND category_id = $${paramIndex}`;
        values.push(category);
        paramIndex++;
      }

      if (startDate) {
        whereClause += ` AND transaction_date >= $${paramIndex}`;
        values.push(new Date(startDate as string));
        paramIndex++;
      }

      if (endDate) {
        whereClause += ` AND transaction_date <= $${paramIndex}`;
        values.push(new Date(endDate as string));
        paramIndex++;
      }

      if (search) {
        whereClause += ` AND description ILIKE $${paramIndex}`;
        values.push(`%${search}%`);
        paramIndex++;
      }

      const offset = (Number(page) - 1) * Number(limit);

      const query = `
        SELECT * FROM transactions 
        ${whereClause} 
        ORDER BY transaction_date DESC, created_at DESC 
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      
      const countQuery = `
        SELECT COUNT(*) as total FROM transactions ${whereClause}
      `;

      const [transactionsResult, countResult] = await Promise.all([
        client.query(query, [...values, Number(limit), offset]),
        client.query(countQuery, values)
      ]);

      res.json({
        success: true,
        data: {
          transactions: transactionsResult.rows,
          total: parseInt(countResult.rows[0].total),
          page: Number(page),
          limit: Number(limit)
        }
      });
    } finally {
      client.release();
    }
  })
);

// 특정 사용자 거래 내역 조회 (테스트용 - 사용자 ID 직접 지정)
router.get('/user/:userId', 
  apiLimiter,
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const {
      type,
      category,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 100
    } = req.query;

    const client = await pool.connect();
    try {
      let whereClause = `WHERE t.user_id = $1`;
      const values: any[] = [userId];
      let paramIndex = 2;

      if (type) {
        whereClause += ` AND t.type = $${paramIndex}`;
        values.push(type);
        paramIndex++;
      }

      if (category) {
        whereClause += ` AND t.category_id = $${paramIndex}`;
        values.push(category);
        paramIndex++;
      }

      if (startDate) {
        whereClause += ` AND t.transaction_date >= $${paramIndex}`;
        values.push(new Date(startDate as string));
        paramIndex++;
      }

      if (endDate) {
        whereClause += ` AND t.transaction_date <= $${paramIndex}`;
        values.push(new Date(endDate as string));
        paramIndex++;
      }

      if (search) {
        whereClause += ` AND t.description ILIKE $${paramIndex}`;
        values.push(`%${search}%`);
        paramIndex++;
      }

      const offset = (Number(page) - 1) * Number(limit);

      const query = `
        SELECT t.*, c.name as category_name, c.color as category_color, a.name as account_name
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        LEFT JOIN accounts a ON t.account_id = a.id
        ${whereClause} 
        ORDER BY t.transaction_date DESC, t.created_at DESC 
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      
      const countQuery = `
        SELECT COUNT(*) as total FROM transactions t ${whereClause}
      `;

      const [transactionsResult, countResult] = await Promise.all([
        client.query(query, [...values, Number(limit), offset]),
        client.query(countQuery, values)
      ]);

      res.json({
        success: true,
        data: {
          transactions: transactionsResult.rows,
          total: parseInt(countResult.rows[0].total),
          page: Number(page),
          limit: Number(limit)
        }
      });
    } finally {
      client.release();
    }
  })
);

// 모든 거래 내역 조회
router.get('/', 
  apiLimiter,
  authenticateToken, 
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const {
      type,
      category,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 20
    } = req.query;

    const filters = {
      transaction_type: type as 'income' | 'expense' | undefined,
      category_key: category as string | undefined,
      start_date: startDate ? new Date(startDate as string) : undefined,
      end_date: endDate ? new Date(endDate as string) : undefined,
      search: search as string | undefined,
      page: Number(page),
      limit: Number(limit)
    };

    const result = await TransactionService.getTransactions(userId, filters);
    res.json({
      success: true,
      data: result.transactions,
      total: result.total
    });
  })
);

// 거래 통계 조회
router.get('/stats',
  apiLimiter,
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { startDate, endDate } = req.query;

    const stats = await TransactionService.getTransactionStats(
      userId,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    res.json(stats);
  })
);

// 카테고리별 통계 조회
router.get('/categories/top',
  apiLimiter,
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { limit = 10 } = req.query;

    const topCategories = await TransactionService.getTopCategories(
      userId,
      undefined,
      undefined
    );

    res.json(topCategories);
  })
);

// 특정 거래 조회
router.get('/:id', 
  apiLimiter,
  authenticateToken, 
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const transactionId = Number(req.params.id);

    const transaction = await TransactionService.getTransactionById(transactionId.toString(), userId);
    res.json(transaction);
  })
);

// 새 거래 생성
router.post('/', 
  apiLimiter,
  authenticateToken, 
  validateTransaction,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { category_key, transaction_type, amount, description, merchant, transaction_date, account_id } = req.body;

    const transaction = await TransactionService.createTransaction({
      user_id: userId,
      account_id,
      category_id: category_key,
      type: transaction_type,
      amount,
      description,
      transaction_date: new Date(transaction_date)
    });

    res.status(201).json({
      success: true,
      data: transaction
    });
  })
);

// 카테고리 키를 카테고리 ID로 변환하는 헬퍼 함수
const getCategoryIdByKey = async (categoryKey: string, userId: string): Promise<string | null> => {
  const categoryKeyMap: { [key: string]: string } = {
    'food': '식비',
    'transport': '교통비',
    'shopping': '쇼핑/의류',
    'cafe': '카페/음료',
    'culture': '취미/문화',
    'housing': '주거비',
    'communication': '통신비',
    'household_items': '쇼핑/의류',
    'salary': '급여',
    'side_job': '부업',
    'investment': '투자수익',
    'other_income': '기타수입'
  };

  const categoryName = categoryKeyMap[categoryKey];
  if (!categoryName) {
    console.log(`⚠️ 알 수 없는 카테고리 키: ${categoryKey}`);
    return null;
  }

  try {
    const result = await pool.query(
      'SELECT id FROM categories WHERE user_id = $1 AND name = $2',
      [userId, categoryName]
    );
    
    if (result.rows.length > 0) {
      return result.rows[0].id;
    } else {
      console.log(`⚠️ 카테고리를 찾을 수 없음: ${categoryName} (사용자: ${userId})`);
      return null;
    }
  } catch (error) {
    console.error('카테고리 ID 조회 오류:', error);
    return null;
  }
};

// 개발용: 인증 없는 특정 사용자 거래 수정
router.put('/dev/:userId/:id', 
  apiLimiter,
  asyncHandler(async (req, res) => {
    const { userId, id: transactionId } = req.params;
    const { category_key, transaction_type, amount, description, merchant, transaction_date } = req.body;
    
    console.log('🔧 개발용 거래 수정:', { userId, transactionId, updateData: req.body });

    const updateData: any = {};
    
    // 카테고리 키를 카테고리 ID로 변환
    if (category_key !== undefined) {
      const categoryId = await getCategoryIdByKey(category_key, userId);
      if (categoryId) {
        updateData.category_id = categoryId;
      } else {
        return res.status(400).json({
          success: false,
          message: `유효하지 않은 카테고리: ${category_key}`
        });
      }
    }
    
    // transaction_type을 type으로 변경
    if (transaction_type !== undefined) updateData.type = transaction_type;
    if (amount !== undefined) updateData.amount = amount;
    if (description !== undefined) updateData.description = description;
    if (transaction_date !== undefined) updateData.transaction_date = new Date(transaction_date);

    const transaction = await TransactionService.updateTransaction(transactionId, userId, updateData);
    res.json({
      success: true,
      data: transaction
    });
  })
);

// 개발용: 인증 없는 특정 사용자 거래 삭제
router.delete('/dev/:userId/:id', 
  apiLimiter,
  asyncHandler(async (req, res) => {
    const { userId, id: transactionId } = req.params;
    
    console.log('🗑️ 개발용 거래 삭제:', { userId, transactionId });

    await TransactionService.deleteTransaction(transactionId, userId);
    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  })
);

// 개발용: 인증 없는 특정 사용자 거래 생성
router.post('/dev/:userId', 
  apiLimiter,
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { category_key, transaction_type, amount, description, merchant, transaction_date, account_id } = req.body;
    
    console.log('➕ 개발용 거래 생성:', { userId, transactionData: req.body });

    const transaction = await TransactionService.createTransaction({
      user_id: userId,
      account_id,
      category_id: category_key,
      type: transaction_type,
      amount,
      description,
      transaction_date: new Date(transaction_date)
    });

    res.status(201).json({
      success: true,
      data: transaction
    });
  })
);

// 거래 수정
router.put('/:id', 
  apiLimiter,
  authenticateToken, 
  validateTransaction,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const transactionId = Number(req.params.id);
    const { category_key, transaction_type, amount, description, merchant, transaction_date } = req.body;

    const updateData: any = {};
    if (category_key !== undefined) updateData.category_key = category_key;
    if (transaction_type !== undefined) updateData.transaction_type = transaction_type;
    if (amount !== undefined) updateData.amount = amount;
    if (description !== undefined) updateData.description = description;
    if (merchant !== undefined) updateData.merchant = merchant;
    if (transaction_date !== undefined) updateData.transaction_date = new Date(transaction_date);

    const transaction = await TransactionService.updateTransaction(transactionId.toString(), userId, updateData);
    res.json({
      success: true,
      data: transaction
    });
  })
);

// 거래 삭제
router.delete('/:id', 
  apiLimiter,
  authenticateToken, 
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const transactionId = Number(req.params.id);

    await TransactionService.deleteTransaction(transactionId.toString(), userId);
    res.status(204).send();
  })
);

export default router;