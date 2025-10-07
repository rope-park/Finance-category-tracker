/**
 * 거래 관리 기능 모듈 (핵심 기능)
 * 
 * 거래 내역 관리, 카테고리 분류, 자동 추천 등
 * 앱의 가장 중요한 기능들이 모여있는 곳.
 */

// 거래 내역 관련
export * from './transaction.controller';
export * from './transaction.service';
export * from './transaction.repository';
export * from './transaction.routes';

// 카테고리 관련
export * from './category.service';
export * from './category.routes';

// 카테고리 자동화 및 추천
export * from './category-auto.service';
export * from './category-recommend.service';

// 반복 거래 템플릿 (정기 결제 등)
export * from './recurring-template.service';
export * from './recurring-template.repository';
export * from './recurring-template.routes';