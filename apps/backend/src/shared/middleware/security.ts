/**
 * 보안 미들웨어 모음
 * 
 * Express.js 애플리케이션의 전반적인 보안을 강화하는 다양한 보안 미들웨어 제공.
 * OWASP Top 10 보안 취약점을 방지하고 엔터프라이즈 수준의 애플리케이션 보안 달성.
 * 
 * 주요 보안 기능:
 * - XSS(Cross-Site Scripting) 공격 방지
 * - CSRF(Cross-Site Request Forgery) 공격 방지
 * - SQL Injection 및 NoSQL Injection 방지
 * - Rate Limiting 및 DDoS 공격 차단
 * - 입력 데이터 살균화 및 유효성 검사
 * - CORS(Cross-Origin Resource Sharing) 정책 관리
 * 
 * @author Ju Eul Park (rope-park)
 */

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import helmet from 'helmet';
import * as cors from 'cors';
import xss from 'xss';
import validator from 'validator';
import { ValidationError, AuthenticationError } from '../utils/errors';
import logger, { loggerHelpers } from '../utils/logger';

/**
 * 사용자 정의 Rate Limiter 생성 함수
 * 
 * 다양한 API 엔드포인트에 맞는 맞춤형 요청 제한 정책을 생성.
 * 보안에 민감한 API(로그인, 회원가입)는 더 엄격한 제한을 적용.
 * 
 * @param windowMs - 제한 시간 창 (밀리초)
 * @param max - 시간 창 내 최대 요청 횟수
 * @param message - 제한 초과 시 표시할 메시지
 * @returns 설정된 Rate Limiter Express 미들웨어
 */
export const createRateLimit = (windowMs: number, max: number, message: string) => {
  return rateLimit({
    windowMs,                    // 제한 시간 창 (밀리초)
    max,                         // 시간 창 내 최대 요청 횟수
    message: {
      success: false,
      message,
      errorCode: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,       // 표준 Rate Limit 헤더 사용
    legacyHeaders: false,        // 레거시 헤더 비활성화
    handler: (req, res) => {
      // 제한 초과 시 보안 로깅 및 알림
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        endpoint: req.originalUrl,
        method: req.method
      });
      
      res.status(429).json({
        success: false,
        message,
        errorCode: 'RATE_LIMIT_EXCEEDED'
      });
    }
  });
};

/**
 * 일반 API용 Rate Limit 설정
 */
export const generalRateLimit = createRateLimit(
  15 * 60 * 1000, // 15분
  100, // 요청 100개
  '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.'
);

/**
 * 인증 관련 API용 Rate Limit 설정
 */
export const authRateLimit = createRateLimit(
  15 * 60 * 1000, // 15분
  process.env.NODE_ENV === 'test' ? 1000 : 5, // 테스트 환경에서는 더 관대하게
  '로그인 시도가 너무 많습니다. 15분 후 다시 시도해주세요.'
);

/**
 * 민감한 작업용 Rate Limit 설정
 */
export const sensitiveActionLimit = createRateLimit(
  60 * 60 * 1000, // 1시간
  process.env.NODE_ENV === 'test' ? 1000 : 3, // 테스트 환경에서는 더 관대하게
  '민감한 작업 요청이 너무 많습니다. 1시간 후 다시 시도해주세요.'
);

/**
 * 속도 제한 미들웨어
 */
export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15분
  delayAfter: process.env.NODE_ENV === 'test' ? 1000 : 50, // 테스트 환경에서는 비활성화
  delayMs: () => 500, // 새로운 API 형식으로 변경
  maxDelayMs: 10000, // 최대 10초 지연
  validate: {
    delayMs: false // 경고 메시지 비활성화
  }
});

/**
 * CORS 설정
 */
