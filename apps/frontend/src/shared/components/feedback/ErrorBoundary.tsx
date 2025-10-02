import { Component } from 'react';
import type { ReactNode } from 'react';
import { colors, shadows } from '../../../styles/theme';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetKeys?: Array<string | number>;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId?: NodeJS.Timeout;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // 에러 리포팅
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 개발 환경에서 추가 로깅
    if (process.env.NODE_ENV === 'development') {
      console.group('🔍 Error Details');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys } = this.props;
    const { hasError } = this.state;

    // 리셋 키가 변경되었고 에러 상태인 경우 복구 시도
    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetKeys?.some((key, idx) => prevProps.resetKeys?.[idx] !== key)) {
        this.resetErrorBoundary();
      }
    }
  }

  resetErrorBoundary = () => {
    // 기존 타이머 클리어
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    // 상태 리셋
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined
    });
  };

  handleRetry = () => {
    this.resetErrorBoundary();
  };

  render() {
    if (this.state.hasError) {
      // 사용자 정의 fallback이 있으면 사용
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 기본 에러 UI
      return (
        <div style={{
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px',
          background: colors.gray[50],
          borderRadius: '12px',
          border: `1px solid ${colors.gray[200]}`,
          margin: '16px 0'
        }}>
          <div style={{
            textAlign: 'center',
            maxWidth: '500px',
            background: 'white',
            padding: '48px 32px',
            borderRadius: '16px',
            boxShadow: shadows.lg,
            border: `1px solid ${colors.gray[100]}`
          }}>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>💥</div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: colors.gray[900],
              margin: '0 0 16px 0'
            }}>
              앗! 뭔가 잘못되었어요
            </h2>
            <p style={{
              fontSize: '16px',
              color: colors.gray[600],
              margin: '0 0 32px 0',
              lineHeight: '1.6'
            }}>
              예상치 못한 오류가 발생했습니다.<br />
              페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
            </p>
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={this.handleRetry}
                style={{
                  background: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.primary[700]})`,
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  minWidth: '120px'
                }}
              >
                🔄 다시 시도
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{
                  background: 'transparent',
                  color: colors.gray[700],
                  border: `2px solid ${colors.gray[300]}`,
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  minWidth: '120px'
                }}
              >
                🔃 새로고침
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook 기반 에러 바운더리 래퍼
export const ErrorBoundaryWrapper: React.FC<{
  children: ReactNode;
  fallback?: ReactNode;
  resetKeys?: Array<string | number>;
}> = ({ children, fallback, resetKeys }) => {
  return (
    <ErrorBoundary
      fallback={fallback}
      resetKeys={resetKeys}
      onError={(error, errorInfo) => {
        // 에러 로깅 또는 추가 처리
        console.error('Component Error:', {
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack
        });
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

// 특정 컴포넌트용 에러 바운더리들
export const PageErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    onError={(error) => {
      console.error('💥 Page Error:', error);
      // TODO: 페이지 레벨 에러 리포팅
    }}
  >
    {children}
  </ErrorBoundary>
);

export const ModalErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    fallback={
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: colors.gray[600]
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>💥</div>
        <h3 style={{ margin: '0 0 8px 0', color: colors.gray[900] }}>
          모달 로딩 중 오류 발생
        </h3>
        <p style={{ margin: 0 }}>
          모달을 닫고 다시 시도해주세요.
        </p>
      </div>
    }
    onError={(error) => {
      console.error('💥 Modal Error:', error);
      // TODO: 모달 레벨 에러 리포팅
    }}
  >
    {children}
  </ErrorBoundary>
);