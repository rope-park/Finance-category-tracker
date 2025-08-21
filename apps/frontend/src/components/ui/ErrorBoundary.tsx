import React, { Component, type ReactNode } from 'react';
import { colors } from '../../styles/theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // 다음 렌더링에서 폴백 UI가 보이도록 상태를 업데이트
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 에러 정보를 상태에 저장
    this.setState({
      error,
      errorInfo
    });

    // 부모 컴포넌트에 에러 콜백 호출
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 에러 로깅 (실제 환경에서는 Sentry, LogRocket 등으로 전송)
    console.error('💥 Error Boundary caught an error:', error);
    console.error('📍 Error Info:', errorInfo);

    // TODO: 실제 프로덕션에서는 에러 리포팅 서비스에 전송
    // Sentry.captureException(error, { extra: errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // 커스텀 폴백 UI가 제공된 경우 사용
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 기본 에러 UI 렌더링
      return (
        <DefaultErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRetry={this.handleRetry}
          onReload={this.handleReload}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  errorInfo?: React.ErrorInfo;
  onRetry: () => void;
  onReload: () => void;
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  onRetry,
  onReload
}) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '40px 20px',
      backgroundColor: '#f8fafc',
      fontFamily: "'Noto Sans KR', sans-serif"
    }}>
      <div style={{
        maxWidth: '600px',
        textAlign: 'center',
        background: '#ffffff',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        border: `1px solid ${colors.gray[200]}`
      }}>
        {/* 에러 아이콘 */}
        <div style={{
          fontSize: '64px',
          marginBottom: '24px'
        }}>
          💥
        </div>

        {/* 메인 제목 */}
        <h1 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: colors.gray[900],
          margin: '0 0 16px 0'
        }}>
          앗! 문제가 발생했습니다
        </h1>

        {/* 설명 */}
        <p style={{
          fontSize: '16px',
          color: colors.gray[600],
          margin: '0 0 32px 0',
          lineHeight: '1.6'
        }}>
          예상치 못한 오류로 인해 페이지를 표시할 수 없습니다.<br />
          잠시 후 다시 시도해주세요.
        </p>

        {/* 버튼들 */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          marginBottom: isDevelopment ? '32px' : '0'
        }}>
          <button
            onClick={onRetry}
            style={{
              padding: '12px 24px',
              backgroundColor: colors.primary[600],
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: "'Noto Sans KR', sans-serif"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.primary[700];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.primary[600];
            }}
          >
            다시 시도
          </button>
          
          <button
            onClick={onReload}
            style={{
              padding: '12px 24px',
              backgroundColor: colors.gray[100],
              color: colors.gray[700],
              border: `1px solid ${colors.gray[300]}`,
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: "'Noto Sans KR', sans-serif"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.gray[200];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.gray[100];
            }}
          >
            페이지 새로고침
          </button>
        </div>

        {/* 개발 환경에서만 상세 에러 정보 표시 */}
        {isDevelopment && error && (
          <details style={{
            textAlign: 'left',
            marginTop: '32px',
            padding: '16px',
            backgroundColor: colors.gray[50],
            borderRadius: '8px',
            border: `1px solid ${colors.gray[200]}`
          }}>
            <summary style={{
              cursor: 'pointer',
              fontWeight: '600',
              color: colors.gray[700],
              marginBottom: '12px'
            }}>
              🔍 개발자 정보 (Development Only)
            </summary>
            
            <div style={{
              fontSize: '12px',
              fontFamily: 'monospace',
              color: colors.error[600]
            }}>
              <div style={{ marginBottom: '12px' }}>
                <strong>Error:</strong> {error.name}
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong>Message:</strong> {error.message}
              </div>
              {error.stack && (
                <div style={{ marginBottom: '12px' }}>
                  <strong>Stack Trace:</strong>
                  <pre style={{
                    backgroundColor: colors.gray[900],
                    color: '#ffffff',
                    padding: '12px',
                    borderRadius: '4px',
                    overflow: 'auto',
                    fontSize: '11px',
                    lineHeight: '1.4'
                  }}>
                    {error.stack}
                  </pre>
                </div>
              )}
              {errorInfo && (
                <div>
                  <strong>Component Stack:</strong>
                  <pre style={{
                    backgroundColor: colors.gray[900],
                    color: '#ffffff',
                    padding: '12px',
                    borderRadius: '4px',
                    overflow: 'auto',
                    fontSize: '11px',
                    lineHeight: '1.4'
                  }}>
                    {errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}

        {/* 연락처 정보 */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          backgroundColor: colors.primary[50],
          borderRadius: '8px',
          border: `1px solid ${colors.primary[200]}`
        }}>
          <p style={{
            fontSize: '14px',
            color: colors.primary[700],
            margin: 0,
            lineHeight: '1.5'
          }}>
            💡 <strong>문제가 지속된다면?</strong><br />
            이 문제를 신고해 주시면 빠르게 해결하겠습니다.
          </p>
        </div>
      </div>
    </div>
  );
};

// Higher-Order Component로도 사용 가능
export function withErrorBoundary<P extends Record<string, unknown>>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

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
