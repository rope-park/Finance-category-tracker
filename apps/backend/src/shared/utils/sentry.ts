/**
 * Sentry 오류 모니터링 및 성능 추적 시스템
 * 
 * 실시간 오류 및 예외 상황 모니터링을 위한 Sentry 통합 설정.
 * 프로덕션 환경에서 발생하는 오류를 자동으로 추적하고 분석하여 빠른 대응을 지원.
 * 
 * 주요 기능:
 * - 전역 오류 및 예외 상황 자동 추적
 * - API 성능 및 응답시간 모니터링
 * - 사용자 행동 및 비즈니스 로직 오류 추적
 * - 데이터베이스 연결 및 쿼리 오류 모니터링
 * - Node.js 프로파일링 및 성능 분석
 * 
 * @author Ju Eul Park (rope-park)
 */
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { Express } from 'express';

/**
 * Sentry 오류 모니터링 시스템 초기화
 * 
 * Express 애플리케이션에 Sentry 모니터링을 통합하고 설정.
 * 환경별로 다른 설정을 적용하여 개발/운영 환경에 맞게 최적화.
 * 
 * @param app - Express 애플리케이션 인스턴스
 */
export const initSentry = (app: Express) => {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    
    // 성능 모니터링 샘플링 비율
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // 프로파일링 샘플링 비율
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    integrations: [
      Sentry.httpIntegration(),
      
      nodeProfilingIntegration(),
      
      Sentry.expressIntegration(),
    ],
    
    // 에러 필터링
    beforeSend(event, hint) {
      // 프로덕션에서 특정 오류 필터링
      if (process.env.NODE_ENV === 'production') {
        const error = hint.originalException;

        // 404 오류 무시
        if (event.request?.url && event.tags?.['http.status_code'] === '404') {
          return null;
        }

        // 특정 오류 유형 무시
        if (error instanceof Error) {
          if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
            return null;
          }
        }
      }
      
      return event;
    },
    
    // 추가 메타데이터
    release: process.env.npm_package_version,
    serverName: process.env.SERVER_NAME || 'finance-tracker-backend',
  });

  // 요청 핸들러는 가장 먼저 미들웨어로 설정해야 함
  app.use(Sentry.expressErrorHandler());

  return Sentry;
};

export const captureException = Sentry.captureException;
export const captureMessage = Sentry.captureMessage;
export const addBreadcrumb = Sentry.addBreadcrumb;
export const setUser = Sentry.setUser;
export const setTag = Sentry.setTag;
export const setContext = Sentry.setContext;
