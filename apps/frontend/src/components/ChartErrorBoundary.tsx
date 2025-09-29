import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ChartErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Chart.js Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center h-64 border border-red-200 rounded-lg bg-red-50">
            <div className="text-center text-red-600">
              <div className="mb-2 text-lg font-semibold">차트 로딩 오류</div>
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

    return this.props.children;
  }
}

export default ChartErrorBoundary;