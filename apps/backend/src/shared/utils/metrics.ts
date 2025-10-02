import promClient from 'prom-client';
import { Request, Response, NextFunction } from 'express';

// Prometheus 기본 메트릭 활성화
promClient.collectDefaultMetrics();

// 커스텀 메트릭 정의
export const metrics = {
  // HTTP 요청 메트릭
  httpRequestsTotal: new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code', 'user_id']
  }),

  httpRequestDuration: new promClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.5, 1, 2, 5, 10]
  }),

  // 데이터베이스 메트릭
  dbQueriesTotal: new promClient.Counter({
    name: 'database_queries_total',
    help: 'Total number of database queries',
    labelNames: ['operation', 'table', 'status']
  }),

  dbQueryDuration: new promClient.Histogram({
    name: 'database_query_duration_seconds',
    help: 'Duration of database queries in seconds',
    labelNames: ['operation', 'table'],
    buckets: [0.001, 0.01, 0.1, 0.5, 1, 2]
  }),

  // 비즈니스 로직 메트릭
  transactionsCreated: new promClient.Counter({
    name: 'transactions_created_total',
    help: 'Total number of transactions created',
    labelNames: ['category', 'type', 'user_id']
  }),

  budgetsExceeded: new promClient.Counter({
    name: 'budgets_exceeded_total',
    help: 'Total number of budget limit exceeded events',
    labelNames: ['category', 'user_id']
  }),

  activeUsers: new promClient.Gauge({
    name: 'active_users_current',
    help: 'Current number of active users',
    labelNames: ['time_window']
  }),

  // 에러 메트릭
  errorsTotal: new promClient.Counter({
    name: 'errors_total',
    help: 'Total number of errors',
    labelNames: ['type', 'operation', 'severity']
  }),

  // 캐시 메트릭
  cacheHits: new promClient.Counter({
    name: 'cache_hits_total',
    help: 'Total number of cache hits',
    labelNames: ['cache_type', 'key_pattern']
  }),

  cacheMisses: new promClient.Counter({
    name: 'cache_misses_total',
    help: 'Total number of cache misses',
    labelNames: ['cache_type', 'key_pattern']
  }),

  // 시스템 리소스 메트릭
  memoryUsage: new promClient.Gauge({
    name: 'nodejs_memory_usage_bytes',
    help: 'Node.js memory usage in bytes',
    labelNames: ['type']
  }),

  // 사용자 활동 메트릭
  userLogins: new promClient.Counter({
    name: 'user_logins_total',
    help: 'Total number of user logins',
    labelNames: ['success', 'method']
  }),

  socialActions: new promClient.Counter({
    name: 'social_actions_total',
    help: 'Total number of social interactions',
    labelNames: ['action_type', 'feature']
  })
};

// 메트릭 미들웨어
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // 요청 시작 시점 기록
  res.on('finish', () => {
    const duration = (Date.now() - startTime) / 1000;
    const route = req.route?.path || req.path;
    const userId = (req as any).user?.id || 'anonymous';

    // HTTP 요청 메트릭 기록
    metrics.httpRequestsTotal.inc({
      method: req.method,
      route,
      status_code: res.statusCode.toString(),
      user_id: userId
    });

    metrics.httpRequestDuration.observe(
      {
        method: req.method,
        route,
        status_code: res.statusCode.toString()
      },
      duration
    );
  });

  next();
};

// 메트릭 엔드포인트
export const metricsEndpoint = async (req: Request, res: Response) => {
  try {
    // 실시간 메모리 사용량 업데이트
    const memUsage = process.memoryUsage();
    metrics.memoryUsage.set({ type: 'rss' }, memUsage.rss);
    metrics.memoryUsage.set({ type: 'heapTotal' }, memUsage.heapTotal);
    metrics.memoryUsage.set({ type: 'heapUsed' }, memUsage.heapUsed);
    metrics.memoryUsage.set({ type: 'external' }, memUsage.external);

    const prometheusMetrics = await promClient.register.metrics();
    res.set('Content-Type', promClient.register.contentType);
    res.end(prometheusMetrics);
  } catch (error) {
    console.error('Error generating metrics:', error);
    res.status(500).json({ error: 'Failed to generate metrics' });
  }
};

// 메트릭 헬퍼 함수들
export const metricsHelpers = {
  // 데이터베이스 쿼리 메트릭
  recordDatabaseQuery: (operation: string, table: string, duration: number, success: boolean = true) => {
    metrics.dbQueriesTotal.inc({
      operation,
      table,
      status: success ? 'success' : 'error'
    });

    if (success) {
      metrics.dbQueryDuration.observe({ operation, table }, duration / 1000);
    }
  },

  // 트랜잭션 생성 메트릭
  recordTransactionCreated: (category: string, type: string, userId: string) => {
    metrics.transactionsCreated.inc({ category, type, user_id: userId });
  },

  // 예산 초과 메트릭
  recordBudgetExceeded: (category: string, userId: string) => {
    metrics.budgetsExceeded.inc({ category, user_id: userId });
  },

  // 에러 메트릭
  recordError: (type: string, operation: string, severity: 'low' | 'medium' | 'high' | 'critical') => {
    metrics.errorsTotal.inc({ type, operation, severity });
  },

  // 캐시 메트릭
  recordCacheHit: (cacheType: string, keyPattern: string) => {
    metrics.cacheHits.inc({ cache_type: cacheType, key_pattern: keyPattern });
  },

  recordCacheMiss: (cacheType: string, keyPattern: string) => {
    metrics.cacheMisses.inc({ cache_type: cacheType, key_pattern: keyPattern });
  },

  // 사용자 로그인 메트릭
  recordUserLogin: (success: boolean, method: string = 'password') => {
    metrics.userLogins.inc({ success: success.toString(), method });
  },

  // 소셜 활동 메트릭
  recordSocialAction: (actionType: string, feature: string) => {
    metrics.socialActions.inc({ action_type: actionType, feature });
  },

  // 활성 사용자 업데이트 (배치로 실행)
  updateActiveUsers: (count: number, timeWindow: string = '24h') => {
    metrics.activeUsers.set({ time_window: timeWindow }, count);
  }
};

// 메트릭 리셋 (개발/테스트 환경용)
export const resetMetrics = () => {
  if (process.env.NODE_ENV !== 'production') {
    promClient.register.clear();
    promClient.collectDefaultMetrics();
  }
};

export default {
  metrics,
  metricsMiddleware,
  metricsEndpoint,
  metricsHelpers,
  resetMetrics
};
