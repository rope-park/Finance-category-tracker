/**
 * Frontend 메인 export 파일
 * 
 * 모든 프론트엔드 컴포넌트, 페이지, 유틸리티를 외부에서
 * 사용할 수 있도록 내보내는 중앙 집중식 export 파일.
 * 
 * @author Ju Eul Park (rope-park)
 */

// ==================================================
// 공통 UI 컴포넌트들
// ==================================================

// 폼 관련 컴포넌트들
export { Button } from './shared/components/forms/Button';
export { Input } from './shared/components/forms/Input';
export { Toggle } from './shared/components/forms/Toggle';
export { DatePicker } from './shared/components/forms/DatePicker';
export { Select } from './shared/components/forms/Select';
export { FormField } from './shared/components/forms/FormField';
export { CurrencyInput } from './shared/components/forms/CurrencyInput';
export { PercentageInput } from './shared/components/forms/PercentageInput';
export { RangeSlider } from './shared/components/forms/RangeSlider';

// 레이아웃 관련 컴포넌트들
export { Card } from './shared/components/layout/Card';
export { Section } from './shared/components/layout/Section';
export { TabNavigation } from './shared/components/layout/TabNavigation';
export { Grid } from './shared/components/layout/Grid';
export { PageLayout } from './shared/components/layout/PageLayout';

// 데이터 표시 컴포넌트들
export { ProgressBar } from './shared/components/data-display/ProgressBar';
export { Modal } from './shared/components/data-display/Modal';
export { StatsCard } from './shared/components/data-display/StatsCard';
export { AmountDisplay } from './shared/components/data-display/AmountDisplay';

// 피드백 컴포넌트들 (로딩, 알림, 에러 등)
export { Tooltip } from './shared/components/feedback/Tooltip';
export { Spinner } from './shared/components/feedback/Spinner';
export { LazyWrapper } from './shared/components/feedback/LazyWrapper';
export { default as NotificationPanel } from './shared/components/feedback/NotificationPanel';

// 에러 바운더리 (React 에러 처리)
export { ErrorBoundary, PageErrorBoundary, ModalErrorBoundary } from './shared/components/feedback/ErrorBoundary';

// 페이지별 로더 컴포넌트들
export { PageLoader, DashboardLoader, AnalyticsLoader, TransactionsLoader, SettingsLoader } from './shared/components/feedback/PageLoader';

// ==================================================
// 기능별 특수 컴포넌트들
// ==================================================

// 거래 관련 특수 컴포넌트
export { default as HierarchicalCategorySelect } from './features/transactions/components/HierarchicalCategorySelect';
export { TransactionFilter } from './features/transactions/components/TransactionFilter';

// ==================================================
// 메인 페이지들
// ==================================================

// 분석 및 대시보드 페이지들
export { DashboardPage } from './features/analytics/components/DashboardPage';
export { AnalyticsPage } from './features/analytics/components/AnalyticsPage';
export { default as HealthScorePage } from './features/analytics/components/HealthScorePage';

// 거래 관리 페이지들
export { default as AutomationCenterPage } from './features/transactions/components/AutomationCenterPage';
export { TransactionsPage } from './features/transactions/components/TransactionsPage';
export { CategoriesPage } from './features/transactions/components/CategoriesPage';

// 예산 관리 페이지
export { BudgetPage } from './features/budgets/components/BudgetPage';

// 교육 컨텐츠 페이지들
export { default as EducationDashboard } from './features/education/components/EducationDashboard';
export { default as EducationContentList } from './features/education/components/EducationContentList';
export { default as EducationContentDetail } from './features/education/components/EducationContentDetail';
export { SavingTipsPage } from './features/education/components/SavingTipsPage';
export { default as PersonalizedAdvicePage } from './features/education/components/PersonalizedAdvicePage';

// 앱 설정 페이지
export { SettingsPage } from './app/pages/SettingsPage';

// ==================================================
// 모달 컴포넌트들
// ==================================================

// 거래 관련 모달들
export { TransactionModal } from './features/transactions/components/TransactionModal';
export { RecurringTemplateModal } from './features/transactions/components/RecurringTemplateModal';

// 예산 관련 모달
export { BudgetModal } from './features/budgets/components/BudgetModal';

// 분석 관련 모달
export { ExportModal } from './features/analytics/components/ExportModal';

// 인증 관련 모달들
export { ProfileSettingsModal } from './features/auth/components/ProfileSettingsModal';
export { RegisterModal } from './features/auth/components/RegisterModal';
export { LoginModal } from './features/auth/components/LoginModal';

// ==================================================
// React Context 및 상태 관리
// ==================================================

// 앱 전역 상태 관리
export { AppContext } from './app/providers/AppContext';

// 인증 상태 관리
export { AuthContext } from './app/providers/AuthContext';

// ==================================================
// 타입 정의 및 유틸리티
// ==================================================

// 공통 타입 정의들
export * from './shared/types';

// 유틸리티 함수들
export * from './shared/utils';