import { Request, Response, Router } from 'express';
import { CategoryRecommendService } from './category-recommend.service';

const router = Router();

// 테스트용 기본 경로
router.get('/', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Category Recommend Router is working!' });
});

/**
 * @route GET /api/recommend/categories
 * @desc 나이대, 직업군별 기본 카테고리 추천
 * @query age_group, job_group
 */
router.get('/categories', (req: Request, res: Response) => {
  const { age_group, job_group } = req.query;
  if (!age_group) {
    return res.status(400).json({ success: false, error: 'age_group 파라미터가 필요합니다.' });
  }
  const categories = CategoryRecommendService.recommendCategories(String(age_group), String(job_group || 'etc'));
  res.json({ success: true, data: { recommended_categories: categories } });
});

export default router;