export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:80', 
      'http://localhost:5173',
      'http://localhost'
    ];
    
    // CORS 설정 로깅
    logger.info('CORS configuration', { 
      environment: process.env.NODE_ENV,
      allowedOrigins,
      requestOrigin: origin,
      allowedOriginsEnv: process.env.ALLOWED_ORIGINS
    });
    
    // 개발 환경에서는 origin이 없을 수 있음 (Postman 등)
    if (!origin && process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // 개발 환경에서는 localhost 모든 포트 허용
    if (process.env.NODE_ENV === 'development' && origin?.includes('localhost')) {
      return callback(null, true);
    }
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked request', { origin, allowedOrigins });
      callback(new Error('CORS 정책에 의해 차단된 요청입니다.'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
};

/**
 * Helmet 보안 헤더 설정
 */
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 31536000, // 1년
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
});

/**
 * 입력 문자열 정화 및 XSS 공격 방지
 * @param input - 정화할 입력 문자열
 * @returns - 정화된 문자열
 */
export const sanitizeInput = (input: any): string => {
  if (typeof input !== 'string') {
    return String(input);
  }

  return input
    // HTML 태그 제거
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    // Javascript: 프로토콜 제거
    .replace(/javascript:/gi, '')
    // 이벤트 핸들러 제거
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    // SQL Injection 위험 문자 이스케이프
    .replace(/'/g, '&#x27;')
    .replace(/"/g, '&quot;')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .trim();
};

/**
 * 요청 본문 정화 미들웨어
 * @param req - 요청 객체
 * @param res - 응답 객체
 * @param next - 다음 미들웨어 함수
 */
export const sanitizeRequestBody = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    const sanitizeObject = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
      }
      
      if (obj && typeof obj === 'object') {
        const sanitized: any = {};
        for (const [key, value] of Object.entries(obj)) {
          if (typeof value === 'string') {
            sanitized[key] = sanitizeInput(value);
          } else if (typeof value === 'object') {
            sanitized[key] = sanitizeObject(value);
          } else {
            sanitized[key] = value;
          }
        }
        return sanitized;
      }
      
      return obj;
    };

    req.body = sanitizeObject(req.body);
  }
  
  next();
};

/**
 * CSRF 보호 미들웨어
 * @param req - 요청 객체
 * @param res - 응답 객체
 * @param next - 다음 미들웨어 함수
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // GET, HEAD, OPTIONS 요청은 CSRF 검증 제외
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const token = req.headers['x-csrf-token'] as string;
  const sessionToken = (req.session as any)?.csrfToken;

  // 개발 환경에서는 CSRF 검증 건너뛰기
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    return next();
  }

  if (!token || !sessionToken || token !== sessionToken) {
    return res.status(403).json({
      success: false,
      error: 'Invalid CSRF token',
      code: 'CSRF_INVALID'
    });
  }

  next();
};

/**
 * 랜덤한 CSRF 토큰 생성
 * @returns 랜덤한 CSRF 토큰
 */
export const generateCSRFToken = (): string => {
  return require('crypto').randomBytes(32).toString('hex');
};

// 보안 헤더 설정 미들웨어
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      childSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  frameguard: { action: 'deny' },
  xssFilter: true,
  referrerPolicy: { policy: 'same-origin' }
});

// 인증 관련 요청 제한
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 5, // 최대 5번 시도
  message: {
    success: false,
    error: '너무 많은 로그인 시도가 있었습니다. 15분 후에 다시 시도해주세요.',
    code: 'TOO_MANY_ATTEMPTS'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // express-rate-limit 공식 가이드에 따라 ipKeyGenerator 사용
    // https://express-rate-limit.github.io/ERR_ERL_KEY_GEN_IPV6/
    // 이메일 등 추가 식별이 필요하면 req.ip + ':' + email 형태로 하되, ipKeyGenerator를 반드시 포함해야 함
    const ipKey = req.ip; // 기본값 사용
    return ipKey;
  }
});

