/**
 * 캐시 미들웨어
 * 
 * 다양한 라우트에 대해 캐시 미들웨어를 생성하고, 캐시 무효화 미들웨어도 함께 제공.
 * 캐시 키 생성, TTL 설정, 조건부 캐싱 등을 지원.
 * 
 * 주요 기능:
 * - createCacheMiddleware: 캐시 미들웨어 생성기
 * - invalidateCacheMiddleware: 특정 패턴의 캐시 무효화 미들웨어
 * - invalidateUserCache: 사용자별 캐시 무효화
 * - cacheMiddlewares: 자주 사용하는 라우트용 캐시 미들웨어 모음
 * - cacheInvalidators: 자주 사용하는 캐시 무효화 미들웨어 모음
 * - 캐시 히트/미스에 따른 응답 헤더 설정
 */
import { Request, Response, NextFunction } from 'express';
import { cacheService, CacheKeys, CacheTTL } from '../services/cacheService';
import logger from '../utils/logger';

/**
 * 캐시 옵션 인터페이스
 * 
 * 캐시 미들웨어 생성 시 설정 가능한 옵션들을 정의.
 * TTL, 캐시 키 생성기, 조건부 캐싱 함수 등을 포함.
 */
interface CacheOptions {
  ttl?: number;
  keyGenerator?: (req: Request) => string;
  condition?: (req: Request) => boolean;
  skipCache?: (req: Request) => boolean;
}

/** 
 * 캐시 미들웨어 생성기
 * 
 * 주어진 옵션에 따라 캐시 미들웨어를 생성.
 * GET 요청에 대해 기본적으로 캐싱하며, 조건부 캐싱 및 캐시 건너뛰기 기능 지원.
 * 캐시 히트 시 응답을 즉시 반환하고, 미스 시 원본 응답을 캐시에 저장.
 */
export const createCacheMiddleware = (options: CacheOptions = {}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const {
      ttl = CacheTTL.MEDIUM,
      keyGenerator,
      condition = () => req.method === 'GET',
      skipCache = () => false,
    } = options;

    // 캐시 조건 확인
    if (!condition(req) || skipCache(req)) {
      return next();
    }

    // 캐시 키 생성
    const cacheKey = keyGenerator 
      ? keyGenerator(req) 
      : `route:${req.method}:${req.originalUrl}:${String(req.user?.id || 'anonymous')}`;

    try {
      // 캐시에서 데이터 조회
      const cachedData = await cacheService.get(cacheKey);
      
      if (cachedData) {
        logger.debug(`Cache hit for key: ${cacheKey}`);
        
        // 캐시 헤더 추가
        res.set({
          'X-Cache': 'HIT',
          'X-Cache-Key': cacheKey,
          'Cache-Control': `max-age=${ttl}`,
        });
        
        return res.json(cachedData);
      }

      logger.debug(`Cache miss for key: ${cacheKey}`);

      // 원본 res.json 메서드 저장
      const originalJson = res.json.bind(res);
      
      // res.json 메서드 오버라이드
      res.json = function(data: any) {
        // 성공 응답인 경우에만 캐시 저장
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cacheService.set(cacheKey, data, ttl).catch(err => {
            logger.error(`Failed to cache data for key ${cacheKey}:`, err);
          });
        }

        // 캐시 헤더 추가
        res.set({
          'X-Cache': 'MISS',
          'X-Cache-Key': cacheKey,
          'Cache-Control': `max-age=${ttl}`,
        });

        return originalJson(data);
      };

      next();
    } catch (error) {
      logger.error(`Cache middleware error for key ${cacheKey}:`, error);
      next();
    }
  };
};

/**
 * 캐시 무효화 미들웨어
 * 
 * 특정 패턴에 매칭되는 캐시 항목들을 무효화.
 * 성공적인 응답 후에만 캐시를 무효화하여 불필요한 삭제 방지.
 *  
 * @param patterns - 무효화할 캐시 키 패턴들의 배열 또는 요청에 따라 동적으로 생성하는 함수
 * @returns 미들웨어 함수
 */
