import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';
import { validateTransaction } from '../middleware/security';
import { asyncHandler } from '../middleware/errorHandler';

import { CategoryAutoService } from '../services/categoryAutoService';
import { TransactionService } from '../services/transactionService';

const router = express.Router();

// 자동 카테고리 분류 기반 거래 생성
router.post('/auto-category',
  apiLimiter,
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { transaction_type, amount, description, merchant, transaction_date } = req.body;
    // category_key 없이 description/merchant만 받아 자동 분류
    const transaction = await CategoryAutoService.createWithAutoCategory({
      user_id: userId,
      transaction_type,
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

    const transaction = await TransactionService.getTransactionById(transactionId, userId);
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
    const { category_key, transaction_type, amount, description, merchant, transaction_date } = req.body;

    const transaction = await TransactionService.createTransaction({
      user_id: userId,
      category_key,
      transaction_type,
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

    const transaction = await TransactionService.updateTransaction(transactionId, userId, updateData);
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

    await TransactionService.deleteTransaction(transactionId, userId);
    res.status(204).send();
  })
);

export default router;