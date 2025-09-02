// Redis 클라이언트 초기화 및 캐싱 유틸리티
// (Node.js/Express 환경 기준, ioredis 사용 예시)

import { createClient } from 'redis';

const redis = createClient({
  url: `redis://${process.env.REDIS_PASSWORD ? `:${process.env.REDIS_PASSWORD}@` : ''}${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || 6379}/0`
});

redis.connect();

export async function getCache(key: string) {
  const data = await redis.get(key);
  const strData = typeof data === 'string' ? data : data?.toString();
  return strData ? JSON.parse(strData) : null;
}

export async function setCache(key: string, value: any, ttlSeconds = 300) {
  await redis.set(key, JSON.stringify(value), { EX: ttlSeconds });
}

export async function delCache(key: string) {
  await redis.del(key);
}

export default redis;
