/**
 * 전역 오류 처리 미들웨어
 * 
 * Express.js 애플리케이션에서 발생하는 모든 오류를 중앙집중식으로 처리.
 * 예측 가능한 비즈니스 오류와 예상치 못한 시스템 오류를 구분하여 처리.
 * 
 * 주요 기능:
 * - 전역 오류 상황 로깅 및 모니터링
 * - 비즈니스 오류와 시스템 오류의 차별화된 처리
 * - 보안 카치 및 민감한 정보 노출 방지
 * - 클라이언트 친화적 오류 메시지 제공
 * 
 * @author Ju Eul Park (rope-park)
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

/**
 * 오류 로깅 유틸리티 함수
 * 
 * 발생한 오류의 상세 정보를 구조적으로 로깅하여 디버깅과 모니터링을 지원.
 * 요청 정보(메서드, URL, IP 등)와 함께 오류 상세 내역을 기록.
 * 
 * @param error - 발생한 오류 객체
 * @param req - 오류가 발생한 HTTP 요청 객체
 */
const logError = (error: Error, req: Request) => {
  const timestamp = new Date().toISOString();         // 에러 발생 시간
  const method = req.method;                          // HTTP 메서드 (GET, POST 등)
  const url = req.originalUrl;                        // 요청된 URL 경로
  const ip = req.ip || req.connection.remoteAddress;  // 클라이언트 IP 주소
  const userAgent = req.get('User-Agent');            // 클라이언트 브라우저 정보
  const userId = (req as any).user?.userId || 'anonymous';  // 인증된 사용자 ID

  // 구조적인 오류 로그 출력 (디버깅 및 모니터링용)
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