import { Request, Response, Router } from 'express';
import { CategoryRecommendService } from '../services/categoryRecommendService';

const router = Router();

/**
 * @route GET /api/categories/recommend
 * @desc 나이대, 직업군별 기본 카테고리 추천
 * @query age_group, job_group
 */
router.get('/recommend', (req: Request, res: Response) => {
  const { age_group, job_group } = req.query;
  if (!age_group) {
    return res.status(400).json({ success: false, error: 'age_group 파라미터가 필요합니다.' });
  }
  const categories = CategoryRecommendService.recommendCategories(String(age_group), String(job_group || 'etc'));
  res.json({ success: true, data: { recommended_categories: categories } });
});

export default router;
