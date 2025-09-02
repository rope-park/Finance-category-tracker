import winston from 'winston';
import path from 'path';

// 로그 레벨 정의
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// 로그 색상 정의
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

winston.addColors(logColors);

// 개발 환경용 포맷
const developmentFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(info => 
    `${info.timestamp} [${info.level}]: ${info.message}`
  )
);

// 프로덕션 환경용 포맷 (JSON)
const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] })
);

// 로그 파일 경로
const logDir = path.join(process.cwd(), 'logs');

// 트랜스포터 설정
const transports: winston.transport[] = [
  // 콘솔 출력
  new winston.transports.Console({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: process.env.NODE_ENV === 'production' ? productionFormat : developmentFormat
  })
];

// 프로덕션 환경에서만 파일 로깅
if (process.env.NODE_ENV === 'production') {
  transports.push(
    // 에러 로그 파일
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: productionFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 10
    }),
    // 모든 로그 파일
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      format: productionFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 20
    })
  );
}

// 로거 생성
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  levels: logLevels,
  format: process.env.NODE_ENV === 'production' ? productionFormat : developmentFormat,
  transports,
  // 핸들되지 않은 예외 처리
  exceptionHandlers: [
    new winston.transports.Console(),
    ...(process.env.NODE_ENV === 'production' ? [
      new winston.transports.File({ filename: path.join(logDir, 'exceptions.log') })
    ] : [])
  ],
  // 핸들되지 않은 Promise 거부 처리
  rejectionHandlers: [
    new winston.transports.Console(),
    ...(process.env.NODE_ENV === 'production' ? [
      new winston.transports.File({ filename: path.join(logDir, 'rejections.log') })
    ] : [])
  ]
});

// 로깅 헬퍼 함수들
export const loggers = {
  // HTTP 요청 로깅
  http: (method: string, url: string, statusCode: number, responseTime: number, userId?: number) => {
    logger.http('HTTP Request', {
      method,
      url,
      statusCode,
      responseTime: `${responseTime}ms`,
      userId: userId || 'anonymous',
      timestamp: new Date().toISOString()
    });
  },

  // 데이터베이스 쿼리 로깅
  database: (query: string, duration: number, success: boolean, error?: Error) => {
    if (success) {
      logger.debug('Database Query', {
        query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
        duration: `${duration}ms`,
        success: true
      });
    } else {
      logger.error('Database Query Failed', {
        query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
        duration: `${duration}ms`,
        error: error?.message,
        stack: error?.stack
      });
    }
  },

  // 인증 관련 로깅
  auth: (action: string, userId: number | null, success: boolean, details?: any) => {
    const level = success ? 'info' : 'warn';
    logger[level]('Authentication Event', {
      action,
      userId: userId || 'anonymous',
      success,
      ...details,
      timestamp: new Date().toISOString()
    });
  },

  // 비즈니스 로직 로깅
  business: (action: string, details: any) => {
    logger.info('Business Logic', {
      action,
      ...details,
      timestamp: new Date().toISOString()
    });
  },

  // 보안 관련 로깅
  security: (event: string, details: any, severity: 'low' | 'medium' | 'high' = 'medium') => {
    logger.warn('Security Event', {
      event,
      severity,
      ...details,
      timestamp: new Date().toISOString()
    });
  },

  // 성능 관련 로깅
  performance: (operation: string, duration: number, metadata?: any) => {
    const level = duration > 1000 ? 'warn' : 'info'; // 1초 이상이면 경고
    logger[level]('Performance Metric', {
      operation,
      duration: `${duration}ms`,
      slow: duration > 1000,
      ...metadata
    });
  }
};

// 로그 스트림 (Morgan 미들웨어용)
export const logStream = {
  write: (message: string) => {
    logger.http(message.trim());
  }
};

export default logger;
