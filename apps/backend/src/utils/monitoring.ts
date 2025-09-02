import { Request, Response, NextFunction } from 'express';
import os from 'os';
import process from 'process';
import { performance } from 'perf_hooks';
import logger from '../utils/logger';

// 성능 메트릭 인터페이스
interface PerformanceMetrics {
  requestCount: number;
  responseTime: {
    min: number;
    max: number;
    avg: number;
    total: number;
  };
  errors: number;
  activeConnections: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
  systemLoad: number[];
  uptime: number;
}

// 성능 메트릭 저장소
class MetricsCollector {
  private metrics: PerformanceMetrics;
  private metricsInterval?: NodeJS.Timeout;
  private responseTimes: number[];
  private maxResponseTimeHistory: number;
  private lastCpuUsage: NodeJS.CpuUsage;

  constructor() {
    this.metrics = {
      requestCount: 0,
      responseTime: {
        min: Infinity,
        max: 0,
        avg: 0,
        total: 0
      },
      errors: 0,
      activeConnections: 0,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      systemLoad: os.loadavg(),
      uptime: process.uptime()
    };
    this.responseTimes = [];
    this.maxResponseTimeHistory = 1000; // 최대 1000개의 응답 시간 기록
    this.lastCpuUsage = process.cpuUsage();

    // 테스트 환경이 아닐 때만 주기적으로 시스템 메트릭 업데이트
    if (process.env.NODE_ENV !== 'test') {
      this.metricsInterval = setInterval(() => {
        this.updateSystemMetrics();
      }, 5000); // 5초마다 업데이트
    }
  }

  // 정리 메서드 추가
  public cleanup() {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = undefined;
    }
  }

  private updateSystemMetrics() {
    this.metrics.memoryUsage = process.memoryUsage();
    this.metrics.cpuUsage = process.cpuUsage(this.lastCpuUsage);
    this.metrics.systemLoad = os.loadavg();
    this.metrics.uptime = process.uptime();
    this.lastCpuUsage = process.cpuUsage();
  }

  recordRequest() {
    this.metrics.requestCount++;
    this.metrics.activeConnections++;
  }

  recordResponse(responseTime: number, isError: boolean = false) {
    this.metrics.activeConnections = Math.max(0, this.metrics.activeConnections - 1);
    
    if (isError) {
      this.metrics.errors++;
    }

    // 응답 시간 기록
    this.responseTimes.push(responseTime);
    if (this.responseTimes.length > this.maxResponseTimeHistory) {
      this.responseTimes.shift();
    }

    // 응답 시간 통계 업데이트
    this.metrics.responseTime.total += responseTime;
    this.metrics.responseTime.min = Math.min(this.metrics.responseTime.min, responseTime);
    this.metrics.responseTime.max = Math.max(this.metrics.responseTime.max, responseTime);
    this.metrics.responseTime.avg = this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length;
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  getDetailedMetrics() {
    const metrics = this.getMetrics();
    
    return {
      ...metrics,
      responseTimePercentiles: this.calculatePercentiles(),
      errorRate: (metrics.errors / metrics.requestCount) * 100,
      requestsPerSecond: metrics.requestCount / metrics.uptime,
      memoryUsageMB: {
        rss: Math.round(metrics.memoryUsage.rss / 1024 / 1024 * 100) / 100,
        heapTotal: Math.round(metrics.memoryUsage.heapTotal / 1024 / 1024 * 100) / 100,
        heapUsed: Math.round(metrics.memoryUsage.heapUsed / 1024 / 1024 * 100) / 100,
        external: Math.round(metrics.memoryUsage.external / 1024 / 1024 * 100) / 100
      },
      cpuUsagePercent: {
        user: (metrics.cpuUsage.user / 1000000) * 100,
        system: (metrics.cpuUsage.system / 1000000) * 100
      },
      systemInfo: {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        totalMemory: Math.round(os.totalmem() / 1024 / 1024),
        freeMemory: Math.round(os.freemem() / 1024 / 1024),
        cpuCores: os.cpus().length
      }
    };
  }

  private calculatePercentiles() {
    if (this.responseTimes.length === 0) {
      return { p50: 0, p90: 0, p95: 0, p99: 0 };
    }

    const sorted = [...this.responseTimes].sort((a, b) => a - b);
    const len = sorted.length;

    return {
      p50: sorted[Math.floor(len * 0.5)],
      p90: sorted[Math.floor(len * 0.9)],
      p95: sorted[Math.floor(len * 0.95)],
      p99: sorted[Math.floor(len * 0.99)]
    };
  }

  reset() {
    this.metrics.requestCount = 0;
    this.metrics.responseTime = {
      min: Infinity,
      max: 0,
      avg: 0,
      total: 0
    };
    this.metrics.errors = 0;
    this.responseTimes = [];
  }
}

