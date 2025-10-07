/**
 * Finance Category Tracker - 메인 서버 파일
 * 
 * 주요 기능:
 * - Express 앱 설정 및 미들웨어 구성
 * - 보안, 로깅, 모니터링 설정
 * - API 라우트 등록
 * - 데이터베이스 연결 관리
 * - 우아한 종료 처리
 * 
 * @author Ju Eul Park (rope-park)
 */

// 기본 Express 및 미들웨어 import
const express = require('express');
const dotenv = require('dotenv');
const session = require('express-session');
const morgan = require('morgan');
const cors = require('cors');
import helmet from 'helmet';

// 핵심 설정 및 데이터베이스
import { testConnection } from './core/config/database';
import { globalErrorHandler, notFoundHandler } from './shared/utils/errors';
import logger, { loggerHelpers } from './shared/utils/logger'; // 경로 최적화
import { cacheService } from './shared/services/cacheService';
import { initSentry } from './shared/utils/sentry';

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
} from './shared/middleware/security';

// 모니터링 미들웨어
import { 
  performanceMonitoring,
  getMetrics,
  healthCheck,
  databaseHealthCheck,
  resetMetrics,
  getSystemInfo
} from './shared/utils/monitoring';

// 로깅 미들웨어
import { 
  apiLoggingMiddleware, 
  performanceLoggingMiddleware 
} from './shared/middleware/logging';

// 메트릭 시스템
import { 
  metricsMiddleware, 
  metricsEndpoint,
  metricsHelpers 
} from './shared/utils/metrics';

// API 문서화
import { conditionalSwagger } from './core/config/swagger';

// Feature 라우트들 import
import authRoutes from './features/auth/auth.routes';
import userRoutes from './features/users/user.routes';
import transactionRoutes from './features/transactions/transaction.routes';
import budgetRoutes from './features/budgets/budget.routes';
import goalRoutes from './features/budgets/goal.routes'; // 경로 최적화
import categoryRoutes from './features/transactions/category.routes';
import categoryRecommendRoutes from './features/transactions/category-recommend.routes';
import categoryRecommendCacheRoutes from './features/transactions/category-recommend.cache';
import analyticsRoutes from './features/analytics/analytics.routes';
import predictionRoutes from './features/analytics/prediction.routes';
import recurringTemplateRoutes from './features/transactions/recurring-template.routes';
import notificationRoutes from './features/notifications/notification.routes';
import educationRoutes from './features/education/education.routes';
import socialRoutes from './features/social/social.routes';
import communityRoutes from './features/community/community.routes';
import performanceRoutes from './features/analytics/performance.routes';

// ==================================================
// 서버 초기화 및 기본 설정
// ==================================================

// 환경 변수 로드 (가장 먼저 실행)
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Sentry 초기화 (에러 추적을 위해 가장 먼저 설정)
initSentry(app);

// 프록시 신뢰 설정 (실제 IP 주소 획득용)
app.set('trust proxy', 1);

// ==================================================
// 세션 및 보안 설정
// ==================================================

// 세션 설정 (사용자 인증 상태 유지용)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-default-session-secret',
  saveUninitialized: false, // 초기화되지 않은 세션 저장 안함
  resave: false, // 변경되지 않은 세션 재저장 안함
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS 전용 (프로덕션)
    httpOnly: true, // XSS 공격 방지
    maxAge: 24 * 60 * 60 * 1000 // 24시간 만료
  }
}));

// 보안 헤더 설정 (Helmet)
app.use(helmetConfig);

// CORS 설정 (크로스 오리진 요청 허용)
app.use(cors(corsOptions));

// ==================================================
// 요청 파싱 및 크기 제한
// ==================================================

// JSON 파싱 및 크기 제한
app.use(express.json({ limit: requestSizeLimits.json }));
// URL 인코딩된 데이터 파싱
app.use(express.urlencoded({ 
  extended: true, // 중첩된 객체 허용
  limit: requestSizeLimits.urlencoded 
}));
// Raw 데이터 파싱
app.use(express.raw({ limit: requestSizeLimits.raw }));

// ==================================================
// HTTP 요청 로깅 설정
// ==================================================

// Morgan과 Winston 통합용 스트림
const morganStream = {
  write: (message: string) => {
    const trimmed = message.trim();
    if (trimmed) {
      logger.http(trimmed); // Winston HTTP 레벨로 로깅
    }
  }
};

// Morgan 설정 (상세한 요청/응답 정보 로깅)
app.use(morgan(
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms',
  { stream: morganStream }
));

