/**
 * 성능 모니터링 및 분석 API 라우트
 * 
 * 애플리케이션의 실시간 성능 지표를 수집하고 분석하는 API 엔드포인트.
 * 시스템 리소스 사용량, 응답 시간, 처리량 등의 메트릭을 제공하여 모니터링 및 성능 최적화 가능.
 * 
 * 주요 기능:
 * - Node.js 프로세스 성능 메트릭 수집
 * - 메모리 사용량 및 CPU 사용률 모니터링
 * - 시스템 가동 시간 및 안정성 지표 제공
 * - 실시간 성능 데이터 API 제공
 * 
 * 모니터링 지표:
 * - uptime: 서버 가동 시간
 * - memory: 힙 메모리 사용량 (used, total, external)
 * - cpu: CPU 사용 시간 (user, system)
 * - timestamp: 메트릭 수집 시점
 * 
 * @author Ju Eul Park (rope-park)
 */
import { Router } from 'express';
import { authenticateToken } from '../../shared/middleware/auth';

const router = Router();

// 모든 성능 모니터링 API에 인증 미들웨어 적용
router.use(authenticateToken);

/**
 * GET /api/analytics/performance/metrics
 * 시스템 성능 메트릭 조회 API
 * 
 * Node.js 프로세스의 실시간 성능 지표를 수집하여 반환.
 * 
 * @route GET /api/analytics/performance/metrics
 * @access Private (인증 필요)
 * @returns {Object} 시스템 성능 메트릭 데이터
 */
router.get('/metrics', async (req, res) => {
  try {
    // Node.js 프로세스의 기본 성능 메트릭 수집
    const metrics = {
      timestamp: new Date().toISOString(),   // 메트릭 수집 시점
      uptime: process.uptime(),               // 프로세스 가동 시간 (초)
      memory: process.memoryUsage(),          // 메모리 사용량 상세 정보
      cpu: process.cpuUsage()                 // CPU 사용 시간 정보
    };

    res.json({
      success: true,
      data: metrics,
      message: 'Performance metrics retrieved',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get performance metrics',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;