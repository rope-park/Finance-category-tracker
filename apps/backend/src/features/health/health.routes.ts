/**
 * 시스템 헬스체크 API 라우트
 * 
 * 어플리케이션의 전반적인 상태를 모니터링하기 위한 REST API 엔드포인트.
 * 로드 밸런서, 모니터링 도구, 운영 팀에서 서비스 가용성을 실시간으로 확인하는 데 사용.
 * 
 * @author Ju Eul Park (rope-park)
 */

import { Router } from 'express';
import { getHealthStatus } from './health.controller';

const router = Router();

/**
 * GET /health
 * 시스템 헬스체크
 * 
 * 시스템의 주요 컴포넌트 상태 점검 및 서비스가 정상적으로 운영 중인지 확인.
 * 
 * @route GET /health
 * @access Public
 * @return {Object} 시스템 상태 정보 (uptime, database, dependencies 등)
 */
router.get('/health', getHealthStatus);

export default router;
