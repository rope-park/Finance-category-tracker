/**
 * Rate Limiting 미들웨어
 * 
 * API 요청 빈도를 제한하여 서버 과부하와 DDoS 공격을 방지.
 * 다양한 엔드포인트별로 서로 다른 제한 정책을 적용하여 보안성 강화.
 * 
 * 주요 기능:
 * - IP 기반 요청 빈도 제한 (15분당 100개 요청)
 * - 사용자 기반 요청 빈도 제한 (인증된 사용자)
 * - 이메일 기반 인증 시도 제한 (15분당 5번)
 * - 민감한 작업 엄격 제한 (1시간당 3번)
 * - Rate Limit 초과 시 상세한 로깅 및 모니터링
 * - 각 제한별 사용자 친화적 오류 메시지
 * 
 * 제한 정책:
 * - 일반 API: 15분당 100개 요청
 * - 로그인 API: 15분당 5개 요청
 * - 민감한 작업: 1시간당 3개 요청
 * - 테스트 환경: 제한 완화 (개발 편의성)
 * 
 * @author Ju Eul Park (rope-park)
 */

import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Express Request 인터페이스 확장
 * 
 * rate limiter에서 사용하는 요청 제한 관련 메타데이터를 Request 객체에 추가.
 * TypeScript 타입 안전성을 보장하고 rate limiting 기능의 일관성을 유지.
 */
declare global {
  namespace Express {
    interface Request {
      rateLimit?: {
        resetTime?: number;    // 제한 초기화 시간 (Unix timestamp)
        remaining?: number;    // 남은 요청 횟수
        limit?: number;        // 제한 기간 내 최대 요청 횟수
      };
    }
  }
}

/**
 * 사용자 기반 요청 식별 키 생성 함수
 * 
 * 인증된 사용자는 사용자 ID로, 비인증 사용자는 IP 주소로 식별.
 * 테스트 환경에서는 rate limiting을 비활성화하여 테스트 안정성 보장.
 * 
 * @param req - HTTP 요청 객체
 * @returns 요청 식별을 위한 고유 키 문자열
 */
const userKey = (req: Request): string => {
  // 테스트 환경에서는 rate limiting 기능을 비활성화
  if (process.env.NODE_ENV === 'test') {
    return 'test-key';
  }
  
  // 인증된 사용자의 경우 사용자 ID 사용, 그렇지 않으면 IP 주소 사용
  const userId = (req as any).user?.userId;
  const ip = ipKeyGenerator(req.ip);
  return userId ? `${ip}:${userId}` : ip;
};
const ipKey = (req: Request): string => {
  // 테스트 환경에서는 rate limiting 비활성화
  if (process.env.NODE_ENV === 'test') {
    return 'test-key';
  }
  return ipKeyGenerator(req.ip);
};
const emailKey = (req: Request): string => {
  // 테스트 환경에서는 rate limiting 비활성화
  if (process.env.NODE_ENV === 'test') {
    return 'test-key';
  }
  const ip = ipKeyGenerator(req.ip);
  const email = req.body?.email || 'unknown';
  return `${ip}:${email}`;
};

// 표준화된 handler (Retry-After 헤더, 로깅)
function rateLimitHandler(type: string, windowMs: number) {
  return (req: Request, res: Response) => {
    const resetTime = req.rateLimit?.resetTime || Date.now() + windowMs;
    res.set('Retry-After', Math.ceil((resetTime - Date.now()) / 1000).toString());
    // 로그 예시: console.log(`[RateLimit][${type}]`, req.method, req.originalUrl, req.ip, (req as any).user?.userId);
    res.status(429).json({
      success: false,
      error: `Too many requests (${type}). Please try again later.`,
      retryAfter: Math.round((resetTime - Date.now()) / 1000)
    });
  };
}

// 환경별 옵션
const isTest = process.env.NODE_ENV === 'test';

/**
 * 일반 API Rate Limiting (IP+userId)
 * 
 * 인증된 사용자와 비인증 사용자 모두에 대해 15분당 100개의 요청으로 제한.
 * 서버 과부하 방지 및 DDoS 공격 완화.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 1000 : 100,
  keyGenerator: userKey,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('api', 15 * 60 * 1000)
});

/**
 * 인증 시도 Rate Limiting (IP+email)
 * 
 * 로그인, 비밀번호 재설정 등 인증 관련 엔드포인트에 대해 엄격한 제한 적용.
 * 브루트포스 공격 및 계정 탈취 시도 방지.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 100 : 5,
  keyGenerator: emailKey,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    error: 'Too many login attempts from this IP/email, please try again later.',
  },
  handler: rateLimitHandler('auth', 15 * 60 * 1000)
});

/**
 * 민감한 작업 Rate Limiting (IP+userId)
 * 
 * 비밀번호 변경, 이메일 변경 등 민감한 작업에 대해 엄격한 제한 적용.
 * 사용자 계정 보호 및 무단 액세스 방지.
 */
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 100 : 3,
  keyGenerator: userKey,
  message: {
    success: false,
    error: 'Too many requests for sensitive operation.',
  },
  handler: rateLimitHandler('strict', 15 * 60 * 1000)
});

/**
 * 회원가입 Rate Limiting (IP 기반)
 * 
 * 회원가입 시도 빈도를 제한하여 봇 공격 및 남용 방지.
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isTest ? 100 : 3,
  keyGenerator: ipKey,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    error: 'Too many registration attempts from this IP.',
  },
  handler: rateLimitHandler('register', 60 * 60 * 1000)
});