import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { useApp } from './hooks/useApp';
import { 
  DashboardPage, 
  TransactionsPage, 
  BudgetPage, 
  AnalyticsPage, 
  CategoriesPage, 
  SettingsPage 
} from './components/pages';
import { Tooltip } from './components/ui';
import { colors, shadows, borderRadius, animation } from './styles/theme';

// 앱 콘텐츠 컴포넌트 (Context 내부에서 사용)
const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const { darkMode } = useApp();

  const tabs = [
    { id: 'dashboard', label: '대시보드', icon: '📊', color: colors.primary[500] },
    { id: 'transactions', label: '거래내역', icon: '💳', color: colors.success[500] },
    { id: 'budget', label: '예산', icon: '🎯', color: colors.warning[500] },
    { id: 'analytics', label: '분석', icon: '📈', color: colors.primary[600] },
    { id: 'categories', label: '카테고리', icon: '🏷️', color: colors.success[600] },
    { id: 'settings', label: '설정', icon: '⚙️', color: colors.gray[500] }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: darkMode ? colors.dark[900] : colors.gray[50],
      fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      transition: animation.transition.slow
    }}>
      {/* 네비게이션 바 */}
      <nav style={{
        backgroundColor: darkMode ? colors.dark[800] : colors.gray[50],
        borderBottom: `1px solid ${darkMode ? colors.dark[700] : colors.gray[200]}`,
        boxShadow: darkMode ? 'none' : shadows.sm,
        position: 'sticky',
        top: 0,
        zIndex: 50,
        transition: animation.transition.slow
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '72px'
        }}>
          {/* 로고 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.primary[600]})`,
              borderRadius: borderRadius.lg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              boxShadow: shadows.md
            }}>
              💰
            </div>
            <div>
              <h1 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: darkMode ? colors.dark[50] : colors.gray[900],
                margin: 0,
                letterSpacing: '-0.025em'
              }}>
                가계부
              </h1>
              <p style={{
                fontSize: '12px',
                color: darkMode ? colors.dark[400] : colors.gray[500],
                margin: 0,
                fontWeight: '400'
              }}>
                스마트 재정 관리 도구
              </p>
            </div>
          </div>

          {/* 탭 네비게이션 */}
          <div style={{
            display: 'flex',
            gap: '4px',
            backgroundColor: darkMode ? colors.dark[700] : colors.gray[100],
            padding: '4px',
            borderRadius: borderRadius.xl
          }}>
            {tabs.map((tab) => (
              <Tooltip key={tab.id} text={tab.label} position="bottom">
                <button
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    backgroundColor: activeTab === tab.id 
                      ? (darkMode ? colors.dark[600] : colors.gray[100])
                      : 'transparent',
                    color: activeTab === tab.id 
                      ? (darkMode ? colors.dark[50] : colors.gray[900])
                      : (darkMode ? colors.dark[300] : colors.gray[600]),
                    border: 'none',
                    borderRadius: borderRadius.lg,
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: activeTab === tab.id ? '600' : '500',
                    transition: animation.transition.normal,
                    position: 'relative',
                    boxShadow: activeTab === tab.id && !darkMode ? shadows.sm : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.backgroundColor = darkMode ? colors.dark[600] : colors.gray[200];
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  <span style={{ 
                    fontSize: '18px',
                    filter: activeTab === tab.id ? 'none' : 'grayscale(0.3)'
                  }}>
                    {tab.icon}
                  </span>
                  <span className="nav-label">{tab.label}</span>
                  
                  {/* 활성 탭 인디케이터 */}
                  {activeTab === tab.id && (
                    <div style={{
                      position: 'absolute',
                      bottom: '-6px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '20px',
                      height: '3px',
                      backgroundColor: tab.color,
                      borderRadius: borderRadius.full
                    }} />
                  )}
                </button>
              </Tooltip>
            ))}
          </div>
        </div>
      </nav>

      {/* 메인 콘텐츠 */}
      <main style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '32px 24px',
        backgroundColor: darkMode ? colors.dark[900] : colors.gray[50],
        minHeight: 'calc(100vh - 72px)',
        transition: animation.transition.slow
      }}>
        <div style={{
          opacity: 1,
          transform: 'translateY(0)',
          transition: animation.transition.slow
        }}>
          {activeTab === 'dashboard' && <DashboardPage />}
          {activeTab === 'transactions' && <TransactionsPage />}
          {activeTab === 'budget' && <BudgetPage />}
          {activeTab === 'analytics' && <AnalyticsPage />}
          {activeTab === 'categories' && <CategoriesPage />}
          {activeTab === 'settings' && <SettingsPage />}
        </div>
      </main>

      {/* CSS 스타일 */}
      <style>{`
        * {
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          padding: 0;
        }
        
        @media (max-width: 768px) {
          .nav-label {
            display: none;
          }
        }
        
        @media (max-width: 640px) {
          main {
            padding: 16px 12px !important;
          }
          
          nav > div {
            padding: 0 12px !important;
          }
        }
        
        /* 스크롤바 스타일링 */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: ${darkMode ? colors.dark[800] : colors.gray[100]};
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: ${darkMode ? colors.dark[600] : colors.gray[300]};
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: ${darkMode ? colors.dark[500] : colors.gray[400]};
        }
      `}</style>
    </div>
  );
};

// 메인 앱 컴포넌트
const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
