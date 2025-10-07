/**
 * 분석 및 통계 기능 모듈
 * 
 * 지출 전대에 대한 분석, 통계, 예측 기능
 * 사용자의 재정 패턴을 분석하여 인사이트 제공.
 */

// 기본 분석 기능
export * from './analytics.controller';
export * from './analytics.service';
export * from './analytics.repository';
export * from './analytics.routes';

// 성능 분석
export * from './performance.routes';

// 예측 기능 (다음달 예산, 지출 예측 등)
export * from './prediction.routes';