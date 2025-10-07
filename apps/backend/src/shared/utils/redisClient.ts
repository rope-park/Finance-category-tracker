/**
 * Redis 클라이언트 초기화 및 캐싱 유틸리티
 * 
 * Redis를 사용한 고성능 캐싱 시스템을 제공하는 유틸리티 모듈.
 * 애플리케이션 전반에서 데이터 캐싱, 세션 관리, 임시 데이터 저장 등에 활용.
 * Express 환경에서 redis 라이브러리를 사용하여 구현.
 * 
 * 주요 기능:
 * - Redis 서버 연결 및 클라이언트 초기화
 * - 키-값 기반 데이터 캐싱 (TTL 지원)
 * - JSON 데이터 자동 직렬화/역직렬화
 * - 환경변수 기반 연결 설정 관리
 * 
 * 환경변수:
 * - REDIS_URL: 전체 Redis 연결 URL
 * - REDIS_HOST: Redis 서버 호스트 (기본값: redis)
 * - REDIS_PORT: Redis 서버 포트 (기본값: 6379)
 * - REDIS_PASSWORD: Redis 인증 비밀번호 (선택)
 * 
 * @author Ju Eul Park (rope-park)
 */

import { createClient } from 'redis';

/**
 * Redis 클라이언트 인스턴스 생성 및 설정
 * 
 * 환경변수를 통해 Redis 서버 연결 정보를 동적으로 구성.
 * 비밀번호가 있는 경우와 없는 경우를 모두 지원하여 유연한 연결 설정 제공.
 */
const redis = createClient({
  url: process.env.REDIS_URL || `redis://${process.env.REDIS_PASSWORD ? `:${process.env.REDIS_PASSWORD}@` : ''}${process.env.REDIS_HOST || 'redis'}:${process.env.REDIS_PORT || 6379}/0`
});

// Redis 서버에 연결 실행
redis.connect();

/**
 * 캐시에서 데이터를 조회하는 함수
 * 
 * 지정된 키로 Redis에서 데이터를 가져와 JSON 형태로 파싱하여 반환.
 * 데이터가 존재하지 않거나 파싱에 실패할 경우 null을 반환.
 * 
 * @param key - 조회할 캐시 키
 * @returns 캐시된 데이터 객체 또는 null
 */
export async function getCache(key: string) {
  const data = await redis.get(key);
  const strData = typeof data === 'string' ? data : data?.toString();
  return strData ? JSON.parse(strData) : null;
}

/**
 * 캐시에 데이터를 저장하는 함수
 * 
 * 객체를 JSON 문자열로 직렬화하여 Redis에 저장하고 TTL(Time To Live)을 설정.
 * 기본 TTL은 300초(5분)이며, 필요에 따라 조정 가능.
 * 
 * @param key - 저장할 캐시 키
 * @param value - 저장할 데이터 (객체, 배열, 원시값 모두 가능)
 * @param ttlSeconds - 캐시 만료 시간 (초 단위, 기본값: 300초)
 */
export async function setCache(key: string, value: any, ttlSeconds = 300) {
  await redis.set(key, JSON.stringify(value), { EX: ttlSeconds });
}

/**
 * 캐시에서 데이터를 삭제하는 함수
 * 
 * 지정된 키에 해당하는 캐시 데이터를 Redis에서 완전히 제거.
 * 캐시 무효화나 민감한 데이터 정리 시 사용.
 * 
 * @param key - 삭제할 캐시 키
 */
export async function delCache(key: string) {
  await redis.del(key);
}

export default redis;
