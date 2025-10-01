// TODO: 카테고리 추천 API에 Redis 캐싱 적용 (Express 라우터)
import express from 'express';
// import { getCache, setCache } from '../utils/redisClient';
import { recommendCategories } from './category.service';

const router = express.Router();

router.get('/categories/recommend', async (req, res) => {
  const age_group = String(req.query.age_group ?? '');
  const job_group = String(req.query.job_group ?? '');
  // const cacheKey = `recommend:${age_group}:${job_group}`;
  // const cached = await getCache(cacheKey);
  // if (cached) {
  //   return res.json({ data: cached, cached: true });
  // }
  const result = await recommendCategories(age_group, job_group);
  // await setCache(cacheKey, result, 600); // 10분 캐싱
  res.json({ data: result, cached: false });
});

export default router;
