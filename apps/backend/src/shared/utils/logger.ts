/**
 * 통합 로깅 유틸리티
 * 
 * Finance Category Tracker 애플리케이션의 전체 로깅을 중앙집중식으로 관리.
 * Winston 라이브러리를 기반으로 개발, 테스트, 프로덕션 환경에서 최적화된 로깅을 제공.
 * 
 * 주요 기능:
 * - 다중 로그 레벨 및 색상 코딩 지원
 * - 콘솔, 파일, 원격 로깅 서비스 통합
 * - Sentry와 연동된 오류 추적 및 모니터링
 * - 성능 메트릭 및 시스템 건강 상태 로깅
 * - 사용자 행동 및 보안 이벤트 추적
 * 
 * @author Ju Eul Park (rope-park)
 */

import * as winston from 'winston';
import * as Transport from 'winston-transport';
import * as path from 'path';
import * as Sentry from '@sentry/node';

/**
 * 로그 레벨 우선순위 정의
 * 
 * Winston 로그 레벨을 수치로 정의하여 우선순위를 결정.
 * 낮은 수치일수록 더 중요한 로그로 간주되며, 환경별로 다른 레벨을 설정 가능.
 */
const logLevels = {
  error: 0,    // 심각한 오류 - 시스템 중단이나 데이터 손실 가능
  warn: 1,     // 경고 - 주의가 필요하지만 작동은 계속 가능
  info: 2,     // 일반 정보 - 시스템 정상 작동 및 주요 이벤트
  http: 3,     // HTTP 요청 - API 호출 및 웹 요청 로깅
  debug: 4     // 디버그 - 개발 시 상세한 디버깅 정보
};

/**
 * 로그 레벨별 콘솔 색상 정의
 * 
 * 콘솔에서 로그를 볼 때 레벨에 따라 다른 색상으로 표시하여 가독성 향상.
 * 개발 환경에서 빠른 로그 파악과 디버깅을 도움.
 */
const logColors = {
  error: 'red',       // 빨간색 - 오류 및 예외 상황
  warn: 'yellow',     // 노란색 - 경고 및 주의 사항
  info: 'green',      // 초록색 - 정상 작동 및 성공 메시지
  http: 'magenta',    // 자주색 - HTTP 요청 및 API 호출
  debug: 'blue'       // 파란색 - 디버깅 및 상세 정보
};

// Winston에 사용자 정의 색상 등록
winston.addColors(logColors);

// Sentry 로깅 헬퍼 함수
const sendToSentry = (level: string, message: string, stack?: string, metadata?: any) => {
  if (level === 'error') {
    if (stack) {
      const error = new Error(message);
      error.stack = stack;
      Sentry.captureException(error);
    } else {
      Sentry.captureMessage(message, 'error');
    }
  } else if (level === 'warn') {
    Sentry.captureMessage(message, 'warning');
  }

  // 메타데이터를 Sentry 브레드크럼에 추가
  if (metadata && Object.keys(metadata).length > 0) {
    Sentry.addBreadcrumb({
      message,
      level: level as any,
      data: metadata,
      timestamp: new Date().getTime() / 1000,
    });
  }
};

// 커스텀 포맷터
const customFormat = winston.format.printf(({ timestamp, level, message, metadata, stack }) => {
  let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
  
  if (stack) {
    log += `\n${stack}`;
  }
  
  if (metadata && Object.keys(metadata).length > 0) {
    log += `\nMetadata: ${JSON.stringify(metadata, null, 2)}`;
  }
  
  return log;
});

// 개발 환경용 포맷
const developmentFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }),
  winston.format.colorize({ all: true }),
  customFormat
);

// 프로덕션 환경용 포맷 (JSON)
const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }),
  winston.format.json()
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

// 프로덕션 환경에서는 파일 로깅과 Sentry 통합
if (process.env.NODE_ENV === 'production') {
  transports.push(
    // 에러 로그 파일
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        customFormat
      ),
      maxsize: 5242880, // 5MB
      maxFiles: 10,
      tailable: true
    }),
    
    // HTTP 요청 로그
    new winston.transports.File({
      filename: path.join(logDir, 'http.log'),
      level: 'http',
      format: productionFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    }),
    
    // 모든 로그 파일
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      format: productionFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 20,
      tailable: true
    })
  );
}

// 로거 생성
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  levels: logLevels,
  format: process.env.NODE_ENV === 'production' ? productionFormat : developmentFormat,
  transports,
  
  // 예외 처리 핸들러
  exceptionHandlers: [
    new winston.transports.Console({
      format: developmentFormat
    }),
    ...(process.env.NODE_ENV === 'production' ? [
      new winston.transports.File({
        filename: path.join(logDir, 'exceptions.log'),
        maxsize: 5242880,
        maxFiles: 5
      })
    ] : [])
  ],
  
  // 거부된 Promise 처리 핸들러
  rejectionHandlers: [
    new winston.transports.Console({
      format: developmentFormat
    }),
    ...(process.env.NODE_ENV === 'production' ? [
      new winston.transports.File({
        filename: path.join(logDir, 'rejections.log'),
        maxsize: 5242880,
        maxFiles: 5
      })
    ] : [])
  ]
});

// 프로세스 종료 시 에러가 발생하지 않도록 설정
logger.exitOnError = false;

// Sentry 통합을 위한 hook 추가
logger.on('data', (info) => {
  if (info.level === 'error' || info.level === 'warn') {
    sendToSentry(info.level, info.message, info.stack, info.metadata);
  }
});

// 로거 헬퍼 함수들
export const loggerHelpers = {
  // 사용자 액션 로그
  logUserAction: (userId: string, action: string, details?: any) => {
    logger.info('User action', {
      userId,
      action,
      details,
      timestamp: new Date().toISOString()
    });
  },

  // API 요청 로그
  logApiRequest: (method: string, url: string, statusCode: number, responseTime: number, userId?: string) => {
    logger.http('API Request', {
      method,
      url,
      statusCode,
      responseTime: `${responseTime}ms`,
      userId,
      timestamp: new Date().toISOString()
    });
  },

  // 데이터베이스 쿼리 로그
  logDatabaseQuery: (query: string, duration: number, error?: Error) => {
    if (error) {
      logger.error('Database query failed', {
        query: query.substring(0, 200) + (query.length > 200 ? '...' : ''),
        duration: `${duration}ms`,
        error: error.message,
        stack: error.stack
      });
    } else {
      logger.debug('Database query executed', {
        query: query.substring(0, 200) + (query.length > 200 ? '...' : ''),
        duration: `${duration}ms`
      });
    }
  },

  // 비즈니스 로직 에러 로그
  logBusinessError: (operation: string, error: Error, context?: any) => {
    logger.error(`Business logic error in ${operation}`, {
      operation,
      error: error.message,
      stack: error.stack,
      context
    });
  },

  // 성능 메트릭 로그
  logPerformanceMetric: (metric: string, value: number, unit: string, tags?: Record<string, any>) => {
    logger.info('Performance metric', {
      metric,
      value,
      unit,
      tags,
      timestamp: new Date().toISOString()
    });
  }
};

export default logger;
