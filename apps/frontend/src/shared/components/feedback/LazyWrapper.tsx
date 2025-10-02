import React, { Suspense } from 'react';
import { Card, Button, Spinner, ErrorBoundary } from '../../../index';
import { useApp } from '../../../app/hooks/useApp';
import { colors } from '../../../styles/theme';

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
  const { darkMode } = useApp();
  
  return (
    <Card style={{ 
      textAlign: 'center', 
      padding: '48px 24px',
      margin: '32px auto',
      maxWidth: '500px'
    }}>
      <Spinner size="large" />
      <p className="text-sm readable-text" style={{
        color: darkMode ? colors.dark[400] : colors.gray[600],
        margin: '16px 0 0 0',
        fontFamily: "'Noto Sans KR', sans-serif"
      }}>
        페이지를 불러오는 중...
      </p>
    </Card>
  );
};

/**
 * 기본 에러 폴백 컴포넌트
 */
const ErrorFallback: React.FC = () => {
  const { darkMode } = useApp();
  
  return (
    <Card style={{ 
      textAlign: 'center', 
      padding: '48px 24px',
      margin: '32px auto',
      maxWidth: '500px'
    }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
      <h3 className="heading-3 high-contrast" style={{
        color: darkMode ? colors.error[400] : colors.error[600],
        margin: '0 0 12px 0',
        fontFamily: "'Noto Sans KR', sans-serif"
      }}>
        페이지를 불러올 수 없습니다
      </h3>
      <p className="text-sm readable-text" style={{
        color: darkMode ? colors.dark[400] : colors.gray[600],
        margin: '0 0 24px 0',
        fontFamily: "'Noto Sans KR', sans-serif"
      }}>
        일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
      </p>
      <Button
        variant="primary"
        onClick={() => window.location.reload()}
      >
        새로고침
      </Button>
    </Card>
  );
};