// 전역 메트릭 수집기
const metricsCollector = new MetricsCollector();

// 성능 모니터링 미들웨어
export const performanceMonitoring = (req: Request, res: Response, next: NextFunction) => {
  const startTime = performance.now();
  
  // 요청 기록
  metricsCollector.recordRequest();
  
  // 요청 정보 로깅
  logger.http('Request started', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id || 'anonymous'
  });

  // 응답 완료 시 처리
  const originalSend = res.send;
  res.send = function(body) {
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    const isError = res.statusCode >= 400;
    
    // 응답 기록
    metricsCollector.recordResponse(responseTime, isError);
    
    // 응답 정보 로깅
    logger.http('Request completed', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: Math.round(responseTime * 100) / 100,
      contentLength: res.get('Content-Length') || 0,
      userId: (req as any).user?.id || 'anonymous'
    });

    // 느린 요청 경고
    if (responseTime > 1000) {
      logger.warn('Slow request detected', {
        method: req.method,
        url: req.originalUrl,
        responseTime: Math.round(responseTime * 100) / 100,
        userId: (req as any).user?.id || 'anonymous'
      });
    }

    return originalSend.call(this, body);
  };

  next();
};

// 메트릭 수집 라우트
export const getMetrics = (req: Request, res: Response) => {
  try {
    const metrics = metricsCollector.getDetailedMetrics();
    
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error retrieving metrics', {
      error: error instanceof Error ? error.message : String(error)
    });
    
    res.status(500).json({
      success: false,
      message: '메트릭 조회 중 오류가 발생했습니다.',
      errorCode: 'METRICS_ERROR'
    });
  }
};

// 간단한 헬스체크
export const healthCheck = (req: Request, res: Response) => {
  try {
    const metrics = metricsCollector.getMetrics();
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    // 헬스 상태 계산
    const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    const avgResponseTime = metrics.responseTime.avg;
    const errorRate = (metrics.errors / Math.max(metrics.requestCount, 1)) * 100;
    
    let status = 'healthy';
    const issues = [];
    
    // 메모리 사용률 체크 (80% 초과 시 경고)
    if (memoryUsagePercent > 80) {
      status = 'warning';
      issues.push(`High memory usage: ${Math.round(memoryUsagePercent)}%`);
    }
    
    // 평균 응답 시간 체크 (1초 초과 시 경고)
    if (avgResponseTime > 1000) {
      status = 'warning';
      issues.push(`Slow response time: ${Math.round(avgResponseTime)}ms`);
    }
    
    // 에러율 체크 (5% 초과 시 경고)
    if (errorRate > 5) {
      status = 'warning';
      issues.push(`High error rate: ${Math.round(errorRate)}%`);
    }
    
    // 메모리 사용률이 90% 초과하거나 에러율이 20% 초과 시 unhealthy
    if (memoryUsagePercent > 90 || errorRate > 20) {
      status = 'unhealthy';
    }

    res.status(status === 'unhealthy' ? 503 : 200).json({
      status,
      timestamp: new Date().toISOString(),
      uptime: Math.round(uptime),
      issues,
      metrics: {
        memoryUsagePercent: Math.round(memoryUsagePercent * 100) / 100,
        avgResponseTime: Math.round(avgResponseTime * 100) / 100,
        errorRate: Math.round(errorRate * 100) / 100,
        requestCount: metrics.requestCount,
        activeConnections: metrics.activeConnections
      }
    });
  } catch (error) {
    logger.error('Health check failed', {
      error: error instanceof Error ? error.message : String(error)
    });
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: '헬스체크 수행 중 오류가 발생했습니다.'
    });
  }
};

