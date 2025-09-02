import express from 'express';
import dotenv from 'dotenv';
import session from 'express-session';
import { testConnection } from './config/database';
import { globalErrorHandler, notFoundHandler } from './utils/errors';
import logger from './utils/logger';

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

import helmet from 'helmet';
import cors from 'cors';

// 환경 변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

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

// 성능 모니터링 (가장 먼저 적용)
app.use(performanceMonitoring);

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
app.use('/api/categories', categoryRoutes);
app.use('/api/category-recommend', categoryRecommendRoutes);
app.use('/api/category-recommend-cache', categoryRecommendCacheRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/prediction', predictionRoutes);
app.use('/api/recurring-templates', recurringTemplateRoutes);
app.use('/api/notifications', notificationRoutes);

// API 라우트에 rate limiting 적용
app.use('/api', apiLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);

app.use('/api/categories', categoryRoutes);
app.use('/api/categories', categoryRecommendRoutes);
app.use('/api/categories', categoryRecommendCacheRoutes);

app.use('/api/recurring-templates', recurringTemplateRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);

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
    const gracefulShutdown = (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);
      
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