// ==================================================
// 성능 모니터링 및 메트릭 수집
// ==================================================

// 성능 모니터링 (응답 시간, 메모리 사용량 등)
app.use(performanceMonitoring);
app.use(performanceLoggingMiddleware);

// 메트릭 수집 (Prometheus 형식)
app.use(metricsMiddleware);

// API 요청/응답 로깅
app.use(apiLoggingMiddleware);

// ==================================================
// 보안 미들웨어 적용
// ==================================================

// IP 필터링 (악성 IP 차단)
app.use(ipFiltering);
// 보안 헤더 검증
app.use(securityHeadersValidation);
// XSS 공격 방지
app.use(xssProtection);
// SQL 인젝션 방지
app.use(sqlInjectionProtection);

// ==================================================
// Rate Limiting (요청 빈도 제한)
// ==================================================

// 속도 제한 (DDoS 방지)
app.use(speedLimiter);
// 일반적인 요청 빈도 제한
app.use(generalRateLimit);

// 인증 관련 엔드포인트에는 더 엄격한 Rate Limit 적용
app.use('/api/auth', authRateLimit);

// ==================================================
// 시스템 모니터링 엔드포인트
// ==================================================

// 기본 헬스 체크
app.get('/api/health', healthCheck);
// 데이터베이스 헬스 체크
app.get('/api/health/database', databaseHealthCheck);
// 애플리케이션 메트릭 조회
app.get('/api/metrics', getMetrics);
// 시스템 정보 조회
app.get('/api/system', getSystemInfo);

// Prometheus 메트릭 엔드포인트 (외부 모니터링 도구용)
app.get('/metrics', metricsEndpoint);

// 개발 환경에서만 메트릭 리셋 허용 (디버깅용)
if (process.env.NODE_ENV !== 'production') {
  app.post('/api/metrics/reset', resetMetrics);
}

// ==================================================
// API 문서화 설정 (Swagger)
// ==================================================
conditionalSwagger(app);

// ==================================================
// API 라우트 등록
// ==================================================

// 핵심 기능 라우트
app.use('/api/auth', authRoutes);           // 인증 관련
app.use('/api/users', userRoutes);          // 사용자 관리
app.use('/api/transactions', transactionRoutes); // 거래 내역
app.use('/api/budgets', budgetRoutes);      // 예산 관리
app.use('/api/goals', goalRoutes);          // 목표 관리

// 카테고리 및 추천 시스템
app.use('/api/categories', categoryRoutes);
app.use('/api/recommend', categoryRecommendRoutes);     // 카테고리 추천
app.use('/api/recommend-cache', categoryRecommendCacheRoutes); // 추천 캐시

// 분석 및 예측
app.use('/api/analytics', analyticsRoutes);    // 분석 데이터
app.use('/api/prediction', predictionRoutes);  // 예측 기능
app.use('/api/performance', performanceRoutes); // 성능 분석

// 부가 기능
app.use('/api/recurring-templates', recurringTemplateRoutes); // 반복 거래 템플릿
app.use('/api/notifications', notificationRoutes);    // 알림 시스템
app.use('/api/education', educationRoutes);           // 교육 컨텐츠
app.use('/api/social', socialRoutes);                 // 소셜 기능
app.use('/api/community', communityRoutes);           // 커뮤니티

// 전체 API에 공통 rate limiting 적용
app.use('/api', apiLimiter);

// ==================================================
// 에러 핸들링
// ==================================================

// 404 에러 핸들러 (존재하지 않는 라우트)
app.use(notFoundHandler);

// 글로벌 에러 핸들러 (모든 에러 처리)
app.use(globalErrorHandler);

// ==================================================
// 서버 시작 및 초기화
// ==================================================

const startServer = async () => {
  try {
    logger.info('🚀 Finance Tracker API 서버 시작 중...');
    
    // 데이터베이스 연결 테스트 (서버 시작 전 필수 확인)
    await testConnection();
    logger.info('✅ 데이터베이스 연결 성공');
    
    // Redis 캐시 연결 (선택적, 실패해도 서버는 계속 동작)
    try {
      await cacheService.connect();
      logger.info('✅ Redis 캐시 연결 성공');
    } catch (error) {
      logger.warn('⚠️  Redis 캐시 연결 실패 (캐시 없이 계속 진행):', error);
    }
    
    // 테스트 환경에서는 서버를 시작하지 않음 (테스트 격리)
    if (process.env.NODE_ENV === 'test') {
      logger.info('🧪 테스트 환경 감지 - 서버 시작 건너뜀');
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