import React, { Suspense } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { Spinner } from './Spinner';

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}

/**
 * Lazy 컴포넌트를 위한 Suspense + ErrorBoundary 래퍼
 */
export const LazyWrapper: React.FC<LazyWrapperProps> = ({
  children,
  fallback = <LoadingFallback />,
  errorFallback = <ErrorFallback />
}) => {
  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

/**
 * 기본 로딩 폴백 컴포넌트
 */
const LoadingFallback: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '400px',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <Spinner size="large" />
      <p style={{
        color: '#6B7280',
        fontSize: '14px',
        margin: 0
      }}>
        페이지를 불러오는 중...
      </p>
    </div>
  );
};

/**
 * 기본 에러 폴백 컴포넌트
 */
const ErrorFallback: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '400px',
      flexDirection: 'column',
      gap: '16px',
      textAlign: 'center',
      padding: '24px'
    }}>
      <div style={{ fontSize: '48px' }}>⚠️</div>
      <h3 style={{
        color: '#DC2626',
        fontSize: '18px',
        margin: 0
      }}>
        페이지를 불러올 수 없습니다
      </h3>
      <p style={{
        color: '#6B7280',
        fontSize: '14px',
        margin: 0,
        maxWidth: '400px'
      }}>
        일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          padding: '8px 16px',
          backgroundColor: '#3B82F6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        새로고침
      </button>
    </div>
  );
};
