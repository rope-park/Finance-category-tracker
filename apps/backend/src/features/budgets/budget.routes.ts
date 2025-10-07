/**
 * 예산 관리 API 라우트
 * 
 * 사용자의 예산 설정, 진행률 추적, 알림 관리 등 예산 관련 모든 RESTful API 엔드포인트를 제공.
 * 카테고리별, 기간별 예산 관리 기능.
 * 
 * 주요 기능:
 * - 예산 CRUD 작업을 위한 RESTful API
 * - 예산 진행률 및 사용 현황 모니터링 API
 * - 예산 초과 알림 및 경고 시스템 API
 * - 월별/기간별 예산 요약 데이터 API
 * 
 * @author Ju Eul Park (rope-park)
 */

const express = require('express');
import { authenticateToken } from '../../shared/middleware/auth';
import { apiLimiter } from '../../shared/middleware/rateLimiter';
import { validateBudget } from '../../shared/middleware/security';
import { asyncHandler } from '../../shared/middleware/errorHandler';
import { BudgetService } from './budget.service';

const router = express.Router();

/**
 * GET /api/budgets
 * 사용자의 모든 예산 내역 조회 API
 * 
 * 인증된 사용자의 모든 예산 설정 조회하여 예산 대시보드 제공.
 * 활성/비활성 예산을 모두 포함하여 전체 예산 현황 파악 가능.
 * 
 * @route GET /api/budgets
 * @access Private (인증 필요)
 * @returns {Object} 예산 목록 및 성공 상태
 */
router.get('/', 
  apiLimiter,           // API 요청 빈도 제한
  authenticateToken,    // 사용자 인증 확인
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const budgets = await BudgetService.getBudgets(userId);
    res.json({
      success: true,
      data: budgets
    });
  })
);

/**
 * GET /api/budgets/progress
 * 예산 진행률 및 사용 현황 조회 API
 * 
 * 각 예산별로 사용 금액, 남은 금액, 사용률 등을 계산하여
 * 사용자가 예산 진행 상황을 한눈에 파악할 수 있도록 도움.
 * 
 * @route GET /api/budgets/progress
 * @access Private (인증 필요)
 * @returns {Object} 예산별 진행률 및 사용 현황 데이터
 */
router.get('/progress',
  apiLimiter,
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const progress = await BudgetService.getBudgetProgress(userId);
    res.json(progress);
  })
);

/**
 * GET /api/budgets/alerts
 * 예산 초과 알림 조회 API
 * 
 * 사용자의 예산 초과 알림 목록을 반환하여 효과적인 예산 관리 지원.
 * 
 * @route GET /api/budgets/alerts
 * @access Private (인증 필요)
 * @returns {Object} 예산 초과 알림 목록
 */
router.get('/alerts',
  apiLimiter,
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const alerts = await BudgetService.getBudgetAlerts(userId);
    res.json(alerts);
  })
);

/**
 * GET /api/budgets/summary
 * 월별 예산 요약 조회 API
 * 
 * 사용자의 월별 예산 요약 정보를 제공.
 *
 * @route GET /api/budgets/summary
 * @access Private (인증 필요)
 * @returns {Object} 월별 예산 요약 정보
 */
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

/**
 * GET /api/budgets/summary/:year/:month
 * 월별 예산 요약 조회 API
 * 
 *  @route GET /api/budgets/summary/:year/:month
 *  @access Private (인증 필요)
 *  @returns {Object} 월별 예산 요약 정보
 */
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

/**
 * GET /api/budgets/:id
 * 특정 예산 조회 API
 * 
 * @route GET /api/budgets/:id
 * @access Private (인증 필요)
 * @returns {Object} 특정 예산 정보
 */
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

/**
 * POST /api/budgets
 * 새 예산 생성
 * 
 * 사용자가 새로운 예산을 설정할 수 있도록 함.
 * 
 * @route POST /api/budgets
 * @access Private (인증 필요)
 * @returns {Object} 생성된 예산 정보
 */
router.post('/', 
  apiLimiter,
  authenticateToken, 
  validateBudget,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;

    const { category_key, amount, period_type, period_start, period_end } = req.body;

    const budget = await BudgetService.createBudget({
      user_id: userId,
      category_key,
      amount,
      period_type: period_type || 'monthly', // Default period type
      start_date: new Date(period_start),
      end_date: new Date(period_end)
    });

    res.status(201).json({
      success: true,
      data: budget
    });
  })
);

/**
 * PUT /api/budgets/:id
 * 예산 수정
 * 
 * 사용자가 기존 예산을 업데이트할 수 있도록 함.
 * 
 * @route PUT /api/budgets/:id
 * @access Private (인증 필요)
 * @returns {Object} 수정된 예산 정보
 */
router.put('/:id', 
  apiLimiter,
  authenticateToken, 
  validateBudget,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const budgetId = Number(req.params.id);

  const { amount, period_type, start_date, end_date, is_active } = req.body;

  const updateData: any = {};
  if (amount !== undefined) updateData.amount = amount;
  if (period_type !== undefined) updateData.period_type = period_type;
  if (start_date !== undefined) updateData.start_date = new Date(start_date);
  if (end_date !== undefined) updateData.end_date = new Date(end_date);
  if (is_active !== undefined) updateData.is_active = is_active;

    const budget = await BudgetService.updateBudget(budgetId, userId, updateData);
    res.json(budget);
  })
);

/**
 * DELETE /api/budgets/:id
 * 예산 삭제
 * 
 * 특정 예산을 삭제하여 더 이상 추적하지 않도록 함.
 * 
 * @route DELETE /api/budgets/:id
 * @access Private (인증 필요)
 * @returns {204} 성공적으로 삭제되었음을 나타내는 상태 코드
 */
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