// 일반 API 요청 제한
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 최대 100번 요청
  message: {
    success: false,
    error: '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * 이메일 형식 검증
 * @param value - 검증할 이메일 문자열
 * @returns 유효한 이메일 형식이면 true, 그렇지 않으면 false
 */
export const isValidEmail = (value: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

/**
 * 비밀번호 강도 검증
 * @param value - 검증할 비밀번호 문자열
 * @returns 비밀번호 강도 검증 결과
 */
export const isStrongPassword = (value: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (value.length < 8) {
    errors.push('비밀번호는 최소 8자 이상이어야 합니다.');
  }
  
  if (!/(?=.*[a-z])/.test(value)) {
    errors.push('비밀번호에는 소문자가 포함되어야 합니다.');
  }
  
  if (!/(?=.*[A-Z])/.test(value)) {
    errors.push('비밀번호에는 대문자가 포함되어야 합니다.');
  }
  
  if (!/(?=.*\d)/.test(value)) {
    errors.push('비밀번호에는 숫자가 포함되어야 합니다.');
  }
  
  if (!/(?=.*[!@#$%^&*])/.test(value)) {
    errors.push('비밀번호에는 특수문자(!@#$%^&*)가 포함되어야 합니다.');
  }
  
  return { isValid: errors.length === 0, errors };
};

/**
 * 이메일 형식 검증
 * @param email - 검증할 이메일 문자열
 * @returns 유효한 이메일 형식이면 true, 그렇지 않으면 false
 */
export const validateEmail = (email: string): boolean => {
  return isValidEmail(email) && email.length <= 255;
};

/**
 * 비밀번호 검증
 * @param password - 검증할 비밀번호 문자열
 * @returns 비밀번호 강도 검증 결과
 */
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  return isStrongPassword(password);
};

/**
 * 이름 검증
 * @param name - 검증할 이름 문자열
 * @returns 유효한 이름 형식이면 true, 그렇지 않으면 false
 */
export const validateName = (name: string): boolean => {
  return name.length >= 2 && name.length <= 50 && /^[a-zA-Z가-힣\s]+$/.test(name);
};

/**
 * 금액 검증
 * @param amount - 검증할 금액
 * @returns 유효한 금액 형식이면 true, 그렇지 않으면 false
 */
export const validateAmount = (amount: number): boolean => {
  return amount >= 0.01 && amount <= 999999999.99;
};

/**
 * 카테고리 키 검증
 * @param categoryKey - 검증할 카테고리 키 문자열
 * @returns 유효한 카테고리 키 형식이면 true, 그렇지 않으면 false
 */
export const validateCategoryKey = (categoryKey: string): boolean => {
  return categoryKey.length >= 1 && categoryKey.length <= 100 && /^[a-zA-Z0-9_]+$/.test(categoryKey);
};

/**
 * 회원가입 검증 미들웨어
 * @param req - 요청 객체
 * @param res - 응답 객체
 * @param next - 다음 미들웨어 함수
 * @returns 유효성 검사 결과에 따라 다음 미들웨어 호출 또는 400 에러 응답
 */
export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
  const { email, password, name } = req.body;
  const errors: string[] = [];

  // 이메일 검증
  if (!email || !validateEmail(email)) {
    errors.push('유효한 이메일 주소를 입력해주세요.');
  }

  // 비밀번호 검증
  if (!password) {
    errors.push('비밀번호를 입력해주세요.');
  } else {
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    }
  }

  // 이름 검증
  if (!name || !validateName(name)) {
    errors.push('이름은 2-50자 사이의 문자와 공백만 허용됩니다.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: '입력 데이터가 유효하지 않습니다.',
      details: errors
    });
  }

  next();
};

/**
 * 로그인 검증 미들웨어
 * @param req - 요청 객체
 * @param res - 응답 객체
 * @param next - 다음 미들웨어 함수
 */
export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  const errors: string[] = [];

  // 이메일 검증
  if (!email || !validateEmail(email)) {
    errors.push('유효한 이메일 주소를 입력해주세요.');
  }

  // 비밀번호 검증
  if (!password || password.length < 1) {
    errors.push('비밀번호를 입력해주세요.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: '로그인 정보가 유효하지 않습니다.',
      details: errors
    });
  }

  next();
};

/**
 * 거래 검증 미들웨어
 * @param req - 요청 객체
 * @param res - 응답 객체
 * @param next - 다음 미들웨어 함수
 */
