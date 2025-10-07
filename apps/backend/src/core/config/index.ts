/**
 * 핵심 설정 모듈들
 * 
 * 데이터베이스, API 문서화 등 애플리케이션의 핵심 설정들.
 * 서버 시작시 필수적으로 로드되는 설정들을 관리.
 */

// 데이터베이스 연결 설정 (PostgreSQL)
export * from './database';

// API 문서화 설정 (Swagger/OpenAPI)
export * from './swagger';