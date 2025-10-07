/**
 * 향상된 캐시 서비스 유틸리티
 *
 * Redis 기반의 고성능 캐시 서비스
 * 
 * 주요 기능:
 * - 기본 GET/SET/DELETE 작업
 * - 조건부 캐싱 (값이 없을 때만 설정)
 * - 함수 결과 캐싱 래퍼
 */
import Redis from 'ioredis';
import logger from './logger';
import { metricsHelpers } from './metrics';

// 캐시 설정 인터페이스
interface CacheConfig {
  ttl: number;          // 생존 시간(초), 0이면 만료 없음
  keyPrefix?: string;
  compress?: boolean;
  serialize?: boolean;
}

// 캐시 통계 인터페이스
interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  errors: number;
  hitRate: number;
}

/**
 * 향상된 캐시 서비스 클래스
 * 
 * Redis 연결 관리, 에러 처리, 통계 수집, 태그 기반 무효화 등 다양한 기능 포함.
 */
export class EnhancedCacheService {
  private redis: Redis;
  private stats: Map<string, CacheStats> = new Map();
  private readonly defaultTTL = 3600; // 1 hour

  // 생성자 - Redis 연결 설정
  constructor(redisConfig: any) {
    this.redis = new Redis(redisConfig);
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.redis.on('connect', () => {
      logger.info('Redis connected successfully');
    });

    this.redis.on('error', (error) => {
      logger.error('Redis connection error', { error: error.message });
      metricsHelpers.recordError('redis', 'connection', 'high');
    });

    this.redis.on('ready', () => {
      logger.info('Redis ready for operations');
    });
  }

  // 기본 GET 작업
  async get<T = any>(
    key: string, 
    config?: Partial<CacheConfig>
  ): Promise<T | null> {
    const fullKey = this.buildKey(key, config?.keyPrefix);
    const startTime = Date.now();

    try {
      const value = await this.redis.get(fullKey);
      const duration = Date.now() - startTime;

      if (value !== null) {
        this.recordHit(key);
        metricsHelpers.recordCacheHit('redis', this.getKeyPattern(key));
        
        logger.debug('Cache hit', {
          key: fullKey,
          duration: `${duration}ms`
        });

        return config?.serialize !== false ? JSON.parse(value) : value as T;
      } else {
        this.recordMiss(key);
        metricsHelpers.recordCacheMiss('redis', this.getKeyPattern(key));
        
        logger.debug('Cache miss', {
          key: fullKey,
          duration: `${duration}ms`
        });

        return null;
      }
    } catch (error) {
      this.recordError(key);
      logger.error('Cache get error', {
        key: fullKey,
        error: (error as Error).message
      });
      return null;
    }
  }

  // 기본 SET 작업
  async set(
    key: string, 
    value: any, 
    config?: Partial<CacheConfig>
  ): Promise<boolean> {
    const fullKey = this.buildKey(key, config?.keyPrefix);
    const ttl = config?.ttl || this.defaultTTL;
    const startTime = Date.now();

    try {
      const serializedValue = config?.serialize !== false ? 
        JSON.stringify(value) : value;

      let result: string | null;
      
      if (ttl > 0) {
        result = await this.redis.setex(fullKey, ttl, serializedValue);
      } else {
        result = await this.redis.set(fullKey, serializedValue);
      }

      const duration = Date.now() - startTime;
      this.recordSet(key);

      logger.debug('Cache set', {
        key: fullKey,
        ttl: ttl > 0 ? `${ttl}s` : 'no expiration',
        duration: `${duration}ms`
      });

      return result === 'OK';
    } catch (error) {
      this.recordError(key);
      logger.error('Cache set error', {
        key: fullKey,
        error: (error as Error).message
      });
      return false;
    }
  }