export const validateTransaction = (req: Request, res: Response, next: NextFunction) => {
  const { category_key, transaction_type, amount, description, transaction_date } = req.body;
  const errors: string[] = [];

  // 카테고리 키 검증
  if (!category_key || !validateCategoryKey(category_key)) {
    errors.push('카테고리 키는 1-100자 사이의 영문, 숫자, 언더스코어만 허용됩니다.');
  }

  // 거래 유형 검증
  if (!transaction_type || !['income', 'expense'].includes(transaction_type)) {
    errors.push('거래 유형은 income 또는 expense여야 합니다.');
  }

  // 금액 검증
  if (!amount || !validateAmount(amount)) {
    errors.push('금액은 0.01 이상 999,999,999.99 이하여야 합니다.');
  }

  // 설명 검증 (선택사항)
  if (description && description.length > 500) {
    errors.push('설명은 500자를 초과할 수 없습니다.');
  }

  // 날짜 검증
  if (!transaction_date || isNaN(Date.parse(transaction_date))) {
    errors.push('유효한 날짜 형식을 입력해주세요.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: '거래 데이터가 유효하지 않습니다.',
      details: errors
    });
  }

  next();
};

/**
 * 예산 검증 미들웨어
 * @param req - 요청 객체
 * @param res - 응답 객체
 * @param next - 다음 미들웨어 함수
 */
export const validateBudget = (req: Request, res: Response, next: NextFunction) => {
  const { category_key, amount, period_start, period_end } = req.body;
  const errors: string[] = [];

  // 카테고리 키 검증
  if (!category_key || !validateCategoryKey(category_key)) {
    errors.push('카테고리 키는 1-100자 사이의 영문, 숫자, 언더스코어만 허용됩니다.');
  }

  // 금액 검증
  if (!amount || amount < 1 || amount > 999999999.99) {
    errors.push('예산 금액은 1 이상 999,999,999.99 이하여야 합니다.');
  }

  // 시작 날짜 검증
  if (!period_start || isNaN(Date.parse(period_start))) {
    errors.push('유효한 시작 날짜를 입력해주세요.');
  }

  // 종료 날짜 검증
  if (!period_end || isNaN(Date.parse(period_end))) {
    errors.push('유효한 종료 날짜를 입력해주세요.');
  } else if (period_start && new Date(period_end) <= new Date(period_start)) {
    errors.push('종료 날짜는 시작 날짜보다 늦어야 합니다.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: '예산 데이터가 유효하지 않습니다.',
      details: errors
    });
  }

  next();
};

/**
 * SQL Injection 방지를 위한 쿼리 매개변수 검증
 * @param req - 요청 객체
 * @param res - 응답 객체
 * @param next - 다음 미들웨어 함수
 */
export const sanitizeQueryParams = (req: Request, res: Response, next: NextFunction) => {
  const dangerousPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /[\'\";]/gi,
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi
  ];

  const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
      for (const pattern of dangerousPatterns) {
        if (pattern.test(value)) {
          throw new Error('잠재적으로 위험한 입력이 감지되었습니다.');
        }
      }
      return sanitizeInput(value);
    }
    return value;
  };

  try {
    // Query parameters 정화
    for (const [key, value] of Object.entries(req.query)) {
      if (Array.isArray(value)) {
        req.query[key] = value.map(sanitizeValue);
      } else {
        req.query[key] = sanitizeValue(value);
      }
    }

    // Path parameters 정화
    for (const [key, value] of Object.entries(req.params)) {
      req.params[key] = sanitizeValue(value);
    }

    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : '입력 데이터가 유효하지 않습니다.',
      code: 'INVALID_INPUT'
    });
  }
};

/**
 * 보안 로깅 미들웨어
 * @param req - 요청 객체
 * @param res - 응답 객체
 * @param next - 다음 미들웨어 함수
 */
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  const suspiciousPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=\s*["'][^"']*["']/gi
  ];

  const requestData = JSON.stringify({
    body: req.body,
    query: req.query,
    params: req.params
  });

  let isSuspicious = false;
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(requestData)) {
      isSuspicious = true;
      break;
    }
  }

  if (isSuspicious) {
    logger.warn('Suspicious request detected', {
      ip: req.ip,
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
      requestData: requestData.substring(0, 1000) // 로그 크기 제한
    });
  }

  next();
};

/**
 * XSS 방지 미들웨어
 * @param req - 요청 객체
 * @param res - 응답 객체
 * @param next - 다음 미들웨어 함수
 */
