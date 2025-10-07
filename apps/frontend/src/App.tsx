/**
 * 가계부 앱의 메인 컴포넌트
 * 
 * 주요 기능:
 * - 인증 상태 관리
 * - 전역 상태 관리 (테마, 설정, 거래 데이터 등)
 * - 페이지 라우팅 및 네비게이션
 * - 프로필 설정 유도 및 모달 관리
 * - 반응형 디자인 및 접근성 고려
 */

// React 및 관련 라이브러리 임포트
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

// 페이지 컴포넌트들을 동적으로 임포트하여 초기 로드 속도 개선
const DashboardPage = lazy(() => import('./features/analytics/components/DashboardPage').then(module => ({ default: module.DashboardPage })));
const TransactionsPage = lazy(() => import('./features/transactions/components/TransactionsPage').then(module => ({ default: module.TransactionsPage })));
const BudgetPage = lazy(() => import('./features/budgets/components/BudgetPage').then(module => ({ default: module.BudgetPage })));
const AnalyticsPage = lazy(() => import('./features/analytics/components/AnalyticsPage').then(module => ({ default: module.AnalyticsPage })));
const CategoriesPage = lazy(() => import('./features/transactions/components/CategoriesPage').then(module => ({ default: module.CategoriesPage })));
const SettingsPage = lazy(() => import('./app/pages/SettingsPage').then(module => ({ default: module.SettingsPage })));
const AutomationCenterPage = lazy(() => import('./features/transactions/components/AutomationCenterPage'));

// 교육 대시보드 - 모듈 임포트 실패 시 에러 화면을 보여줌
const EducationDashboard = lazy(() => 
  import('./features/education/components/EducationDashboard')
    .then(module => ({ default: module.default || module }))
    .catch(() => ({ default: () => <div>교육 페이지를 불러올 수 없습니다.</div> }))
);

// 소셜 기능 대시보드 - 모듈 임포트 실패 시 에러 화면을 보여줌
const SocialDashboard = lazy(() =>
  import('./features/social/components/SocialDashboard')
    .then(module => ({ default: module.default || module }))
    .catch(() => ({ default: () => <div>소셜 페이지를 불러올 수 없습니다.</div> }))
);

// 탭 구성 타입 정의
interface TabConfig {
  id: string;    // 탭의 고유 식별자
  label: string; // 탭에 표시될 텍스트
  icon: string;  // 탭 아이콘 (이모지)
  color: string; // 활성 상태일 때 표시될 색상
}

