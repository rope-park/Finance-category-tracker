import React from 'react';
import { useApp } from '../../../app/hooks/useApp';
import { colors } from '../../../styles/theme';

interface PageLoaderProps {
  message?: string;
}

export const PageLoader: React.FC<PageLoaderProps> = ({ 
  message = "페이지를 불러오는 중..." 
}) => {
  const { darkMode } = useApp();

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    padding: '40px',
    color: darkMode ? colors.gray[300] : colors.gray[600],
  };

  const spinnerStyle = {
    width: '40px',
    height: '40px',
    border: `3px solid ${darkMode ? colors.gray[700] : colors.gray[200]}`,
    borderTop: `3px solid ${colors.primary[500]}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px',
  };

  const messageStyle = {
    fontSize: '16px',
    fontWeight: '500',
    opacity: 0.8,
  };

  return (
    <div style={containerStyle}>
      <div style={spinnerStyle}></div>
      <div style={messageStyle}>{message}</div>
      
      {/* CSS 애니메이션 */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// 다양한 페이지별 로더
export const DashboardLoader: React.FC = () => (
  <PageLoader message="대시보드를 불러오는 중..." />
);

export const AnalyticsLoader: React.FC = () => (
  <PageLoader message="분석 데이터를 불러오는 중..." />
);

export const TransactionsLoader: React.FC = () => (
  <PageLoader message="거래 내역을 불러오는 중..." />
);

export const SettingsLoader: React.FC = () => (
  <PageLoader message="설정을 불러오는 중..." />
);
