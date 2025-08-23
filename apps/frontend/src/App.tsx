import React, { useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { useApp } from './hooks/useApp';
import { useAuth } from './hooks/useAuth';
import { Header } from './components/Header';
import { ProfileRequiredModal } from './components/modals/ProfileRequiredModal';
import { ProfileSettingsModal } from './components/modals/ProfileSettingsModal';
import { ProfileRedirectModal } from './components/modals/ProfileRedirectModal';
import { 
  DashboardPage, 
  TransactionsPage, 
  BudgetPage, 
  AnalyticsPage, 
  CategoriesPage, 
  SettingsPage, 
  AutomationCenterPage 
} from './components/pages';
import { Tooltip, ErrorBoundary, PageErrorBoundary, ModalErrorBoundary } from './components/ui';
import { colors, shadows, borderRadius } from './styles/theme';

// 앱 콘텐츠 컴포넌트 (Context 내부에서 사용)
const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const { darkMode } = useApp();
  interface User {
    id: string;
    name: string;
    email: string;
    profile_completed: boolean;
  }
  const { user, isAuthenticated } = useAuth() as { user: User; isAuthenticated: boolean };
  
  // 프로필 완성 여부 상태
  const [showProfileRequired, setShowProfileRequired] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showProfileRedirect, setShowProfileRedirect] = useState(false);
  const [hasCheckedProfile, setHasCheckedProfile] = useState(false);

  // 페이지 이탈 방지 및 프로필 체크
  useEffect(() => {
    // 로그인 시 프로필 완성 여부 체크 (한 번만)
    if (isAuthenticated && user && !hasCheckedProfile) {
      setHasCheckedProfile(true);
      
  if (!user.profile_completed) {
        // 프로필 미완성 사용자는 리다이렉션 모달 표시
        const timer = setTimeout(() => {
          setShowProfileRedirect(true);
        }, 1500); // 1.5초 후 모달 표시
        
        return () => clearTimeout(timer);
      }
    }

    // 기존 로직들...
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  if (isAuthenticated && user && !user.profile_completed) {
        e.preventDefault();
        e.returnValue = '프로필 설정이 완료되지 않았습니다. 정말로 페이지를 떠나시겠습니까?';
        return e.returnValue;
      }
    };

    const handlePopState = () => {
  if (isAuthenticated && user && !user.profile_completed) {
        setShowProfileRequired(true);
      }
    };

    // 프로필 미완성 사용자에게 경고 표시 (신규 가입자용)
  if (isAuthenticated && user && !user.profile_completed && hasCheckedProfile) {
      const timer = setTimeout(() => {
        setShowProfileRequired(true);
      }, 1000); // 1초 후 모달 표시

      return () => clearTimeout(timer);
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isAuthenticated, user, hasCheckedProfile]);

  // 로그아웃 시 상태 리셋
  useEffect(() => {
    if (!isAuthenticated) {
      setHasCheckedProfile(false);
      setShowProfileRequired(false);
      setShowProfileSettings(false);
      setShowProfileRedirect(false);
      setActiveTab('dashboard');
    }
  }, [isAuthenticated]);

  // 탭 변경 시 프로필 미완성 체크
  const handleTabChange = (tabId: string) => {
  if (isAuthenticated && user && !user.profile_completed) {
      setShowProfileRequired(true);
      return;
    }
    setActiveTab(tabId);
  };

  const handleContinueToProfile = () => {
    setShowProfileRequired(false);
    setShowProfileSettings(true);
  };

  const handleRedirectToProfile = () => {
    setShowProfileRedirect(false);
    setShowProfileSettings(true);
  };

  const handleProfileComplete = () => {
    setShowProfileSettings(false);
    setShowProfileRequired(false);
    setShowProfileRedirect(false);
    // 프로필 완료 후 대시보드로 이동
    setActiveTab('dashboard');
  };

  const tabs = [
    { id: 'dashboard', label: '대시보드', icon: '📊', color: colors.primary[500] },
    { id: 'transactions', label: '거래내역', icon: '💳', color: colors.success[500] },
    { id: 'budget', label: '예산', icon: '🎯', color: colors.warning[500] },
    { id: 'analytics', label: '분석', icon: '📈', color: colors.primary[600] },
    { id: 'categories', label: '카테고리', icon: '🏷️', color: colors.success[600] },
  { id: 'automation', label: '자동화', icon: '🤖', color: '#4F8EF7' },
    { id: 'settings', label: '설정', icon: '⚙️', color: colors.gray[500] }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: darkMode ? colors.dark[900] : colors.gray[50],
      fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      {/* 헤더 */}
      <Header />
      
      {/* 네비게이션 바 */}
      <nav style={{
        backgroundColor: darkMode ? colors.dark[800] : colors.gray[50],
        borderBottom: `1px solid ${darkMode ? colors.dark[700] : colors.gray[200]}`,
        boxShadow: darkMode ? 'none' : shadows.sm,
        position: 'sticky',
        top: '81px', // 헤더 높이 + border 만큼 조정
        zIndex: 40
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '72px',
          width: '100%'
        }}>
          {/* 탭 네비게이션 - 반응형 */}
          <div style={{
            display: 'flex',
            gap: '4px',
            backgroundColor: darkMode ? colors.dark[700] : colors.gray[100],
            padding: '4px',
            borderRadius: borderRadius.xl,
            width: '100%',
            maxWidth: '800px', // 최대 너비 제한
            justifyContent: 'space-between' // 탭들을 균등하게 분배
          }}>
            {tabs.map((tab) => (
              <Tooltip key={tab.id} text={tab.label} position="bottom">
                <button
                  onClick={() => handleTabChange(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px 8px',
                    backgroundColor: activeTab === tab.id 
                      ? (darkMode ? colors.dark[600] : colors.gray[100])
                      : 'transparent',
                    color: activeTab === tab.id 
                      ? (darkMode ? colors.dark[50] : colors.gray[900])
                      : (darkMode ? colors.dark[300] : colors.gray[600]),
                    border: 'none',
                    borderRadius: borderRadius.lg,
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: activeTab === tab.id ? '600' : '500',
                    position: 'relative',
                    boxShadow: activeTab === tab.id && !darkMode ? shadows.sm : 'none',
                    flex: '1', // 각 탭이 동일한 너비를 가지도록
                    minWidth: '0', // flex 아이템이 줄어들 수 있도록
                    whiteSpace: 'nowrap' // 텍스트가 줄바꿈되지 않도록
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
        minHeight: 'calc(100vh - 72px)'
      }}>
        <div style={{
          opacity: 1,
          transform: 'translateY(0)'
        }}>
          {activeTab === 'dashboard' && (
            <PageErrorBoundary>
              <DashboardPage />
            </PageErrorBoundary>
          )}
          {activeTab === 'transactions' && (
            <PageErrorBoundary>
              <TransactionsPage />
            </PageErrorBoundary>
          )}
          {activeTab === 'budget' && (
            <PageErrorBoundary>
              <BudgetPage />
            </PageErrorBoundary>
          )}
          {activeTab === 'analytics' && (
            <PageErrorBoundary>
              <AnalyticsPage />
            </PageErrorBoundary>
          )}
          {activeTab === 'categories' && (
            <PageErrorBoundary>
              <CategoriesPage />
            </PageErrorBoundary>
          )}
          {activeTab === 'automation' && (
            <PageErrorBoundary>
              <AutomationCenterPage />
            </PageErrorBoundary>
          )}
          {activeTab === 'settings' && (
            <PageErrorBoundary>
              <SettingsPage />
            </PageErrorBoundary>
          )}
        </div>
      </main>

      {/* 프로필 필수 모달 */}
      <ModalErrorBoundary>
        <ProfileRequiredModal
          isOpen={showProfileRequired}
          onContinueToProfile={handleContinueToProfile}
        />
      </ModalErrorBoundary>

      {/* 프로필 리다이렉션 모달 */}
      <ModalErrorBoundary>
        <ProfileRedirectModal
          isOpen={showProfileRedirect}
          onProceed={handleRedirectToProfile}
        />
      </ModalErrorBoundary>

      {/* 프로필 설정 모달 */}
      <ModalErrorBoundary>
        <ProfileSettingsModal
          isOpen={showProfileSettings}
          onClose={handleProfileComplete}
        />
      </ModalErrorBoundary>

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
    <ErrorBoundary 
      onError={(error, errorInfo) => {
        console.error('🚨 Global App Error:', error);
        console.error('📍 Error Context:', errorInfo);
        
        // TODO: 실제 프로덕션에서는 에러 리포팅 서비스에 전송
        // - Sentry.captureException(error, { extra: errorInfo });
        // - 또는 Google Analytics, LogRocket 등으로 전송
        
        // 사용자에게 알림 (선택적)
        if (window.confirm('예상치 못한 오류가 발생했습니다. 페이지를 새로고침하시겠습니까?')) {
          window.location.reload();
        }
      }}
    >
      <AuthProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
