import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

// 에러 로깅 함수
const logError = (error: Error, req: Request) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent');
  const userId = (req as any).user?.userId || 'anonymous';

  console.error(`
=== ERROR LOG ===
Timestamp: ${timestamp}
Method: ${method}
URL: ${url}
IP: ${ip}
User ID: ${userId}
User Agent: ${userAgent}
Error Name: ${error.name}
Error Message: ${error.message}
Stack Trace: ${error.stack}
================
`);
};

// 운영 환경에서 민감한 정보 제거
const sanitizeError = (error: Error, isDevelopment: boolean) => {
  if (isDevelopment) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack
    };
  }

  // 운영 환경에서는 스택 트레이스 숨김
  return {
    name: error.name,
    message: error.message
  };
};

// 글로벌 에러 핸들러
export const globalErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // 에러 로깅
  logError(error, req);

  // AppError인 경우 (예상된 에러)
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: error.message,
      ...(isDevelopment && { details: sanitizeError(error, isDevelopment) })
    });
  }

  // JWT 에러 처리
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expired'
    });
  }

  // 데이터베이스 에러 처리
  if (error.name === 'DatabaseError' || (error as any).code) {
    const dbError = error as any;
    
    // PostgreSQL 에러 코드 매핑
    switch (dbError.code) {
      case '23505': // unique_violation
        return res.status(409).json({
          success: false,
          error: 'Resource already exists'
        });
      case '23503': // foreign_key_violation
        return res.status(400).json({
          success: false,
          error: 'Invalid reference'
        });
      case '23514': // check_violation
        return res.status(400).json({
          success: false,
          error: 'Invalid data format'
        });
      case '08006': // connection_failure
        return res.status(503).json({
          success: false,
          error: 'Database temporarily unavailable'
        });
      default:
        break;
    }
  }

  // Validation 에러 처리
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.message
    });
  }

  // 예상치 못한 에러 (500 Internal Server Error)
  return res.status(500).json({
    success: false,
    error: isDevelopment ? error.message : 'Internal server error',
    ...(isDevelopment && { details: sanitizeError(error, isDevelopment) })
  });
};

// 404 핸들러
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`
  });
};

// 비동기 에러 캐처
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};