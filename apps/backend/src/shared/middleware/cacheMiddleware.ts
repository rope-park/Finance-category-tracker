import { Request, Response, NextFunction } from 'express';
import { cacheService, CacheKeys, CacheTTL } from '../services/cacheService';
import logger from '../utils/logger';

interface CacheOptions {
  ttl?: number;
  keyGenerator?: (req: Request) => string;
  condition?: (req: Request) => boolean;
  skipCache?: (req: Request) => boolean;
}

// 캐시 미들웨어 생성기
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

// 특정 패턴의 캐시 무효화 미들웨어
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

// 사용자별 캐시 무효화
export const invalidateUserCache = (userId: string) => {
  return invalidateCacheMiddleware([
    `user:${userId}*`,
    `transactions:${userId}*`,
    `budgets:${userId}*`,
    `analytics:${userId}*`,
    `categories:${userId}*`,
  ]);
};

// 특정 라우트용 캐시 미들웨어들
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

// 캐시 무효화 미들웨어들
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
