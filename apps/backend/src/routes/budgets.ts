import express from 'express';
import { 
  createBudget, 
  getBudgets, 
  getBudget, 
  updateBudget, 
  deleteBudget,
  getCurrentMonthBudgetSummary
} from '../controllers/budgetController';
import { authenticateToken, requireProfileCompleted } from '../middleware/auth';
import { validateBudgetData } from '../middleware/validation';

const router = express.Router();

// 모든 예산 관련 API는 인증과 프로필 완성이 필요
router.use(authenticateToken, requireProfileCompleted);

// 예산 생성 (데이터 검증 포함)
router.post('/', validateBudgetData, createBudget);

// 예산 목록 조회
router.get('/', getBudgets);

// 현재 월 예산 현황 요약
router.get('/summary/current-month', getCurrentMonthBudgetSummary);

// 단일 예산 조회 (실제 지출과 비교)
router.get('/:id', getBudget);

// 예산 수정 (부분 데이터 검증)
router.patch('/:id', updateBudget);

// 예산 삭제
router.delete('/:id', deleteBudget);

export default router;