// 데이터베이스 헬스체크 (database.ts의 checkConnection 사용)
export const databaseHealthCheck = async (req: Request, res: Response) => {
  try {
    // database.ts에서 가져올 checkConnection 함수 (실제 구현에서는 import 필요)
    const { checkConnection } = await import('../config/database');
    
    const dbStatus = await checkConnection();
    
    res.json({
      status: dbStatus.isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      database: dbStatus
    });
  } catch (error) {
    logger.error('Database health check failed', {
      error: error instanceof Error ? error.message : String(error)
    });
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: '데이터베이스 헬스체크 실패'
    });
  }
};

// 메트릭 리셋 (개발/테스트 환경에서만 사용)
export const resetMetrics = (req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: '프로덕션 환경에서는 메트릭을 리셋할 수 없습니다.',
      errorCode: 'FORBIDDEN'
    });
  }

  metricsCollector.reset();
  
  res.json({
    success: true,
    message: '메트릭이 리셋되었습니다.',
    timestamp: new Date().toISOString()
  });
};

// 시스템 정보 조회
export const getSystemInfo = (req: Request, res: Response) => {
  try {
    const metrics = metricsCollector.getDetailedMetrics();
    
    res.json({
      success: true,
      data: {
        system: metrics.systemInfo,
        memory: metrics.memoryUsageMB,
        cpu: metrics.cpuUsagePercent,
        load: metrics.systemLoad,
        uptime: metrics.uptime,
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error retrieving system info', {
      error: error instanceof Error ? error.message : String(error)
    });
    
    res.status(500).json({
      success: false,
      message: '시스템 정보 조회 중 오류가 발생했습니다.',
      errorCode: 'SYSTEM_INFO_ERROR'
    });
  }
};

// 경고 임계값 모니터링
let thresholdMonitorInterval: NodeJS.Timeout;

const monitorThresholds = () => {
  if (process.env.NODE_ENV === 'test') {
    return; // 테스트 환경에서는 모니터링 비활성화
  }

  thresholdMonitorInterval = setInterval(() => {
    const metrics = metricsCollector.getDetailedMetrics();
    const memoryUsagePercent = (metrics.memoryUsage.heapUsed / metrics.memoryUsage.heapTotal) * 100;
    
    // 메모리 사용률 90% 초과 시 경고
    if (memoryUsagePercent > 90) {
      logger.warn('High memory usage detected', {
        memoryUsagePercent: Math.round(memoryUsagePercent * 100) / 100,
        heapUsed: metrics.memoryUsageMB.heapUsed,
        heapTotal: metrics.memoryUsageMB.heapTotal
      });
    }
    
    // 평균 응답 시간 2초 초과 시 경고
    if (metrics.responseTime.avg > 2000) {
      logger.warn('High response time detected', {
        avgResponseTime: Math.round(metrics.responseTime.avg * 100) / 100,
        maxResponseTime: Math.round(metrics.responseTime.max * 100) / 100,
        requestCount: metrics.requestCount
      });
    }
    
    // 에러율 10% 초과 시 경고
    const errorRate = metrics.errorRate;
    if (errorRate > 10) {
      logger.warn('High error rate detected', {
        errorRate: Math.round(errorRate * 100) / 100,
        errors: metrics.errors,
        totalRequests: metrics.requestCount
      });
    }
  }, 60000); // 1분마다 체크
};

// 모니터링 정리 함수
export const cleanupMonitoring = () => {
  if (thresholdMonitorInterval) {
    clearInterval(thresholdMonitorInterval);
  }
  metricsCollector.cleanup();
};

// 모니터링 시작
monitorThresholds();

export { metricsCollector };
