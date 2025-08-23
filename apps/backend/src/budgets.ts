import express from 'express';
import { authenticateToken } from '../features/auth/middleware/authMiddleware';
import { apiLimiter } from '../middleware/rateLimiter';
import { validateBudget } from '../middleware/security';
import { asyncHandler } from '../middleware/errorHandler';
import { BudgetService } from '../services/budgetService';

const router = express.Router();

// 모든 예산 조회
router.get('/', 
  apiLimiter,
  authenticateToken, 
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const budgets = await BudgetService.getBudgets(userId);
    res.json({
      success: true,
      data: budgets
    });
  })
);

// 예산 진행률 조회
router.get('/progress',
  apiLimiter,
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const progress = await BudgetService.getBudgetProgress(userId);
    res.json(progress);
  })
);

// 예산 알림 조회
router.get('/alerts',
  apiLimiter,
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const alerts = await BudgetService.getBudgetAlerts(userId);
    res.json(alerts);
  })
);

// 예산 요약 조회
router.get('/summary',
  apiLimiter,
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const budgets = await BudgetService.getBudgets(userId);
    res.json({
      success: true,
      data: budgets
    });
  })
);

// 월별 예산 요약
router.get('/summary/:year/:month',
  apiLimiter,
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const year = Number(req.params.year);
    const month = Number(req.params.month);

    if (year < 2000 || year > 2100 || month < 1 || month > 12) {
      return res.status(400).json({ error: 'Invalid year or month' });
    }

    const summary = await BudgetService.getMonthlyBudgetSummary(userId, year, month);
    res.json(summary);
  })
);

// 특정 예산 조회
router.get('/:id', 
  apiLimiter,
  authenticateToken, 
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const budgetId = Number(req.params.id);

    const budget = await BudgetService.getBudgetById(budgetId, userId);
    res.json(budget);
  })
);

// 새 예산 생성
router.post('/', 
  apiLimiter,
  authenticateToken, 
  validateBudget,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { category_key, amount, period_start, period_end } = req.body;

    const budget = await BudgetService.createBudget({
      user_id: userId,
      category_key,
      amount,
      period: 'monthly', // Default period type
      start_date: new Date(period_start),
      end_date: new Date(period_end)
    });

    res.status(201).json({
      success: true,
      data: budget
    });
  })
);

// 예산 수정
router.put('/:id', 
  apiLimiter,
  authenticateToken, 
  validateBudget,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const budgetId = Number(req.params.id);
    const { amount, period, start_date, end_date, is_active } = req.body;

    const updateData: any = {};
    if (amount !== undefined) updateData.amount = amount;
    if (period !== undefined) updateData.period = period;
    if (start_date !== undefined) updateData.start_date = new Date(start_date);
    if (end_date !== undefined) updateData.end_date = new Date(end_date);
    if (is_active !== undefined) updateData.is_active = is_active;

    const budget = await BudgetService.updateBudget(budgetId, userId, updateData);
    res.json(budget);
  })
);

// 예산 삭제
router.delete('/:id', 
  apiLimiter,
  authenticateToken, 
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const budgetId = Number(req.params.id);

    await BudgetService.deleteBudget(budgetId, userId);
    res.status(204).send();
  })
);

export default router;
