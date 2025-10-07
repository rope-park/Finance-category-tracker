/**
 * 금융 교육 API 라우트
 * 
 * 사용자의 금융 리터러시 향상을 위한 교육 컨텐츠 제공.
 * 개인 맞춤형 조언과 단계별 학습 코스를 제공.
 * 
 * 주요 기능:
 * - 난이도별 교육 컨텐츠 제공
 * - 개인화된 금융 조언 생성
 * - 학습 진도 추적 및 인증
 * - 저축 및 투자 팁 제공
 * 
 * @author Ju Eul Park (rope-park)
 */

import { Router } from 'express';
import { EducationController } from './education.controller';
import { authenticateToken } from '../../shared/middleware/auth';
import { validateRequest } from '../../shared/middleware/validateRequest';
import { body, param, query } from 'express-validator';

const router = Router();
const educationController = new EducationController();

// 전체 라우트에 인증 미들웨어 적용 (개인 맞춤형 컨텐츠를 위해)
router.use(authenticateToken);

/**
 * GET api/education/content
 * 교육 컨텐츠 목록 조회 (카테고리, 난이도, 페이지네이션 지원)
 * 
 * 사용자의 관심사와 수준에 맞는 교육 컨텐츠 목록 제공.
 * 
 * @route GET api/education/content
 * @access Private (인증 필요)
 * @rateLimit 사용자별 요청 빈도 제한 적용
 */
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

/**
 * GET api/education/content/featured
 * 추천 교육 컨텐츠 조회
 * 
 * 사용자의 학습 이력과 선호도를 기반으로 추천 컨텐츠 제공.
 * 
 * @route GET api/education/content/featured
 * @access Private (인증 필요)
 * @rateLimit 사용자별 요청 빈도 제한 적용
 */
router.get(
  '/content/featured',
  educationController.getFeaturedContent
);

/**
 * GET api/education/content/search
 * 교육 컨텐츠 검색
 * 
 * 키워드 기반 교육 컨텐츠 검색 기능 제공.
 * 
 * @route GET api/education/content/search
 * @access Private (인증 필요)
 * @rateLimit 사용자별 요청 빈도 제한 적용
 */
router.get(
  '/content/search',
  [
    query('q').notEmpty().isString().withMessage('검색어를 입력해주세요.')
  ],
  validateRequest,
  educationController.searchContent
);

/**
 * GET api/education/content/:id
 * 특정 교육 컨텐츠 상세 조회
 * 
 * 컨텐츠의 상세 정보, 작성자, 관련 자료 등을 제공.
 * 
 * @route GET api/education/content/:id
 * @access Private (인증 필요)
 * @rateLimit 사용자별 요청 빈도 제한 적용
 */
router.get(
  '/content/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('유효한 콘텐츠 ID를 입력해주세요.')
  ],
  validateRequest,
  educationController.getContentById
);

/**
 * POST api/education/content/:contentId/progress
 * 사용자 진행 상황 관련 라우트
 * 
 * 사용자가 각 교육 컨텐츠에서의 학습 진도를 기록하고 조회.
 * 
 * @route POST api/education/content/:contentId/progress
 * @access Private (인증 필요)
 * @rateLimit 사용자별 요청 빈도 제한 적용
 */
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

/**
 * GET api/education/summary
 * 교육 요약 정보 조회
 * 
 * 사용자의 전체 교육 이력, 완료한 코스, 평균 점수 등 요약 정보 제공.
 * 
 * @route GET api/education/summary
 * @access Private (인증 필요)
 * @rateLimit 사용자별 요청 빈도 제한 적용
 */
router.get(
  '/summary',
  educationController.getEducationSummary
);

/**
 * GET api/education/health-score
 * 재정 건강도 점수 관련 라우트
 * 
 * 사용자의 재정 건강도 점수를 계산하고 추적.
 * 신용 점수, 부채 수준, 저축률 등을 종합적으로 평가.
 * 
 * @route GET api/education/health-score
 * @access Private (인증 필요)
 * @rateLimit 사용자별 요청 빈도 제한 적용
 */
