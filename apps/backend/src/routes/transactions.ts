import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';
import { validateTransaction } from '../middleware/security';
import { asyncHandler } from '../middleware/errorHandler';
import { TransactionService } from '../services/transactionService';

const router = express.Router();

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
      type: type as 'income' | 'expense' | undefined,
      category: category as string | undefined,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      search: search as string | undefined,
      page: Number(page),
      limit: Number(limit)
    };

    const result = await TransactionService.getTransactions(userId, filters);
    res.json({
      success: true,
      data: result.transactions,
      pagination: result.pagination
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
    const { limit = 10, type } = req.query;

    const topCategories = await TransactionService.getTopCategories(
      userId,
      Number(limit),
      type as 'income' | 'expense' | undefined
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
      merchant,
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
