/**
 * 카테고리 추천 API 라우트
 * 
 * 사용자 개인 특성 바탕의 맞춤형 거래 카테고리를 추천하는 API 엔드포인트 제공.
 * 
 * 주요 기능:
 * - 나이대별 맞춤 카테고리 추천
 * - 직업군별 특화 카테고리 제안
 * - 통계 기반 인기 카테고리 제공
 * - 개인화된 지출 패턴 분석
 * 
 * @author Ju Eul Park (rope-park)
 */

import { Request, Response, Router } from 'express';
import { CategoryRecommendService } from './category-recommend.service';

const router = Router();

/**
 * GET /api/transactions/recommend/
 * 카테고리 추천 서비스 상태 확인
 * 
 * @route GET /api/recommend/
 * @access Public
 * @description 카테고리 추천 API의 동작 상태를 확인하는 헬스체크 엔드포인트
 * @return {Object} 서비스 상태 메시지
 */
router.get('/', (req: Request, res: Response) => {
  res.json({ 
    success: true, 
    message: 'Category Recommend Router is working!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/transactions/recommend/categories
 * 개인화된 카테고리 추천
 *
 * 사용자의 나이대와 직업군 정보를 바탕으로 가장 적합한 거래 카테고리들 추천.
 *
 * @route GET /api/recommend/categories
 * @access Public
 * @description 나이대, 직업군별 맞춤형 카테고리 추천 제공
 * 
 * @param {string} age_group - 사용자 나이대 (필수)
 *   - 가능한 값: '10s', '20s', '30s', '40s', '50s', '60s+'
 * @param {string} job_group - 사용자 직업군 (선택)
 *   - 가능한 값: 'student', 'office_worker', 'freelancer', 'housewife', 'retired', 'etc'
 * @return {Object} 추천 카테고리 목록과 우선순위 정보
 */
router.get('/categories', (req: Request, res: Response) => {
  try {
    const { age_group, job_group } = req.query;
    
    // 필수 파라미터 검증
    if (!age_group) {
      return res.status(400).json({ 
        success: false, 
        error: 'age_group 파라미터가 필요합니다.',
        message: '나이대 정보를 제공해주세요. (예: 10s, 20s, 30s, 40s, 50s, 60s+)'
      });
    }
    
    // 서비스를 통해 추천 카테고리 생성
    const categories = CategoryRecommendService.recommendCategories(
      String(age_group), 
      String(job_group || 'etc')
    );
    
    // 성공 응답 반환
    res.json({ 
      success: true, 
      data: { 
        recommended_categories: categories,
        metadata: {
          age_group: String(age_group),
          job_group: String(job_group || 'etc'),
          generated_at: new Date().toISOString()
        }
      },
      message: '카테고리 추천이 성공적으로 생성되었습니다.'
    });
  } catch (error) {
    console.error('카테고리 추천 오류:', error);
    res.status(500).json({
      success: false,
      error: '카테고리 추천 중 오류가 발생했습니다.',
      message: '서버 내부 오류입니다. 잠시 후 다시 시도해주세요.'
    });
  }
});

export default router;