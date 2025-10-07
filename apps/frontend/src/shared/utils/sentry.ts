
/** 
 * Sentry 유틸리티
 * 
 */

// 현재는 Sentry가 비활성화된 상태
// TODO: 추후 필요시 Sentry 활성화 고려. ErrorBoundary와 initSentry 함수는 Sentry가 활성화될 때 실제 구현으로 교체 필요.
import React from 'react';

export const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return children;
};

export const initSentry = () => {
  console.log('Sentry disabled');
};
