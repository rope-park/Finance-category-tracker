/**
 * 분석 및 통계 API 라우트
 * 
 * 사용자의 금융 데이터에 대한 인사이트 제공.
 * 모든 라우트는 인증이 필요하며, 보안을 위해 Rate Limiting 적용.
 * 
 * 주요 엔드포인트:
 * - GET /summary: 전체 재정 요약 정보
 * - GET /trends: 지출 트렌드 분석
 * - GET /breakdown: 카테고리별 상세 분석
 *
 * @author Ju Eul Park (rope-park)
 */

import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { authenticateToken } from '../../shared/middleware/auth';

const router = Router();
const analyticsController = new AnalyticsController();

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

/**
 * GET api/analytics/summary
 * 전체 재정 요약 (수입, 지출, 잔액 등)
 *
 * 사용자의 전체 재정 상태를 요약하여 제공.
 *
 * @route GET api/analytics/summary
 * @access Private (인증 필요)
 * @rateLimit 사용자별 요청 빈도 제한 적용
 */
router.get('/summary', analyticsController.getAnalyticsSummary.bind(analyticsController));

/**
 * GET api/analytics/trends
 * 지출 트렌드 분석 (월별, 연도별)
 * 
 * 사용자 지출의 시간적 변화를 분석하여 월별, 연도별 트렌드를 제공.
 * 
 * @route GET api/analytics/trends
 * @access Private (인증 필요)
 * @rateLimit 사용자별 요청 빈도 제한 적용
 */
router.get('/trends', analyticsController.getSpendingTrends.bind(analyticsController));

/**
 * GET api/analytics/breakdown
 * 카테고리별 상세 분석
 * 
 * 사용자의 지출을 카테고리별로 상세히 분석하여 인사이트 제공.
 * 
 * @route GET api/analytics/breakdown
 * @access Private (인증 필요)
 * @rateLimit 사용자별 요청 빈도 제한 적용
 */
router.get('/breakdown', analyticsController.getCategoryInsights.bind(analyticsController));

export default router;