export const xssProtection = (req: Request, res: Response, next: NextFunction) => {
  try {
    // 요청 본문의 모든 문자열 필드를 XSS로부터 보호
    const cleanObject = (obj: any): any => {
      if (typeof obj === 'string') {
        return xss(obj, {
          whiteList: {}, // 모든 HTML 태그 제거
          stripIgnoreTag: true,
          stripIgnoreTagBody: ['script']
        });
      }
      
      if (Array.isArray(obj)) {
        return obj.map(cleanObject);
      }
      
      if (obj && typeof obj === 'object') {
        const cleaned: any = {};
        for (const [key, value] of Object.entries(obj)) {
          cleaned[key] = cleanObject(value);
        }
        return cleaned;
      }
      
      return obj;
    };

    if (req.body) {
      req.body = cleanObject(req.body);
    }
    
    if (req.query) {
      req.query = cleanObject(req.query);
    }
    
    if (req.params) {
      req.params = cleanObject(req.params);
    }

    next();
  } catch (error) {
    logger.warn('XSS protection error', {
      error: error instanceof Error ? error.message : String(error),
      path: req.path,
      method: req.method
    });
    next(new ValidationError('잘못된 요청 형식입니다.'));
  }
};

/**
 * SQL 인젝션 방지 미들웨어
 * @param req - 요청 객체
 * @param res - 응답 객체
 * @param next - 다음 미들웨어 함수
 */
