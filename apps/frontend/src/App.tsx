import React, { useState, useEffect, useMemo, useCallback, Suspense, lazy } from 'react';
import { AppProvider } from './app/providers/AppContext';
import { AuthProvider } from './app/providers/AuthContext';
import { useApp } from './app/hooks/useApp';
import { useAuth } from './features/auth/hooks/useAuth';
import { Header } from './shared/components/layout/Header';
import { ProfileRequiredModal } from './features/auth/components/ProfileRequiredModal';
import { ProfileSettingsModal } from './features/auth/components/ProfileSettingsModal';
import { ProfileRedirectModal } from './features/auth/components/ProfileRedirectModal';
import { Tooltip, DashboardLoader, AnalyticsLoader, TransactionsLoader, SettingsLoader, PageLoader } from './index';
import { ErrorBoundaryWrapper } from './shared/components/feedback/ErrorBoundary';
import { colors, shadows, borderRadius } from './styles/theme';

// 페이지 컴포넌트들을 Lazy Loading으로 변경
const DashboardPage = lazy(() => import('./features/analytics/components/DashboardPage').then(module => ({ default: module.DashboardPage })));
const TransactionsPage = lazy(() => import('./features/transactions/components/TransactionsPage').then(module => ({ default: module.TransactionsPage })));
const BudgetPage = lazy(() => import('./features/budgets/components/BudgetPage').then(module => ({ default: module.BudgetPage })));
const AnalyticsPage = lazy(() => import('./features/analytics/components/AnalyticsPage').then(module => ({ default: module.AnalyticsPage })));
const CategoriesPage = lazy(() => import('./features/transactions/components/CategoriesPage').then(module => ({ default: module.CategoriesPage })));
const SettingsPage = lazy(() => import('./app/pages/SettingsPage').then(module => ({ default: module.SettingsPage })));
const AutomationCenterPage = lazy(() => import('./features/transactions/components/AutomationCenterPage'));

// 교육 페이지들 - 에러 처리 강화
const EducationDashboard = lazy(() => 
  import('./features/education/components/EducationDashboard')
    .then(module => ({ default: module.default || module }))
    .catch(() => ({ default: () => <div>교육 페이지를 불러올 수 없습니다.</div> }))
);

// 소셜 기능 페이지 - 에러 처리 강화
const SocialDashboard = lazy(() => 
  import('./features/social/components/SocialDashboard')
    .then(module => ({ default: module.default || module }))
    .catch(() => ({ default: () => <div>소셜 페이지를 불러올 수 없습니다.</div> }))
);

// 탭 구성 타입
interface TabConfig {
  id: string;
  label: string;
  icon: string;
  color: string;
}

