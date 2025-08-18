import express from 'express';
import { 
  createTransaction, 
  getTransactions, 
  getTransaction, 
  updateTransaction, 
  deleteTransaction,
  getMonthlyStats
} from '../controllers/transactionController';
import { authenticateToken, requireProfileCompleted } from '../middleware/auth';
import { validateTransactionData } from '../middleware/validation';

const router = express.Router();

// 모든 거래 관련 API는 인증과 프로필 완성이 필요
router.use(authenticateToken, requireProfileCompleted);

// 거래 내역 생성 (데이터 검증 포함)
router.post('/', validateTransactionData, createTransaction);

// 거래 내역 목록 조회 (필터링 가능)
router.get('/', getTransactions);

// 월별 통계 조회
router.get('/stats/monthly', getMonthlyStats);

// 단일 거래 내역 조회
router.get('/:id', getTransaction);

// 거래 내역 수정 (부분 데이터 검증)
router.patch('/:id', updateTransaction);

// 거래 내역 삭제
router.delete('/:id', deleteTransaction);

export default router;