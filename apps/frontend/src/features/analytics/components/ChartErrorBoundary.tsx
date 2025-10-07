/**
 * 차트 컴포넌트 에러 바운더리 컴포넌트
 * 
 * 주요 기능:
 * - 차트 렌더링 중 발생하는 JavaScript 에러 포착
 * - 에러 발생 시 사용자 친화적인 폴백 UI 표시
 * - 에러 정보 콘솔 로깅 (디버깅용)
 * - 커스텀 폴백 컴포넌트 지원
 */

import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

// ChartErrorBoundary 컴포넌트의 Props 인터페이스
interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

// ChartErrorBoundary 컴포넌트의 State 인터페이스
interface State {
  hasError: boolean;
  error?: Error;
}

// 차트 전용 에러 바운더리 클래스 컴포넌트
class ChartErrorBoundary extends Component<Props, State> {
  // 생성자에서 초기 상태 설정
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  // 에러 발생 시 상태 업데이트
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 에러 정보를 콘솔에 기록 (개발/디버깅용)
    console.error('Chart.js Error:', error, errorInfo);
    
    // TODO: 프로덕션에서는 에러 리포팅 서비스로 전송
    // errorReportingService.captureException(error, {
    //   extra: errorInfo,
    //   tags: { component: 'ChartErrorBoundary' }
    // });
  }

  render() {
    // 에러가 발생한 경우 폴백 UI 표시
    if (this.state.hasError) {
      return (
        // 커스텀 폴백이 제공된 경우 사용, 아니면 기본 에러 UI 표시
        this.props.fallback || (
          <div className="flex items-center justify-center h-64 border border-red-200 rounded-lg bg-red-50">
            <div className="text-center text-red-600">
              {/* 에러 제목 */}
              <div className="mb-2 text-lg font-semibold">차트 로딩 오류</div>
              
              {/* 에러 설명 및 해결 방법 안내 */}
              <div className="text-sm">
                차트를 표시하는 중 오류가 발생했습니다.
                <br />
                데이터를 다시 불러오거나 페이지를 새로고침해 주세요.
              </div>
            </div>
          </div>
        )
      );
    }

    // 에러가 없는 경우 정상적으로 자식 컨포넌트 렌더링
    return this.props.children;
  }
}

export default ChartErrorBoundary;