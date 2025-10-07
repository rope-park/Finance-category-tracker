/**
 * 카테고리 추천 API Redis 캐싱 라우터
 * 
 * 카테고리 추천 API에 Redis 캐싱 기능을 적용한 Express 라우터.
 * 동일한 나이대와 직업군 조합에 대한 추천 결과를 캐싱하여 응답 속도 향상시킴.
 * 
 * 주요 기능:
 * - Redis 기반 추천 결과 캐싱 (10분 TTL)
 * - 캐시 히트/미스 상태를 클라이언트에 전달
 * - 나이대와 직업군 조합별 캐시 키 생성
 * - 캐시 미스 시 실시간 추천 알고리즘 호출
 * 
 * @author Ju Eul Park (rope-park)
 */
import express from 'express';
// import { getCache, setCache } from '../utils/redisClient';
import { recommendCategories } from './category.service';

const router = express.Router();

/**
 * GET /transactions/categories/recommend
 * 나이대와 직업군 기반 카테고리 추천 (Redis 캐싱 적용)
 * 
 * 사용자의 나이대와 직업군 정보를 받아 적절한 거래 카테고리 추천.
 * Redis 캐싱을 통해 동일한 조건의 반복 요청에 대한 응답 속도 개선.
 * 
 * Query Parameters:
 * - age_group: 사용자 연령대 (예: '20s', '30s')
 * - job_group: 사용자 직업군 (예: 'office_worker', 'student')
 * 
 * @route GET /transactions/categories/recommend
 * @access Public 
 * @return {Object} 추천 카테고리 목록 및 캐시 상태
 */
router.get('/categories/recommend', async (req, res) => {
  const age_group = String(req.query.age_group ?? '');
  const job_group = String(req.query.job_group ?? '');
  
  // 캐시 키 생성: 나이대와 직업군 조합으로 고유 키 생성
  // const cacheKey = `recommend:${age_group}:${job_group}`;
  
  // 캐시에서 기존 추천 결과 조회
  // const cached = await getCache(cacheKey);
  // if (cached) {
  //   return res.json({ data: cached, cached: true });
  // }
  
  // 캐시 미스 시 실시간 추천 알고리즘 실행
  const result = await recommendCategories(age_group, job_group);
  
  // 추천 결과를 캐시에 저장 (10분 TTL)
  // await setCache(cacheKey, result, 600);
  
  res.json({ data: result, cached: false });
});

export default router;