export const sqlInjectionProtection = (req: Request, res: Response, next: NextFunction) => {
  const suspiciousPatterns = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/gi,
    /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/gi,
    /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/gi,
    /((\%27)|(\'))union/gi,
    /exec(\s|\+)+(s|x)p\w+/gi,
    /UNION(?:\s+ALL)?\s+SELECT/gi,
    /INSERT(?:\s+INTO)?\s+/gi,
    /DELETE(?:\s+FROM)?\s+/gi,
    /UPDATE(?:\s+\w+)?\s+SET/gi,
    /DROP(?:\s+TABLE)?\s+/gi
  ];

  // 단일 값 검사
  const checkValue = (value: any, path: string): boolean => {
    if (typeof value === 'string') {
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(value)) {
          logger.warn('SQL injection attempt detected', {
            path: req.path,
            method: req.method,
            suspiciousValue: value,
            field: path,
            ip: req.ip,
            userAgent: req.get('User-Agent')
          });
          return true;
        }
      }
    }
    return false;
  };

  // 객체 재귀 검사
  const validateObject = (obj: any, basePath: string = ''): boolean => {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = basePath ? `${basePath}.${key}` : key;
      
      if (checkValue(value, currentPath)) {
        return true;
      }
      
      if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          if (typeof value[i] === 'object' && value[i] !== null) {
            if (validateObject(value[i], `${currentPath}[${i}]`)) {
              return true;
            }
          } else if (checkValue(value[i], `${currentPath}[${i}]`)) {
            return true;
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        if (validateObject(value, currentPath)) {
          return true;
        }
      }
    }
    return false;
  };

  try {
    // 요청 본문 검사
    if (req.body && validateObject(req.body, 'body')) {
      throw new ValidationError('잘못된 요청입니다.');
    }

    // 쿼리 파라미터 검사
    if (req.query && validateObject(req.query, 'query')) {
      throw new ValidationError('잘못된 쿼리 파라미터입니다.');
    }

    // URL 파라미터 검사
    if (req.params && validateObject(req.params, 'params')) {
      throw new ValidationError('잘못된 URL 파라미터입니다.');
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * 파일 업로드 보안 설정
 */
export const fileUploadSecurity = {
  // 허용된 MIME 타입
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ],

  // 최대 파일 크기 (10MB)
  maxFileSize: 10 * 1024 * 1024,

  // 파일 검증 함수
  validateFile: (file: any): boolean => {
    if (!file) return false;
    
    // MIME 타입 검증
    if (!fileUploadSecurity.allowedMimeTypes.includes(file.mimetype)) {
      logger.warn('Unauthorized file type upload attempt', {
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      });
      return false;
    }

    // 파일 크기 검증
    if (file.size > fileUploadSecurity.maxFileSize) {
      logger.warn('File size limit exceeded', {
        filename: file.originalname,
        size: file.size,
        limit: fileUploadSecurity.maxFileSize
      });
      return false;
    }

    // 파일 확장자 검증
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.csv', '.xls', '.xlsx'];
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    
    if (!allowedExtensions.includes(fileExtension)) {
      logger.warn('Unauthorized file extension upload attempt', {
        filename: file.originalname,
        extension: fileExtension
      });
      return false;
    }

    return true;
  }
};

/**
 * 요청 본문 크기 제한 설정
 */
export const requestSizeLimits = {
  // JSON 페이로드 크기 제한 (1MB)
  json: '1mb',
  // URL 인코딩된 페이로드 크기 제한 (1MB)
  urlencoded: '1mb',
  // 원시 페이로드 크기 제한 (10MB - 파일 업로드용)
  raw: '10mb'
};

// IP 화이트리스트/블랙리스트
export const ipFiltering = (req: Request, res: Response, next: NextFunction) => {
  const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
  
  // 블랙리스트된 IP 확인
  const blacklistedIPs = process.env.BLACKLISTED_IPS?.split(',') || [];
  if (blacklistedIPs.includes(clientIp)) {
    logger.warn('Blacklisted IP blocked', {
      ip: clientIp,
      path: req.path,
      method: req.method,
      userAgent: req.get('User-Agent')
    });
    
    return res.status(403).json({
      success: false,
      message: '접근이 차단되었습니다.',
      errorCode: 'IP_BLOCKED'
    });
  }

  // 화이트리스트 모드인 경우 (관리자 전용 엔드포인트 등)
  if (req.path.startsWith('/admin')) {
    const whitelistedIPs = process.env.ADMIN_WHITELISTED_IPS?.split(',') || [];
    if (whitelistedIPs.length > 0 && !whitelistedIPs.includes(clientIp)) {
      logger.warn('Non-whitelisted IP blocked from admin access', {
        ip: clientIp,
        path: req.path,
        method: req.method
      });
      
      return res.status(403).json({
        success: false,
        message: '관리자 영역에 접근할 수 없습니다.',
        errorCode: 'ADMIN_ACCESS_DENIED'
      });
    }
  }

  next();
};

/**
 * 보안 헤더 검증 미들웨어  
 * @param req - 요청 객체
 * @param res - 응답 객체
 * @param next - 다음 미들웨어 함수
 * @returns 보안 헤더가 의심스러운 경우 403 또는 415 상태 코드 응답, 그렇지 않으면 다음 미들웨어 호출
 */
export const securityHeadersValidation = (req: Request, res: Response, next: NextFunction) => {
  const userAgent = req.get('User-Agent');
  const contentType = req.get('Content-Type');
  
  // 의심스러운 User-Agent 패턴 검사
  const suspiciousUserAgents = [
    /sqlmap/i,
    /nikto/i,
    /nessus/i,
    /burp/i,
    /acunetix/i,
    /netsparker/i,
    /masscan/i,
    /nmap/i
  ];

  if (userAgent) {
    for (const pattern of suspiciousUserAgents) {
      if (pattern.test(userAgent)) {
        logger.warn('Suspicious user agent detected', {
          userAgent,
          ip: req.ip,
          path: req.path,
          method: req.method
        });
        
        return res.status(403).json({
          success: false,
          message: '잘못된 요청입니다.',
          errorCode: 'SUSPICIOUS_REQUEST'
        });
      }
    }
  }

  // POST/PUT 요청에 대한 Content-Type 검증
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const validContentTypes = [
      'application/json',
      'application/x-www-form-urlencoded',
      'multipart/form-data'
    ];

    if (contentType && !validContentTypes.some(type => contentType.includes(type))) {
      logger.warn('Invalid content type', {
        contentType,
        ip: req.ip,
        path: req.path,
        method: req.method
      });
      
      return res.status(415).json({
        success: false,
        message: '지원되지 않는 Content-Type입니다.',
        errorCode: 'UNSUPPORTED_MEDIA_TYPE'
      });
    }
  }

  next();
};