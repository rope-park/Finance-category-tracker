import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { body, validationResult, CustomValidator } from 'express-validator';

/**
 * XSS 방지를 위한 입력 검증 및 정화
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
 * CSRF 토큰 검증을 위한 간단한 미들웨어
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // GET, HEAD, OPTIONS 요청은 CSRF 검증 제외
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const token = req.headers['x-csrf-token'] as string;
  const sessionToken = req.session?.csrfToken;

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
 * CSRF 토큰 생성
 */
export const generateCSRFToken = (): string => {
  return require('crypto').randomBytes(32).toString('hex');
};

/**
 * 헬멧 보안 헤더 설정
 */
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

/**
 * 인증 관련 요청 제한
 */
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

/**
 * 일반 API 요청 제한
 */
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
 */
export const isValidEmail: CustomValidator = (value) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    throw new Error('유효한 이메일 주소를 입력해주세요.');
  }
  return true;
};

/**
 * 비밀번호 강도 검증
 */
export const isStrongPassword: CustomValidator = (value) => {
  if (value.length < 8) {
    throw new Error('비밀번호는 최소 8자 이상이어야 합니다.');
  }
  
  if (!/(?=.*[a-z])/.test(value)) {
    throw new Error('비밀번호에는 소문자가 포함되어야 합니다.');
  }
  
  if (!/(?=.*[A-Z])/.test(value)) {
    throw new Error('비밀번호에는 대문자가 포함되어야 합니다.');
  }
  
  if (!/(?=.*\d)/.test(value)) {
    throw new Error('비밀번호에는 숫자가 포함되어야 합니다.');
  }
  
  if (!/(?=.*[!@#$%^&*])/.test(value)) {
    throw new Error('비밀번호에는 특수문자(!@#$%^&*)가 포함되어야 합니다.');
  }
  
  return true;
};

/**
 * 회원가입 입력 검증
 */
export const validateRegister = [
  body('email')
    .isEmail()
    .custom(isValidEmail)
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('이메일은 255자를 초과할 수 없습니다.'),
  
  body('password')
    .custom(isStrongPassword),
  
  body('name')
    .isLength({ min: 2, max: 50 })
    .withMessage('이름은 2-50자 사이여야 합니다.')
    .matches(/^[a-zA-Z가-힣\s]+$/)
    .withMessage('이름에는 문자와 공백만 허용됩니다.'),
  
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: '입력 데이터가 유효하지 않습니다.',
        details: errors.array()
      });
    }
    next();
  }
];

/**
 * 로그인 입력 검증
 */
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('유효한 이메일 주소를 입력해주세요.'),
  
  body('password')
    .isLength({ min: 1 })
    .withMessage('비밀번호를 입력해주세요.'),
  
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: '로그인 정보가 유효하지 않습니다.',
        details: errors.array()
      });
    }
    next();
  }
];

/**
 * 거래 생성 입력 검증
 */
export const validateTransaction = [
  body('category_key')
    .isLength({ min: 1, max: 100 })
    .withMessage('카테고리 키는 1-100자 사이여야 합니다.')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('카테고리 키는 영문, 숫자, 언더스코어만 허용됩니다.'),
  
  body('transaction_type')
    .isIn(['income', 'expense'])
    .withMessage('거래 유형은 income 또는 expense여야 합니다.'),
  
  body('amount')
    .isFloat({ min: 0.01, max: 999999999.99 })
    .withMessage('금액은 0.01 이상 999,999,999.99 이하여야 합니다.'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('설명은 500자를 초과할 수 없습니다.'),
  
  body('transaction_date')
    .isISO8601()
    .withMessage('유효한 날짜 형식을 입력해주세요.'),
  
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: '거래 데이터가 유효하지 않습니다.',
        details: errors.array()
      });
    }
    next();
  }
];

/**
 * 예산 생성 입력 검증
 */
export const validateBudget = [
  body('category_key')
    .isLength({ min: 1, max: 100 })
    .withMessage('카테고리 키는 1-100자 사이여야 합니다.')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('카테고리 키는 영문, 숫자, 언더스코어만 허용됩니다.'),
  
  body('amount')
    .isFloat({ min: 1, max: 999999999.99 })
    .withMessage('예산 금액은 1 이상 999,999,999.99 이하여야 합니다.'),
  
  body('period_start')
    .isISO8601()
    .withMessage('유효한 시작 날짜를 입력해주세요.'),
  
  body('period_end')
    .isISO8601()
    .withMessage('유효한 종료 날짜를 입력해주세요.')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.period_start)) {
        throw new Error('종료 날짜는 시작 날짜보다 늦어야 합니다.');
      }
      return true;
    }),
  
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: '예산 데이터가 유효하지 않습니다.',
        details: errors.array()
      });
    }
    next();
  }
];

/**
 * SQL Injection 방지를 위한 쿼리 매개변수 검증
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
    console.warn(`[SECURITY] Suspicious request detected:`, {
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