// 앱의 주요 콘텐츠 컴포넌트
// 인증 상태에 따라 다른 페이지를 렌더링하고
// 프로필 설정이 완료되지 않은 사용자를 위한 모달을 관리함
const AppContent: React.FC = React.memo(() => {
  // 현재 활성화된 탭을 관리하는 상태 (기본값: 대시보드)
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const { darkMode } = useApp();
  const { state } = useAuth();
  
  // 인증된 사용자 정보와 인증 상태를 메모이제이션
  const { user, isAuthenticated } = useMemo(() => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated
  }), [state.user, state.isAuthenticated]);
  
  // 프로필 관련 모달들의 표시 상태를 관리하는 상태들
  const [showProfileRequired, setShowProfileRequired] = useState(false);   // 프로필 필수 알림 모달
  const [showProfileSettings, setShowProfileSettings] = useState(false);   // 프로필 설정 모달  
  const [showProfileRedirect, setShowProfileRedirect] = useState(false);   // 프로필 리다이렉션 모달
  const [hasCheckedProfile, setHasCheckedProfile] = useState(false);       // 프로필 체크 완료 여부

  // 사용자 프로필 완성 체크 및 페이지 이탈 방지 로직
  useEffect(() => {
    // 로그인한 사용자의 프로필 완성 상태를 한 번만 체크
    // 중복 체크를 방지하기 위해 hasCheckedProfile 플래그 사용
    if (isAuthenticated && user && !hasCheckedProfile) {
      setHasCheckedProfile(true);
      
      // 프로필이 미완성인 경우 리다이렉션 모달을 일정 시간 후 표시
      if (!user.profile_completed) {
        const timer = setTimeout(() => {
          setShowProfileRedirect(true);
        }, 1500); // 1.5초 후 모달 표시하여 사용자에게 부담을 덜 줌
        
        return () => clearTimeout(timer);
      }
    }

    // 브라우저 이벤트 핸들러들 - 프로필 미완성 사용자의 이탈을 방지함
    
    // 페이지를 떠나려 할 때 확인 메시지를 표시하는 핸들러
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isAuthenticated && user && !user.profile_completed) {
        e.preventDefault();
        e.returnValue = '프로필 설정이 완료되지 않았습니다. 정말로 페이지를 떠나시겠습니까?';
        return e.returnValue;
      }
    };

    // 브라우저 뒤로가기/앞으로가기 버튼을 눌렀을 때 프로필 필수 모달을 표시
    const handlePopState = () => {
      if (isAuthenticated && user && !user.profile_completed) {
        setShowProfileRequired(true);
      }
    };

    // 프로필 미완성 신규 사용자에게 프로필 작성을 유도하는 모달 표시
    // 프로필 체크가 완료된 후에만 실행됨
    if (isAuthenticated && user && !user.profile_completed && hasCheckedProfile) {
      const timer = setTimeout(() => {
        setShowProfileRequired(true);
      }, 1000); // 1초 후 모달 표시하여 사용자 경험 개선

      return () => clearTimeout(timer);
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isAuthenticated, user, hasCheckedProfile]);

  // 로그아웃 시 모든 프로필 관련 상태를 초기화
  // 다음 로그인 시 새로운 사용자로 인식하여 올바른 플로우가 동작하도록 함
  useEffect(() => {
    if (!isAuthenticated) {
      setHasCheckedProfile(false);      // 프로필 체크 상태 리셋
      setShowProfileRequired(false);    // 프로필 필수 모달 숨김
      setShowProfileSettings(false);    // 프로필 설정 모달 숨김
      setShowProfileRedirect(false);    // 프로필 리다이렉션 모달 숨김
      setActiveTab('dashboard');        // 기본 탭으로 리셋
    }
  }, [isAuthenticated]);

  // 탭 변경 핸들러 - 프로필 미완성 사용자는 프로필 작성을 먼저 유도 
  // useCallback으로 메모이제이션하여 불필요한 리렌더링 방지
  const handleTabChange = useCallback((tabId: string) => {
    // 프로필이 완성되지 않은 사용자는 다른 탭으로 이동 불가
    if (isAuthenticated && user && !user.profile_completed) {
      setShowProfileRequired(true);
      return;
    }
    setActiveTab(tabId);
  }, [isAuthenticated, user]);

  // 프로필 필수 모달에서 "계속하기" 버튼을 클릭했을 때의 핸들러
  // 프로필 필수 모달을 닫고 프로필 설정 모달을 열음
  const handleContinueToProfile = useCallback(() => {
    setShowProfileRequired(false);
    setShowProfileSettings(true);
  }, []);

  // 프로필 리다이렉션 모달에서 "진행하기" 버튼을 클릭했을 때의 핸들러  
  // 리다이렉션 모달을 닫고 프로필 설정 모달을 열음
  const handleRedirectToProfile = useCallback(() => {
    setShowProfileRedirect(false);
    setShowProfileSettings(true);
  }, []);

  // 프로필 설정이 완료되었을 때의 핸들러
  // 모든 프로필 관련 모달을 닫고 대시보드로 이동시킴
  const handleProfileComplete = useCallback(() => {
    setShowProfileSettings(false);
    setShowProfileRequired(false);
    setShowProfileRedirect(false);
    setActiveTab('dashboard'); // 프로필 완료 후 대시보드로 자동 이동
  }, []);

  // 탭 구성 - useMemo로 메모이제이션하여 불필요한 재계산 방지
  const tabs: TabConfig[] = useMemo(() => [
    { id: 'dashboard', label: '대시보드', icon: '📊', color: colors.primary[500] },      // 전체 요약 및 현황
    { id: 'transactions', label: '거래내역', icon: '💳', color: colors.success[500] },   // 수입/지출 거래 관리
    { id: 'budget', label: '예산', icon: '🎯', color: colors.warning[500] },             // 예산 계획 및 목표 설정
    { id: 'analytics', label: '분석', icon: '📈', color: colors.primary[600] },          // 상세 분석 및 리포트
    { id: 'categories', label: '카테고리', icon: '🏷️', color: colors.success[600] },    // 거래 카테고리 관리
    { id: 'social', label: '소셜', icon: '👨‍👩‍👧‍👦', color: '#10B981' },              // 커뮤니티 및 공유 기능
    { id: 'education', label: '교육', icon: '🎓', color: '#8B5CF6' },                   // 금융 교육 콘텐츠
    { id: 'automation', label: '자동화', icon: '🤖', color: '#4F8EF7' },                // 자동화 규칙 설정
    { id: 'settings', label: '설정', icon: '⚙️', color: colors.gray[500] }              // 앱 설정 및 사용자 프로필
  ], []);

  // 앱 전체 컨테이너 스타일 - 다크 모드에 따라 배경색 변경
  const containerStyle = useMemo(() => ({
    minHeight: '100vh',
    backgroundColor: darkMode ? colors.dark[900] : colors.gray[50],
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  }), [darkMode]);

  return (
    <div style={containerStyle}>
      {/* 상단 헤더 - 로고, 사용자 정보, 테마 토글 등을 포함 */}
      <Header onLogoClick={() => setActiveTab('dashboard')} />
      
      {/* 메인 네비게이션 바 - 고정 위치로 스크롤 시에도 항상 보임 */}
      <nav style={{
        backgroundColor: darkMode ? colors.dark[800] : colors.gray[50],
        borderBottom: `1px solid ${darkMode ? colors.dark[700] : colors.gray[200]}`,
        boxShadow: darkMode ? 'none' : shadows.sm,
        position: 'sticky',      // 스크롤 시에도 상단에 고정
        top: '81px',            // 헤더 높이 + 경계선 만큼 위치 조정
        zIndex: 40              // 다른 요소들 위에 표시
      }}>
        {/* 네비게이션 컨테이너 - 중앙 정렬 및 최대 너비 제한 */}
        <div style={{
          maxWidth: '1400px',     // 최대 너비 제한으로 큰 화면에서도 적절한 크기 유지
          margin: '0 auto',       // 중앙 정렬
          padding: '0 24px',      // 좌우 여백
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '72px',
          width: '100%'
        }}>
          {/* 탭 네비게이션 컨테이너 - 반응형 디자인 적용 */}
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

      {/* 메인 콘텐츠 영역 - 활성 탭에 따라 다른 페이지를 렌더링 */}
      <main style={{
        maxWidth: '1400px',                           // 컨텐츠 최대 너비 제한
        margin: '0 auto',                            // 중앙 정렬
        padding: '32px 24px',                        // 내부 여백
        backgroundColor: darkMode ? colors.dark[900] : colors.gray[50],
        minHeight: 'calc(100vh - 72px)'              // 네비게이션 바 높이를 제외한 전체 높이
      }}>
        {/* 페이지 전환 애니메이션을 위한 컨테이너 */}
        <div style={{
          opacity: 1,
          transform: 'translateY(0)'
        }}>
          {/* 대시보드 페이지 - 전체 재정 현황 요약 */}
          {activeTab === 'dashboard' && (
            <Suspense fallback={<DashboardLoader />}>
              <DashboardPage onTabChange={handleTabChange} />
            </Suspense>
          )}
          {/* 거래내역 페이지 - 수입/지출 거래 목록 및 관리 */}
          {activeTab === 'transactions' && (
            <Suspense fallback={<TransactionsLoader />}>
              <TransactionsPage />
            </Suspense>
          )}
          
          {/* 예산 페이지 - 예산 계획 및 목표 설정 */}
          {activeTab === 'budget' && (
            <Suspense fallback={<PageLoader message="예산을 불러오는 중..." />}>
              <BudgetPage />
            </Suspense>
          )}
          
          {/* 분석 페이지 - 상세한 재정 분석 및 리포트 */}
          {activeTab === 'analytics' && (
            <Suspense fallback={<AnalyticsLoader />}>
              <AnalyticsPage />
            </Suspense>
          )}
          
          {/* 카테고리 페이지 - 거래 카테고리 관리 및 설정 */}
          {activeTab === 'categories' && (
            <Suspense fallback={<PageLoader message="카테고리를 불러오는 중..." />}>
              <CategoriesPage />
            </Suspense>
          )}
          {/* 교육 페이지 - 금융 교육 콘텐츠 및 팁 제공 */}
          {activeTab === 'education' && (
            <ErrorBoundaryWrapper resetKeys={[activeTab, 'education']}>
              <Suspense fallback={<PageLoader message="교육 페이지를 불러오는 중..." />}>
                <EducationDashboard />
              </Suspense>
            </ErrorBoundaryWrapper>
          )}
          
          {/* 소셜 페이지 - 커뮤니티 기능 및 사용자 간 상호작용 */}
          {activeTab === 'social' && (
            <ErrorBoundaryWrapper resetKeys={[activeTab, 'social']}>
              <Suspense fallback={<PageLoader message="소셜 기능을 불러오는 중..." />}>
                <SocialDashboard />
              </Suspense>
            </ErrorBoundaryWrapper>
          )}
          
          {/* 자동화 센터 - 자동 거래 규칙 및 알림 설정 */}
          {activeTab === 'automation' && (
            <Suspense fallback={<PageLoader message="자동화 센터를 불러오는 중..." />}>
              <AutomationCenterPage />
            </Suspense>
          )}
          
          {/* 설정 페이지 - 앱 설정 및 사용자 프로필 관리 */}
          {activeTab === 'settings' && (
            <Suspense fallback={<SettingsLoader />}>
              <SettingsPage />
            </Suspense>
          )}
        </div>
      </main>

      {/* 프로필 필수 알림 모달 - 프로필 미완성 사용자에게 작성을 유도 */}
      <ProfileRequiredModal
        isOpen={showProfileRequired}
        onContinueToProfile={handleContinueToProfile}
      />

      {/* 프로필 리다이렉션 모달 - 신규 사용자에게 프로필 작성 안내 */}
      <ProfileRedirectModal
        isOpen={showProfileRedirect}
        onProceed={handleRedirectToProfile}
      />

      {/* 프로필 설정 모달 - 실제 프로필 정보를 입력받는 모달 */}
      <ProfileSettingsModal
        isOpen={showProfileSettings}
        onClose={handleProfileComplete}
      />

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

// 가계부 앱의 최상위 컴포넌트
// Context Provider들로 감싸서 전역 상태 관리를 제공함
// AuthProvider: 인증 상태 관리 (로그인, 로그아웃, 사용자 정보)
// AppProvider: 앱 전반의 상태 관리 (테마, 설정, 거래 데이터 등)
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
};

export default App;