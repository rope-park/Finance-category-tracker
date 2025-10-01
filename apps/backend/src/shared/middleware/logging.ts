import { Request, Response, NextFunction } from 'express';
import logger, { loggerHelpers } from '../utils/logger';

// 사용자 ID 추출 헬퍼 (JWT 토큰에서)
const getUserId = (req: Request): string | undefined => {
  return (req as any).user?.id || (req as any).userId;
};

// API 요청/응답 로깅 미들웨어
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

// 에러 캐치 미들웨어 (라우트 핸들러용)
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

// 성능 모니터링 미들웨어
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

// 사용자 액션 로깅 헬퍼
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

// 데이터베이스 연산 로깅 데코레이터
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
