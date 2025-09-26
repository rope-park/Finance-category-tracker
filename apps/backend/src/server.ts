import express from 'express';
import dotenv from 'dotenv';
import session from 'express-session';
import morgan from 'morgan';
import { testConnection } from './config/database';
import { globalErrorHandler, notFoundHandler } from './utils/errors';
import logger, { loggerHelpers } from './utils/logger';
import { cacheService } from './services/cacheService';
import { initSentry } from './utils/sentry';

// 보안 미들웨어
import { 
  generalRateLimit,
  authRateLimit,
  speedLimiter,
  corsOptions,
  helmetConfig,
  xssProtection,
  sqlInjectionProtection,
  securityHeadersValidation,
  ipFiltering,
  requestSizeLimits,
  apiLimiter
} from './middleware/security';

// 모니터링 미들웨어
import { 
  performanceMonitoring,
  getMetrics,
  healthCheck,
  databaseHealthCheck,
  resetMetrics,
  getSystemInfo
} from './utils/monitoring';

// 로깅 미들웨어
import { 
  apiLoggingMiddleware, 
  performanceLoggingMiddleware 
} from './middleware/logging';

// 메트릭 시스템
import { 
  metricsMiddleware, 
  metricsEndpoint,
  metricsHelpers 
} from './utils/metrics';

// API 문서화
import { conditionalSwagger } from './config/swagger';

// 라우트 import
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import transactionRoutes from './routes/transactions';
import budgetRoutes from './routes/budgets';
import goalRoutes from './routes/goal';
import categoryRoutes from './routes/categories';
import categoryRecommendRoutes from './routes/categoryRecommend';
import categoryRecommendCacheRoutes from './routes/categoryRecommend.cache';
import analyticsRoutes from './routes/analytics';
import predictionRoutes from './routes/prediction';
import recurringTemplateRoutes from './routes/recurringTemplates';
import notificationRoutes from './routes/notifications';
import educationRoutes from './routes/educationRoutes';
import socialRoutes from './routes/social';
import communityRoutes from './routes/community';
import performanceRoutes from './routes/performance';

import helmet from 'helmet';
import cors from 'cors';

// 환경 변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Sentry 초기화 (가장 먼저!)
initSentry(app);

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// 세션 설정
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-default-session-secret',
  saveUninitialized: false,
  resave: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24시간
  }
}));

// 보안 헤더 설정
app.use(helmetConfig);

// CORS 설정
app.use(cors(corsOptions));

// 요청 크기 제한
app.use(express.json({ limit: requestSizeLimits.json }));
app.use(express.urlencoded({ 
  extended: true, 
  limit: requestSizeLimits.urlencoded 
}));
app.use(express.raw({ limit: requestSizeLimits.raw }));

// HTTP 요청 로깅 (Morgan + Winston 통합)
const morganStream = {
  write: (message: string) => {
    const trimmed = message.trim();
    if (trimmed) {
      logger.http(trimmed);
    }
  }
};

// Morgan 설정 (요청 응답 시간과 상태 코드 포함)
app.use(morgan(
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms',
  { stream: morganStream }
));

// 성능 모니터링 (Sentry 다음으로 적용)
app.use(performanceMonitoring);
app.use(performanceLoggingMiddleware);

// 메트릭 수집 미들웨어
app.use(metricsMiddleware);

// API 로깅 미들웨어
app.use(apiLoggingMiddleware);

// 보안 미들웨어
app.use(ipFiltering);
app.use(securityHeadersValidation);
app.use(xssProtection);
app.use(sqlInjectionProtection);

// Rate Limiting
app.use(speedLimiter);
app.use(generalRateLimit);

// 인증 관련 엔드포인트에는 더 엄격한 Rate Limit 적용
app.use('/api/auth', authRateLimit);
// 모니터링 및 헬스체크 엔드포인트
app.get('/api/health', healthCheck);
app.get('/api/health/database', databaseHealthCheck);
app.get('/api/metrics', getMetrics);
app.get('/api/system', getSystemInfo);

// Prometheus 메트릭 엔드포인트
app.get('/metrics', metricsEndpoint);

// 개발 환경에서만 메트릭 리셋 허용
if (process.env.NODE_ENV !== 'production') {
  app.post('/api/metrics/reset', resetMetrics);
}

// API 문서화 설정
conditionalSwagger(app);

// API 라우트
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
// 추천 관련 라우터를 별도 경로로 분리
app.use('/api/recommend', categoryRecommendRoutes);
app.use('/api/recommend-cache', categoryRecommendCacheRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/prediction', predictionRoutes);
app.use('/api/recurring-templates', recurringTemplateRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/education', educationRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/performance', performanceRoutes);

// API 라우트에 rate limiting 적용
app.use('/api', apiLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);

// 404 핸들러
app.use(notFoundHandler);

// 404 핸들러
app.use(notFoundHandler);

// 글로벌 에러 핸들러
app.use(globalErrorHandler);

// 서버 시작
const startServer = async () => {
  try {
    logger.info('🚀 Starting Finance Tracker API Server...');
    
    // 데이터베이스 연결 테스트
    await testConnection();
    logger.info('✅ Database connection established');
    
    // Redis 캐시 연결 (선택적)
    try {
      await cacheService.connect();
      logger.info('✅ Redis cache connected');
    } catch (error) {
      logger.warn('⚠️  Redis cache connection failed (continuing without cache):', error);
    }
    
    // 테스트 환경에서는 서버를 시작하지 않음
    if (process.env.NODE_ENV === 'test') {
      logger.info('🧪 Test environment detected - server not started');
      return;
    }
    
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server started successfully on port ${PORT}`);
      logger.info(`📊 API endpoints: http://localhost:${PORT}/api`);
      logger.info(`📚 API documentation: http://localhost:${PORT}/api-docs`);
      logger.info(`💓 Health check: http://localhost:${PORT}/api/health`);
      logger.info(`📈 Metrics: http://localhost:${PORT}/api/metrics`);
      
      console.log('\n🚀 ========================================');
      console.log('🚀 Finance Tracker API Server Started!');
      console.log('🚀 ========================================');
      console.log(`📡 Server: http://localhost:${PORT}`);
      console.log(`� Docs: http://localhost:${PORT}/api-docs`);
      console.log(`💓 Health: http://localhost:${PORT}/api/health`);
      console.log(`📈 Metrics: http://localhost:${PORT}/api/metrics`);
      console.log('🚀 ========================================\n');
    });

    // 우아한 종료 처리
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);
      
      // Redis 연결 해제
      try {
        await cacheService.disconnect();
        logger.info('✅ Redis connection closed');
      } catch (error) {
        logger.warn('⚠️  Redis disconnection warning:', error);
      }
      
      server.close((err) => {
        if (err) {
          logger.error('Error during server shutdown:', { error: err.message });
          process.exit(1);
        }
        
        logger.info('✅ Server closed successfully');
        process.exit(0);
      });
      
      // 30초 후 강제 종료
      setTimeout(() => {
        logger.error('❌ Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
  } catch (error) {
    logger.error('❌ Failed to start server:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    process.exit(1);
  }
};

// 테스트 환경이 아닐 때만 서버 시작
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;