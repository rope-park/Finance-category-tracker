/**
 * API 로깅 미들웨어
 * 
 * Express.js 애플리케이션의 모든 HTTP 요청과 응답을 체계적으로 로깅하는 미들웨어.
 * 보안, 성능 모니터링, 디버깅을 위한 종합적인 로깅 시스템 제공.
 * 
 * 주요 기능:
 * - 모든 API 요청/응답 자동 로깅
 * - 요청 시간 추적 및 성능 모니터링
 * - 민감한 데이터 자동 마스킹
 * - 사용자별 요청 추적
 * - 에러 및 예외 상황 상세 로깅
 * - 보안 감사 추적 (IP, User-Agent)
 * 
 * 로깅 레벨:
 * - INFO: 일반적인 API 요청/응답
 * - WARN: 4xx 에러 (클라이언트 오류)
 * - ERROR: 5xx 에러 (서버 오류)
 * - DEBUG: 상세한 디버깅 정보
 * 
 * 보안 기능:
 * - 비밀번호, 토큰 등 민감 데이터 자동 마스킹
 * - IP 주소 추적으로 비정상 접근 감지
 * - User-Agent 로깅으로 디바이스 타입 추적
 * - 사용자 ID 기반 요청 패턴 분석
 * 
 * @author Ju Eul Park (rope-park)
 */
import { Request, Response, NextFunction } from 'express';
import logger, { loggerHelpers } from '../utils/logger';

/**
 * 요청에서 사용자 ID를 추출하는 헬퍼 함수
 * JWT 토큰에서 디코딩된 사용자 정보를 통해 ID 추출
 * 
 * @param req - HTTP 요청 객체
 * @returns 사용자 ID (문자열) 또는 undefined
 */
const getUserId = (req: Request): string | undefined => {
  return (req as any).user?.id || (req as any).userId;
};

/**
 * API 요청/응답을 체계적으로 로깅하는 미들웨어
 * 
 * 모든 HTTP 요청에 대해 시작 시점과 완료 시점을 로깅하고,
 * 응답 시간, 상태 코드, 사용자 정보 등을 추적.
 * 
 * @param req - HTTP 요청 객체
 * @param res - HTTP 응답 객체
 * @param next - 다음 미들웨어로 전달하는 함수
 */
export const apiLoggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const userId = getUserId(req);

  // 요청 로깅
  logger.info('API Request started', {
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId,
    body: req.method !== 'GET' ? sanitizeBody(req.body) : undefined
  });

  // 응답 완료 시 로깅
  const originalSend = res.send;
  res.send = function(data) {
    const responseTime = Date.now() - startTime;
    
    loggerHelpers.logApiRequest(
      req.method,
      req.originalUrl,
      res.statusCode,
      responseTime,
      userId
    );

    // 에러 상태 코드인 경우 추가 로깅
    if (res.statusCode >= 400) {
      logger.warn('API Request completed with error', {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        responseTime: `${responseTime}ms`,
        userId,
        response: res.statusCode >= 500 ? undefined : sanitizeResponse(data)
      });
    }

    return originalSend.call(this, data);
  };

  next();
};

// 민감한 정보 제거 함수
const sanitizeBody = (body: any): any => {
  if (!body || typeof body !== 'object') return body;
  
  const sanitized = { ...body };
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth'];
  
  Object.keys(sanitized).forEach(key => {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      sanitized[key] = '[REDACTED]';
    }
  });
  
  return sanitized;
};

// 응답 데이터 민감 정보 제거 함수
const sanitizeResponse = (data: any): any => {
  try {
    if (typeof data === 'string') {
      const parsed = JSON.parse(data);
      return sanitizeBody(parsed);
    }
    return sanitizeBody(data);
  } catch {
    return '[RESPONSE_NOT_JSON]';
  }
};

/**
 * 에러 캐치 미들웨어 (라우트 핸들러용)
 * 
 * 비동기 라우트 핸들러에서 발생하는 에러를 중앙에서 처리.
 * 에러 발생 시 상세 정보를 로깅하고, 다음 미들웨어로 에러 전달.
 * 
 * @param fn - 비동기 라우트 핸들러 함수
 * @returns 미들웨어 함수
 */
export const asyncErrorHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error: Error) => {
      // 비즈니스 로직 에러 로깅
      loggerHelpers.logBusinessError(
        `${req.method} ${req.originalUrl}`,
        error,
        {
          userId: getUserId(req),
          body: sanitizeBody(req.body),
          params: req.params,
          query: req.query
        }
      );
      next(error);
    });
  };
};

/**
 * 성능 모니터링 미들웨어
 * 
 * 모든 API 요청에 대해 처리 시간을 측정하고,
 * 일정 시간 이상 소요되는 요청에 대해 별도 로깅.
 * 
 * @param req - HTTP 요청 객체
 * @param res - HTTP 응답 객체
 * @param next - 다음 미들웨어로 전달하는 함수
 */
export const performanceLoggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = process.hrtime.bigint();
  
  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1_000_000; // 밀리초로 변환
    
    // 느린 요청 로깅 (500ms 이상)
    if (duration > 500) {
      loggerHelpers.logPerformanceMetric(
        'slow_request',
        duration,
        'ms',
        {
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          userId: getUserId(req)
        }
      );
    }
  });
  
  next();
};

/**
 * 사용자 액션 로깅
 * 
 * 사용자별 주요 액션(로그인, 로그아웃, 데이터 변경 등)을 로깅하여
 * 추후 분석 및 모니터링에 활용.
 *
 * @param req - HTTP 요청 객체
 * @param action - 사용자 액션 이름
 * @param details - 추가 정보
 */
export const logUserAction = (req: Request, action: string, details?: any) => {
  const userId = getUserId(req);
  if (userId) {
    loggerHelpers.logUserAction(userId, action, {
      ...details,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * 데이터베이스 연산 로깅 데코레이터
 * 
 * 데이터베이스 연산 메서드에 적용하여, 연산 시작/종료 시점과 소요 시간을 자동으로 로깅.
 * 
 * @param operation - 데이터베이스 연산 타입 (예: 'SELECT', 'INSERT', 'UPDATE', 'DELETE')
 * @returns 메서드 데코레이터
 */
export const logDatabaseOperation = (operation: string) => {
  return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      
      try {
        const result = await method.apply(this, args);
        const duration = Date.now() - startTime;
        
        loggerHelpers.logDatabaseQuery(
          `${operation} in ${target.constructor.name}.${propertyName}`,
          duration
        );
        
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        
        loggerHelpers.logDatabaseQuery(
          `${operation} in ${target.constructor.name}.${propertyName}`,
          duration,
          error as Error
        );
        
        throw error;
      }
    };
    
    return descriptor;
  };
};

export default {
  apiLoggingMiddleware,
  asyncErrorHandler,
  performanceLoggingMiddleware,
  logUserAction,
  logDatabaseOperation
};
