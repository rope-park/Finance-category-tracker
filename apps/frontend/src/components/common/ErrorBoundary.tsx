import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { colors, shadows } from '../../styles/theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId?: NodeJS.Timeout;

  constructor(props: Props) {
    super(props);

    this.state = {
      hasError: false
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // 다음 렌더링에서 폴백 UI가 보이도록 상태를 업데이트
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 에러 정보를 상태에 저장
    this.setState({
      error,
      errorInfo
    });

    // 에러 콜백 실행
    this.props.onError?.(error, errorInfo);

    // 콘솔에 에러 로그
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  componentDidUpdate(prevProps: Props) {
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

  tryAgain = () => {
    this.resetErrorBoundary();
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // 커스텀 폴백이 제공된 경우 사용
      if (fallback) {
        return fallback;
      }

      // 기본 에러 UI
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
          minHeight: '400px',
          backgroundColor: colors.gray[50],
          borderRadius: '12px',
          border: `1px solid ${colors.gray[200]}`,
          boxShadow: shadows.sm,
          margin: '24px 0'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px'
          }}>
            😵
          </div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: colors.gray[900],
            marginBottom: '8px',
            textAlign: 'center'
          }}>
            앗! 문제가 발생했습니다
          </h2>
          <p style={{
            fontSize: '16px',
            color: colors.gray[600],
            marginBottom: '24px',
            textAlign: 'center',
            lineHeight: '1.5'
          }}>
            페이지를 불러오는 중 오류가 발생했습니다.<br />
            잠시 후 다시 시도해보세요.
          </p>
          
          {/* 개발 환경에서는 에러 상세 정보 표시 */}
          {process.env.NODE_ENV === 'development' && error && (
            <details style={{
              marginBottom: '24px',
              padding: '16px',
              backgroundColor: colors.error[50],
              border: `1px solid ${colors.error[200]}`,
              borderRadius: '8px',
              width: '100%',
              maxWidth: '600px'
            }}>
              <summary style={{
                cursor: 'pointer',
                fontWeight: '500',
                color: colors.error[700],
                marginBottom: '8px'
              }}>
                에러 상세 정보 (개발용)
              </summary>
              <pre style={{
                fontSize: '12px',
                color: colors.error[600],
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                margin: 0,
                maxHeight: '200px',
                overflow: 'auto'
              }}>
                {error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}

          <button
            onClick={this.tryAgain}
            style={{
              padding: '12px 24px',
              backgroundColor: colors.primary[500],
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: shadows.sm
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.primary[600];
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.primary[500];
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            다시 시도
          </button>
        </div>
      );
    }

    return children;
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