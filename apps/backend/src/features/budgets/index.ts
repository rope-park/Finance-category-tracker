/**
 * 예산 및 목표 관리 기능 모듈
 * 
 * 예산 설정, 목표 관리, 알림, 스케줄링 등
 * 사용자의 재정 계획을 도와주는 핵심 기능.
 */

// 예산 관리
export * from './budget.controller';
export * from './budget.service';
export * from './budget.repository';
export * from './budget.routes';

// 예산 스케줄링 (자동 예산 갱신 등)
export * from './budget.scheduler';

// 예산 초과 알림 서비스
export * from './alert.service';

// 목표 관리
export * from './goal.repository';
export * from './goal.routes';