
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { Request, Response } from 'express';

// Request 인터페이스 확장 (타입 안전)
declare global {
  namespace Express {
    interface Request {
      rateLimit?: {
        resetTime?: number;
        remaining?: number;
        limit?: number;
      };
    }
  }
}

// 상황별 keyGenerator
const userKey = (req: Request): string => {
  // 테스트 환경에서는 rate limiting 비활성화
  if (process.env.NODE_ENV === 'test') {
    return 'test-key';
  }
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

// API Rate Limiting (IP+userId)
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

// Auth Rate Limiting (IP+email, 성공시 카운트 X)
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

// Strict Rate Limiting (IP+userId)
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

// Register Rate Limiting (IP만)
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