  // 조건부 캐싱 (값이 없을 때만 설정)
  async setIfNotExists(
    key: string, 
    value: any, 
    config?: Partial<CacheConfig>
  ): Promise<boolean> {
    const fullKey = this.buildKey(key, config?.keyPrefix);
    const ttl = config?.ttl || this.defaultTTL;

    try {
      const serializedValue = config?.serialize !== false ? 
        JSON.stringify(value) : value;

      const result = await this.redis.set(fullKey, serializedValue, 'EX', ttl, 'NX');
      
      if (result === 'OK') {
        this.recordSet(key);
        logger.debug('Cache set (if not exists)', { key: fullKey, ttl: `${ttl}s` });
        return true;
      }
      
      return false;
    } catch (error) {
      this.recordError(key);
      logger.error('Cache setIfNotExists error', {
        key: fullKey,
        error: (error as Error).message
      });
      return false;
    }
  }

  // 함수 결과 캐싱 래퍼
  async getOrSet<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    config?: Partial<CacheConfig>
  ): Promise<T> {
    // 캐시에서 먼저 조회
    const cached = await this.get<T>(key, config);
    if (cached !== null) {
      return cached;
    }

    // 캐시 미스 시 함수 실행
    const startTime = Date.now();
    
    try {
      const result = await fetchFunction();
      const fetchDuration = Date.now() - startTime;
      
      // 결과를 캐시에 저장
      await this.set(key, result, config);
      
      logger.info('Cache populated from function', {
        key,
        fetchDuration: `${fetchDuration}ms`
      });

      return result;
    } catch (error) {
      logger.error('Function execution failed in getOrSet', {
        key,
        error: (error as Error).message
      });
      throw error;
    }
  }

  // 다중 GET
  async mget<T = any>(keys: string[], keyPrefix?: string): Promise<(T | null)[]> {
    const fullKeys = keys.map(key => this.buildKey(key, keyPrefix));
    
    try {
      const values = await this.redis.mget(...fullKeys);
      
      return values.map((value, index) => {
        if (value !== null) {
          this.recordHit(keys[index]);
          metricsHelpers.recordCacheHit('redis', this.getKeyPattern(keys[index]));
          return JSON.parse(value);
        } else {
          this.recordMiss(keys[index]);
          metricsHelpers.recordCacheMiss('redis', this.getKeyPattern(keys[index]));
          return null;
        }
      });
    } catch (error) {
      keys.forEach(key => this.recordError(key));
      logger.error('Cache mget error', { keys, error: (error as Error).message });
      return new Array(keys.length).fill(null);
    }
  }

  // 패턴으로 키 삭제
  async deletePattern(pattern: string): Promise<number> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length === 0) return 0;

      const result = await this.redis.del(...keys);
      
      keys.forEach(key => this.recordDelete(key));
      
      logger.info('Cache pattern delete', {
        pattern,
        deletedCount: result
      });

      return result;
    } catch (error) {
      logger.error('Cache pattern delete error', {
        pattern,
        error: (error as Error).message
      });
      return 0;
    }
  }

  // 태그 기반 캐시 무효화
  async invalidateByTags(tags: string[]): Promise<void> {
    const pipeline = this.redis.pipeline();
    
    for (const tag of tags) {
      const tagKey = `tag:${tag}`;
      const keys = await this.redis.smembers(tagKey);
      
      if (keys.length > 0) {
        pipeline.del(...keys);
        pipeline.del(tagKey);
      }
    }

    await pipeline.exec();
    
    logger.info('Cache invalidated by tags', { tags });
  }

  // 태그와 함께 캐시 설정
  async setWithTags(
    key: string,
    value: any,
    tags: string[],
    config?: Partial<CacheConfig>
  ): Promise<boolean> {
    const result = await this.set(key, value, config);
    
    if (result && tags.length > 0) {
      const pipeline = this.redis.pipeline();
      const fullKey = this.buildKey(key, config?.keyPrefix);
      
      tags.forEach(tag => {
        pipeline.sadd(`tag:${tag}`, fullKey);
        if (config?.ttl) {
          pipeline.expire(`tag:${tag}`, config.ttl);
        }
      });
      
      await pipeline.exec();
    }

    return result;
  }

  // 통계 정보 조회
  getStats(keyPattern?: string): CacheStats {
    if (keyPattern) {
      return this.stats.get(keyPattern) || this.getEmptyStats();
    }

    // 전체 통계 합계
    const totalStats = Array.from(this.stats.values()).reduce(
      (total, stats) => ({
        hits: total.hits + stats.hits,
        misses: total.misses + stats.misses,
        sets: total.sets + stats.sets,
        deletes: total.deletes + stats.deletes,
        errors: total.errors + stats.errors,
        hitRate: 0 // 아래에서 계산
      }),
      this.getEmptyStats()
    );

    totalStats.hitRate = totalStats.hits + totalStats.misses > 0 ?
      (totalStats.hits / (totalStats.hits + totalStats.misses)) * 100 : 0;

    return totalStats;
  }

  // Redis 정보 조회
  async getRedisInfo(): Promise<any> {
    try {
      const info = await this.redis.info();
      return this.parseRedisInfo(info);
    } catch (error) {
      logger.error('Failed to get Redis info', { error: (error as Error).message });
      return null;
    }
  }

  // 캐시 워밍업
  async warmup(warmupTasks: Array<{ key: string; fetchFn: () => Promise<any>; config?: Partial<CacheConfig> }>): Promise<void> {
    logger.info('Starting cache warmup', { taskCount: warmupTasks.length });
    
    const promises = warmupTasks.map(async task => {
      try {
        await this.getOrSet(task.key, task.fetchFn, task.config);
      } catch (error) {
        logger.error('Cache warmup task failed', {
          key: task.key,
          error: (error as Error).message
        });
      }
    });

    await Promise.allSettled(promises);
    logger.info('Cache warmup completed');
  }

  // 유틸리티 메서드들
  private buildKey(key: string, prefix?: string): string {
    return prefix ? `${prefix}:${key}` : key;
  }

  private getKeyPattern(key: string): string {
    // 키에서 패턴 추출 (예: user:123 -> user:*)
    return key.replace(/:\d+/g, ':*').replace(/:[a-f0-9-]{36}/g, ':*');
  }

  private recordHit(key: string): void {
    const pattern = this.getKeyPattern(key);
    const stats = this.stats.get(pattern) || this.getEmptyStats();
    stats.hits++;
    stats.hitRate = (stats.hits / (stats.hits + stats.misses)) * 100;
    this.stats.set(pattern, stats);
  }

  private recordMiss(key: string): void {
    const pattern = this.getKeyPattern(key);
    const stats = this.stats.get(pattern) || this.getEmptyStats();
    stats.misses++;
    stats.hitRate = (stats.hits / (stats.hits + stats.misses)) * 100;
    this.stats.set(pattern, stats);
  }

  private recordSet(key: string): void {
    const pattern = this.getKeyPattern(key);
    const stats = this.stats.get(pattern) || this.getEmptyStats();
    stats.sets++;
    this.stats.set(pattern, stats);
  }

  private recordDelete(key: string): void {
    const pattern = this.getKeyPattern(key);
    const stats = this.stats.get(pattern) || this.getEmptyStats();
    stats.deletes++;
    this.stats.set(pattern, stats);
  }

  private recordError(key: string): void {
    const pattern = this.getKeyPattern(key);
    const stats = this.stats.get(pattern) || this.getEmptyStats();
    stats.errors++;
    this.stats.set(pattern, stats);
  }

  private getEmptyStats(): CacheStats {
    return {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
      hitRate: 0
    };
  }

  private parseRedisInfo(info: string): any {
    const lines = info.split('\r\n');
    const result: any = {};
    let section = '';

    for (const line of lines) {
      if (line.startsWith('#')) {
        section = line.substring(1).trim();
        result[section] = {};
      } else if (line.includes(':')) {
        const [key, value] = line.split(':');
        if (section && result[section]) {
          result[section][key] = isNaN(Number(value)) ? value : Number(value);
        }
      }
    }

    return result;
  }

  // 연결 종료
  async disconnect(): Promise<void> {
    await this.redis.quit();
    logger.info('Redis connection closed');
  }
}

export default EnhancedCacheService;
