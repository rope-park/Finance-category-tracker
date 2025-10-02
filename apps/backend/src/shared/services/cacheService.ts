import Redis from 'ioredis';
import logger from '../utils/logger';

// Redis 기반 캐시 서비스
class CacheService {
  private redis: Redis;
  private isConnected: boolean = false;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    this.redis.on('connect', () => {
      logger.info('✅ Redis connected');
      this.isConnected = true;
    });

    this.redis.on('error', (err) => {
      logger.error('❌ Redis error:', err);
      this.isConnected = false;
    });

    this.redis.on('close', () => {
      logger.warn('⚠️  Redis connection closed');
      this.isConnected = false;
    });
  }

  async connect(): Promise<void> {
    try {
      await this.redis.connect();
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      // Redis 연결 실패 시에도 앱이 동작하도록 함
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.redis.disconnect();
    }
  }

  // 기본 캐시 작업
  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected) return null;
    
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    if (!this.isConnected) return false;
    
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.redis.setex(key, ttlSeconds, serialized);
      } else {
        await this.redis.set(key, serialized);
      }
      return true;
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.isConnected) return false;
    
    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isConnected) return false;
    
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  // 패턴 기반 키 삭제
  async deletePattern(pattern: string): Promise<number> {
    if (!this.isConnected) return 0;
    
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      return keys.length;
    } catch (error) {
      logger.error(`Cache delete pattern error for pattern ${pattern}:`, error);
      return 0;
    }
  }

  // TTL 확인
  async getTTL(key: string): Promise<number> {
    if (!this.isConnected) return -1;
    
    try {
      return await this.redis.ttl(key);
    } catch (error) {
      logger.error(`Cache TTL error for key ${key}:`, error);
      return -1;
    }
  }

  // 캐시 통계
  async getStats() {
    if (!this.isConnected) return null;
    
    try {
      const info = await this.redis.info('memory');
      const keyspace = await this.redis.info('keyspace');
      
      return {
        connected: this.isConnected,
        memory: info,
        keyspace: keyspace,
        dbSize: await this.redis.dbsize(),
      };
    } catch (error) {
      logger.error('Cache stats error:', error);
      return null;
    }
  }

  // 헬스체크
  async healthCheck(): Promise<boolean> {
    if (!this.isConnected) return false;
    
    try {
      const pong = await this.redis.ping();
      return pong === 'PONG';
    } catch (error) {
      logger.error('Cache health check error:', error);
      return false;
    }
  }
}

// 싱글톤 인스턴스
export const cacheService = new CacheService();

// 캐시 키 생성 헬퍼
export const CacheKeys = {
  // 사용자 관련
  user: (userId: string) => `user:${userId}`,
  userProfile: (userId: string) => `user:profile:${userId}`,
  userPreferences: (userId: string) => `user:preferences:${userId}`,
  
  // 거래 관련
  transactions: (userId: string, page?: number) => 
    page ? `transactions:${userId}:page:${page}` : `transactions:${userId}`,
  transactionsByCategory: (userId: string, categoryId: string) => 
    `transactions:${userId}:category:${categoryId}`,
  
  // 예산 관련
  budgets: (userId: string) => `budgets:${userId}`,
  budgetSummary: (userId: string, month: string) => `budget:summary:${userId}:${month}`,
  
  // 분석 관련
  analytics: (userId: string, period: string) => `analytics:${userId}:${period}`,
  monthlyReport: (userId: string, month: string) => `report:monthly:${userId}:${month}`,
  categoryTrends: (userId: string) => `trends:category:${userId}`,
  
  // 카테고리 관련
  categories: (userId: string) => `categories:${userId}`,
  categoryTree: (userId: string) => `categories:tree:${userId}`,
  
  // 세션 관련
  session: (sessionId: string) => `session:${sessionId}`,
  refreshToken: (tokenId: string) => `refresh:${tokenId}`,
  
  // Rate limiting
  rateLimit: (ip: string, endpoint: string) => `rate:${ip}:${endpoint}`,
};

// 캐시 TTL 상수 (초)
export const CacheTTL = {
  VERY_SHORT: 60,          // 1분
  SHORT: 300,              // 5분
  MEDIUM: 900,             // 15분
  LONG: 3600,              // 1시간
  VERY_LONG: 86400,        // 24시간
  SESSION: 604800,         // 7일
};
