import { Router } from 'express';
import { getHealthStatus } from './health.controller';

const router = Router();

// 헬스체크 엔드포인트
router.get('/health', getHealthStatus);

export default router;
