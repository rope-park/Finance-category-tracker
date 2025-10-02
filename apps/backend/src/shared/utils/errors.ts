import { Request, Response, NextFunction } from 'express';
import logger from './logger';

// 커스텀 에러 클래스들
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errorCode?: string;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number,
    isOperational: boolean = true,
    errorCode?: string,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errorCode = errorCode;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, true, 'VALIDATION_ERROR', details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = '인증이 필요합니다.') {
    super(message, 401, true, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = '권한이 없습니다.') {
    super(message, 403, true, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = '리소스') {
    super(`${resource}를 찾을 수 없습니다.`, 404, true, 'NOT_FOUND_ERROR');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, true, 'CONFLICT_ERROR');
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 500, true, 'DATABASE_ERROR', details);
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message?: string) {
    super(
      message || `외부 서비스 ${service}에서 오류가 발생했습니다.`,
      503,
      true,
      'EXTERNAL_SERVICE_ERROR',
      { service }
    );
  }
}

// 에러 로깅 함수
const logError = (error: Error, req: Request) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent');
  const userId = (req as any).user?.id || 'anonymous';

  // 요청 정보와 함께 에러 로깅
  logger.error('Request Error', {
    timestamp,
    method,
    url,
    ip,
    userId,
    userAgent,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(error instanceof AppError && {
        statusCode: error.statusCode,
        errorCode: error.errorCode,
        details: error.details,
        isOperational: error.isOperational
      })
    }
  });
};

// 운영 환경에서 민감한 정보 제거
const sanitizeError = (error: Error, isDevelopment: boolean) => {
  const baseError = {
    success: false,
    message: error.message,
    timestamp: new Date().toISOString()
  };

  if (error instanceof AppError) {
    return {
      ...baseError,
      errorCode: error.errorCode,
      ...(error.details && { details: error.details }),
      ...(isDevelopment && { stack: error.stack })
    };
  }

  // 운영 환경에서는 내부 에러 메시지 숨김
  if (!isDevelopment) {
    return {
      ...baseError,
      message: '서버 내부 오류가 발생했습니다.',
      errorCode: 'INTERNAL_SERVER_ERROR'
    };
  }

  return {
    ...baseError,
    errorCode: 'INTERNAL_SERVER_ERROR',
    stack: error.stack
  };
};

// 비동기 함수 래퍼 (try-catch 자동 처리)
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 전역 에러 핸들러
export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 에러 로깅
  logError(err, req);

  // AppError인 경우
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(
      sanitizeError(err, process.env.NODE_ENV !== 'production')
    );
  }

  // MongoDB 중복 키 에러
  if (err.name === 'MongoError' && (err as any).code === 11000) {
    const duplicateKeyError = new ConflictError('이미 존재하는 데이터입니다.');
    return res.status(duplicateKeyError.statusCode).json(
      sanitizeError(duplicateKeyError, process.env.NODE_ENV !== 'production')
    );
  }

  // JWT 에러들
  if (err.name === 'JsonWebTokenError') {
    const jwtError = new AuthenticationError('유효하지 않은 토큰입니다.');
    return res.status(jwtError.statusCode).json(
      sanitizeError(jwtError, process.env.NODE_ENV !== 'production')
    );
  }

  if (err.name === 'TokenExpiredError') {
    const expiredError = new AuthenticationError('토큰이 만료되었습니다.');
    return res.status(expiredError.statusCode).json(
      sanitizeError(expiredError, process.env.NODE_ENV !== 'production')
    );
  }

  // PostgreSQL 에러들
  if (err.name === 'QueryFailedError' || (err as any).code?.startsWith?.('23')) {
    const dbError = new DatabaseError('데이터베이스 오류가 발생했습니다.');
    return res.status(dbError.statusCode).json(
      sanitizeError(dbError, process.env.NODE_ENV !== 'production')
    );
  }

  // 기본 500 에러
  const internalError = new AppError(
    '서버 내부 오류가 발생했습니다.',
    500,
    false,
    'INTERNAL_SERVER_ERROR'
  );

  res.status(500).json(
    sanitizeError(internalError, process.env.NODE_ENV !== 'production')
  );
};

// 404 핸들러
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const notFoundError = new NotFoundError(`경로 ${req.originalUrl}`);
  next(notFoundError);
};

// 처리되지 않은 Promise 거부 처리
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection', {
    reason,
    promise,
    stack: reason instanceof Error ? reason.stack : undefined
  });
  
  // 우아한 종료
  process.exit(1);
});

// 처리되지 않은 예외 처리
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack
  });
  
  // 우아한 종료
  process.exit(1);
});

// SIGTERM 신호 처리 (우아한 종료)
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

// SIGINT 신호 처리 (Ctrl+C)
process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});