// 앱 콘텐츠 컴포넌트 (Context 내부에서 사용)
const AppContent: React.FC = React.memo(() => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const { darkMode } = useApp();
  const { state } = useAuth();
  
  // 사용자 정보 메모이제이션
  const { user, isAuthenticated } = useMemo(() => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated
  }), [state.user, state.isAuthenticated]);
  
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
  const handleTabChange = useCallback((tabId: string) => {
    if (isAuthenticated && user && !user.profile_completed) {
      setShowProfileRequired(true);
      return;
    }
    setActiveTab(tabId);
  }, [isAuthenticated, user]);

  const handleContinueToProfile = useCallback(() => {
    setShowProfileRequired(false);
    setShowProfileSettings(true);
  }, []);

  const handleRedirectToProfile = useCallback(() => {
    setShowProfileRedirect(false);
    setShowProfileSettings(true);
  }, []);

  const handleProfileComplete = useCallback(() => {
    setShowProfileSettings(false);
    setShowProfileRequired(false);
    setShowProfileRedirect(false);
    // 프로필 완료 후 대시보드로 이동
    setActiveTab('dashboard');
  }, []);

  // 탭 구성 메모이제이션
  const tabs: TabConfig[] = useMemo(() => [
    { id: 'dashboard', label: '대시보드', icon: '📊', color: colors.primary[500] },
    { id: 'transactions', label: '거래내역', icon: '💳', color: colors.success[500] },
    { id: 'budget', label: '예산', icon: '🎯', color: colors.warning[500] },
    { id: 'analytics', label: '분석', icon: '📈', color: colors.primary[600] },
    { id: 'categories', label: '카테고리', icon: '🏷️', color: colors.success[600] },
    { id: 'social', label: '소셜', icon: '👨‍👩‍👧‍👦', color: '#10B981' },
    { id: 'education', label: '교육', icon: '🎓', color: '#8B5CF6' },
    { id: 'automation', label: '자동화', icon: '🤖', color: '#4F8EF7' },
    { id: 'settings', label: '설정', icon: '⚙️', color: colors.gray[500] }
  ], []);

  // 컨테이너 스타일 메모이제이션
  const containerStyle = useMemo(() => ({
    minHeight: '100vh',
    backgroundColor: darkMode ? colors.dark[900] : colors.gray[50],
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  }), [darkMode]);

  return (
    <div style={containerStyle}>
      {/* 헤더 */}
      <Header onLogoClick={() => setActiveTab('dashboard')} />
      
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
            <>
              <Suspense fallback={<DashboardLoader />}>
                <DashboardPage onTabChange={handleTabChange} />
              </Suspense>
            </>
          )}
          {activeTab === 'transactions' && (
            <>
              <Suspense fallback={<TransactionsLoader />}>
                <TransactionsPage />
              </Suspense>
            </>
          )}
          {activeTab === 'budget' && (
            <>
              <Suspense fallback={<PageLoader message="예산을 불러오는 중..." />}>
                <BudgetPage />
              </Suspense>
            </>
          )}
          {activeTab === 'analytics' && (
            <>
              <Suspense fallback={<AnalyticsLoader />}>
                <AnalyticsPage />
              </Suspense>
            </>
          )}
          {activeTab === 'categories' && (
            <>
              <Suspense fallback={<PageLoader message="카테고리를 불러오는 중..." />}>
                <CategoriesPage />
              </Suspense>
            </>
          )}
          {activeTab === 'education' && (
            <ErrorBoundaryWrapper resetKeys={[activeTab, 'education']}>
              <Suspense fallback={<PageLoader message="교육 페이지를 불러오는 중..." />}>
                <EducationDashboard />
              </Suspense>
            </ErrorBoundaryWrapper>
          )}
          {activeTab === 'social' && (
            <ErrorBoundaryWrapper resetKeys={[activeTab, 'social']}>
              <Suspense fallback={<PageLoader message="소셜 기능을 불러오는 중..." />}>
                <SocialDashboard />
              </Suspense>
            </ErrorBoundaryWrapper>
          )}
          {activeTab === 'automation' && (
            <>
              <Suspense fallback={<PageLoader message="자동화 센터를 불러오는 중..." />}>
                <AutomationCenterPage />
              </Suspense>
            </>
          )}
          {activeTab === 'settings' && (
            <>
              <Suspense fallback={<SettingsLoader />}>
                <SettingsPage />
              </Suspense>
            </>
          )}
        </div>
      </main>

      {/* 프로필 필수 모달 */}
      <>
        <ProfileRequiredModal
          isOpen={showProfileRequired}
          onContinueToProfile={handleContinueToProfile}
        />
      </>

      {/* 프로필 리다이렉션 모달 */}
      <>
        <ProfileRedirectModal
          isOpen={showProfileRedirect}
          onProceed={handleRedirectToProfile}
        />
      </>

      {/* 프로필 설정 모달 */}
      <>
        <ProfileSettingsModal
          isOpen={showProfileSettings}
          onClose={handleProfileComplete}
        />
      </>

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
});

// 메인 앱 컴포넌트
const App: React.FC = () => {
  return (
    <>
      <AuthProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </AuthProvider>
    </>
  );
};

export default App;