export const invalidateCacheMiddleware = (patterns: string[] | ((req: Request) => string[])) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);
    
    res.json = function(data: any) {
      // 성공 응답인 경우에만 캐시 무효화
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const patternsToInvalidate = Array.isArray(patterns) 
          ? patterns 
          : patterns(req);
          
        Promise.all(
          patternsToInvalidate.map(pattern => cacheService.deletePattern(pattern))
        ).catch(err => {
          logger.error('Failed to invalidate cache patterns:', err);
        });
      }

      return originalJson(data);
    };

    next();
  };
};

/**
 * 사용자별 캐시 무효화 미들웨어
 * 
 * 사용자 관련 캐시들을 한 번에 무효화.
 * 
 * @param userId - 무효화할 사용자의 ID
 * @returns 미들웨어 함수
 */
export const invalidateUserCache = (userId: string) => {
  return invalidateCacheMiddleware([
    `user:${userId}*`,
    `transactions:${userId}*`,
    `budgets:${userId}*`,
    `analytics:${userId}*`,
    `categories:${userId}*`,
  ]);
};

/**
 * 자주 사용하는 캐시 미들웨어들
 * 
 * 사용자 프로필, 거래 내역, 예산 정보, 분석 데이터 등 주요 라우트에 대해
 * 미리 정의된 캐시 미들웨어들을 제공.
 */
export const cacheMiddlewares = {
  // 사용자 프로필 (장기 캐시)
  userProfile: createCacheMiddleware({
    ttl: CacheTTL.LONG,
    keyGenerator: (req) => CacheKeys.userProfile(String(req.user?.id || '')),
  }),

  // 거래 내역 (중기 캐시)
  transactions: createCacheMiddleware({
    ttl: CacheTTL.MEDIUM,
    keyGenerator: (req) => {
      const page = String(req.query.page || '1');
      return CacheKeys.transactions(String(req.user?.id || ''), Number(page));
    },
  }),

  // 예산 정보 (단기 캐시)
  budgets: createCacheMiddleware({
    ttl: CacheTTL.SHORT,
    keyGenerator: (req) => CacheKeys.budgets(String(req.user?.id || '')),
  }),

  // 분석 데이터 (장기 캐시)
  analytics: createCacheMiddleware({
    ttl: CacheTTL.LONG,
    keyGenerator: (req) => {
      const period = String(req.query.period || 'month');
      return CacheKeys.analytics(String(req.user?.id || ''), period);
    },
  }),

  // 카테고리 (매우 장기 캐시)
  categories: createCacheMiddleware({
    ttl: CacheTTL.VERY_LONG,
    keyGenerator: (req) => CacheKeys.categories(String(req.user?.id || '')),
  }),

  // 월간 리포트 (장기 캐시)
  monthlyReport: createCacheMiddleware({
    ttl: CacheTTL.LONG,
    keyGenerator: (req) => {
      const month = String(req.query.month || new Date().toISOString().slice(0, 7));
      return CacheKeys.monthlyReport(String(req.user?.id || ''), month);
    },
  }),
};

/**
 * 자주 사용하는 캐시 무효화 미들웨어들
 * 
 * 거래, 예산, 카테고리, 사용자 프로필 등 주요 리소스 변경 시
 * 관련된 캐시들을 무효화하는 미들웨어 모음.
 */
export const cacheInvalidators = {
  // 거래 생성/수정/삭제 시
  transactions: (req: Request) => invalidateCacheMiddleware([
    `transactions:${req.user?.id}*`,
    `analytics:${req.user?.id}*`,
    `budget:summary:${req.user?.id}*`,
    `report:monthly:${req.user?.id}*`,
  ]),

  // 예산 생성/수정/삭제 시
  budgets: (req: Request) => invalidateCacheMiddleware([
    `budgets:${req.user?.id}*`,
    `budget:summary:${req.user?.id}*`,
  ]),

  // 카테고리 생성/수정/삭제 시
  categories: (req: Request) => invalidateCacheMiddleware([
    `categories:${req.user?.id}*`,
    `transactions:${req.user?.id}*`,
    `analytics:${req.user?.id}*`,
  ]),

  // 사용자 프로필 업데이트 시
  userProfile: (req: Request) => invalidateCacheMiddleware([
    `user:${req.user?.id}*`,
  ]),
};