router.get(
  '/health-score',
  educationController.getHealthScore
);

/**
 * GET api/education/health-score/history
 * 재정 건강도 점수 이력 조회
 * 
 * 사용자의 재정 건강도 점수 변화를 시간에 따라 추적.
 * 월별/분기별 점수 변동과 주요 영향 요인 분석.
 * 
 * @route GET api/education/health-score/history
 * @access Private (인증 필요)
 * @rateLimit 사용자별 요청 빈도 제한 적용
 */
router.get(
  '/health-score/history',
  educationController.getHealthScoreHistory
);

/**
 * GET api/education/saving-tips
 * 절약 팁 관련 라우트
 * 
 * 일상 생활에서 실천할 수 있는 다양한 절약 팁 제공.
 * 사용자의 소비 패턴에 맞춘 개인화된 팁 추천.
 * 
 * @route GET api/education/saving-tips
 * @access Private (인증 필요)
 * @rateLimit 사용자별 요청 빈도 제한 적용
 */
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

/**
 * POST api/education/saving-tips/:tipId/rate
 * 절약 팁 평가 및 피드백
 * 
 * 사용자가 제공된 절약 팁에 대해 평가하고 피드백을 남길 수 있음.
 * 이를 통해 팁의 유용성을 개선하고 개인화된 추천에 반영.
 * 
 * @route POST api/education/saving-tips/:tipId/rate
 * @access Private (인증 필요)
 * @rateLimit 사용자별 요청 빈도 제한 적용
 */
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

/**
 * GET api/education/advice
 * 개인화된 조언 조회
 * 
 * 사용자의 재정 상태와 목표에 맞춘 개인화된 금융 조언 제공.
 * 
 * @route GET api/education/advice
 * @access Private (인증 필요)
 * @rateLimit 사용자별 요청 빈도 제한 적용
 */
router.get(
  '/advice',
  educationController.getPersonalizedAdvice
);

/**
 * POST api/education/advice/generate
 * 개인화된 조언 생성
 * 
 * 사용자의 최신 재정 데이터를 기반으로 새로운 개인화된 조언 생성.
 * 
 * @route POST api/education/advice/generate
 * @access Private (인증 필요)
 * @rateLimit 사용자별 요청 빈도 제한 적용
 */
router.post(
  '/advice/generate',
  educationController.generateAdvice
);

/**
 * POST api/education/advice/:adviceId/read
 * 조언 읽음 표시
 * 
 * 사용자가 특정 조언을 읽었음을 표시.
 * 
 * @route POST api/education/advice/:adviceId/read
 * @access Private (인증 필요)
 * @rateLimit 사용자별 요청 빈도 제한 적용
 */
router.post(
  '/advice/:adviceId/read',
  [
    param('adviceId').isInt({ min: 1 }).withMessage('유효한 조언 ID를 입력해주세요.')
  ],
  validateRequest,
  educationController.markAdviceAsRead
);

/**
 * POST api/education/advice/:adviceId/dismiss
 * 조언 무시 표시
 * 
 * 사용자가 특정 조언을 더 이상 보고 싶지 않음을 표시.
 * 
 * @route POST api/education/advice/:adviceId/dismiss
 * @access Private (인증 필요)
 * @rateLimit 사용자별 요청 빈도 제한 적용
 */
router.post(
  '/advice/:adviceId/dismiss',
  [
    param('adviceId').isInt({ min: 1 }).withMessage('유효한 조언 ID를 입력해주세요.')
  ],
  validateRequest,
  educationController.dismissAdvice
);

/**
 * GET api/education/dashboard
 * 교육 대시보드
 * 
 * 사용자의 교육 활동, 진행 상황, 성과를 한눈에 볼 수 있는 대시보드 제공.
 * 
 * @route GET api/education/dashboard
 * @access Private (인증 필요)
 * @rateLimit 사용자별 요청 빈도 제한 적용
 */
router.get(
  '/dashboard',
  educationController.getEducationDashboard
);

export default router;
