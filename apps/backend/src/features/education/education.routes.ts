import { Router } from 'express';
import { EducationController } from './education.controller';
import { authenticateToken } from '../../shared/middleware/auth';
import { validateRequest } from '../../shared/middleware/validateRequest';
import { body, param, query } from 'express-validator';

const router = Router();
const educationController = new EducationController();

// 인증이 필요한 라우트에 authenticateToken 적용
router.use(authenticateToken);

// 교육 콘텐츠 관련 라우트
router.get(
  '/content',
  [
    query('category').optional().isString(),
    query('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  validateRequest,
  educationController.getEducationContent
);

router.get(
  '/content/featured',
  educationController.getFeaturedContent
);

router.get(
  '/content/search',
  [
    query('q').notEmpty().isString().withMessage('검색어를 입력해주세요.')
  ],
  validateRequest,
  educationController.searchContent
);

router.get(
  '/content/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('유효한 콘텐츠 ID를 입력해주세요.')
  ],
  validateRequest,
  educationController.getContentById
);

// 사용자 진행 상황 관련 라우트
router.post(
  '/content/:contentId/progress',
  [
    param('contentId').isInt({ min: 1 }).withMessage('유효한 콘텐츠 ID를 입력해주세요.'),
    body('completionRate').isFloat({ min: 0, max: 100 }).withMessage('완료율은 0-100 사이의 값이어야 합니다.'),
    body('timeSpentMinutes').optional().isInt({ min: 0 }).withMessage('학습 시간은 0 이상의 정수여야 합니다.'),
    body('quizScore').optional().isFloat({ min: 0, max: 100 }).withMessage('퀴즈 점수는 0-100 사이의 값이어야 합니다.'),
    body('isCompleted').optional().isBoolean(),
    body('notes').optional().isString().isLength({ max: 1000 }).withMessage('노트는 1000자 이하로 입력해주세요.')
  ],
  validateRequest,
  educationController.updateProgress
);

router.get(
  '/summary',
  educationController.getEducationSummary
);

// 재정 건강도 점수 관련 라우트
router.get(
  '/health-score',
  educationController.getHealthScore
);

router.get(
  '/health-score/history',
  educationController.getHealthScoreHistory
);

// 절약 팁 관련 라우트
router.get(
  '/saving-tips',
  [
    query('category').optional().isString(),
    query('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']),
    query('personalized').optional().isBoolean()
  ],
  validateRequest,
  educationController.getSavingTips
);

router.post(
  '/saving-tips/:tipId/rate',
  [
    param('tipId').isInt({ min: 1 }).withMessage('유효한 팁 ID를 입력해주세요.'),
    body('isHelpful').isBoolean().withMessage('도움 여부는 boolean 값이어야 합니다.'),
    body('feedback').optional().isString().isLength({ max: 500 }).withMessage('피드백은 500자 이하로 입력해주세요.')
  ],
  validateRequest,
  educationController.rateSavingTip
);

// 개인화된 조언 관련 라우트
router.get(
  '/advice',
  educationController.getPersonalizedAdvice
);

router.post(
  '/advice/generate',
  educationController.generateAdvice
);

router.post(
  '/advice/:adviceId/read',
  [
    param('adviceId').isInt({ min: 1 }).withMessage('유효한 조언 ID를 입력해주세요.')
  ],
  validateRequest,
  educationController.markAdviceAsRead
);

router.post(
  '/advice/:adviceId/dismiss',
  [
    param('adviceId').isInt({ min: 1 }).withMessage('유효한 조언 ID를 입력해주세요.')
  ],
  validateRequest,
  educationController.dismissAdvice
);

// 교육 대시보드
router.get(
  '/dashboard',
  educationController.getEducationDashboard
);

export default router;
