// ===================
// UI 컴포넌트
// ===================
export { Button } from './shared/components/forms/Button';
export { Card } from './shared/components/layout/Card';
export { Input } from './shared/components/forms/Input';
export { Toggle } from './shared/components/forms/Toggle';
export { Section } from './shared/components/layout/Section';
export { TabNavigation } from './shared/components/layout/TabNavigation';
export { Grid } from './shared/components/layout/Grid';
export { PageLayout } from './shared/components/layout/PageLayout';
export { ProgressBar } from './shared/components/data-display/ProgressBar';
export { Tooltip } from './shared/components/feedback/Tooltip';
export { Modal } from './shared/components/data-display/Modal';
export { DatePicker } from './shared/components/forms/DatePicker';
export { Select } from './shared/components/forms/Select';
export { FormField } from './shared/components/forms/FormField';
export { CurrencyInput } from './shared/components/forms/CurrencyInput';
export { PercentageInput } from './shared/components/forms/PercentageInput';
export { StatsCard } from './shared/components/data-display/StatsCard';
export { RangeSlider } from './shared/components/forms/RangeSlider';
export { AmountDisplay } from './shared/components/data-display/AmountDisplay';
export { Spinner } from './shared/components/feedback/Spinner';
export { LazyWrapper } from './shared/components/feedback/LazyWrapper';
export { default as NotificationPanel } from './shared/components/feedback/NotificationPanel';

// 에러 바운더리
export { ErrorBoundary, PageErrorBoundary, ModalErrorBoundary } from './shared/components/feedback/ErrorBoundary';

// Loaders
export { PageLoader, DashboardLoader, AnalyticsLoader, TransactionsLoader, SettingsLoader } from './shared/components/feedback/PageLoader';

// ===================
// Feature 컴포넌트
// ===================
export { default as HierarchicalCategorySelect } from './features/transactions/components/HierarchicalCategorySelect';
export { TransactionFilter } from './features/transactions/components/TransactionFilter';

// ===================
// 페이지
// ===================
// 분석
export { DashboardPage } from './features/analytics/components/DashboardPage';
export { AnalyticsPage } from './features/analytics/components/AnalyticsPage';
export { default as HealthScorePage } from './features/analytics/components/HealthScorePage';

// 거래
export { default as AutomationCenterPage } from './features/transactions/components/AutomationCenterPage';
export { TransactionsPage } from './features/transactions/components/TransactionsPage';
export { CategoriesPage } from './features/transactions/components/CategoriesPage';

// 예산
export { BudgetPage } from './features/budgets/components/BudgetPage';

// 교육
export { default as EducationDashboard } from './features/education/components/EducationDashboard';
export { default as EducationContentList } from './features/education/components/EducationContentList';
export { default as EducationContentDetail } from './features/education/components/EducationContentDetail';
export { SavingTipsPage } from './features/education/components/SavingTipsPage';
export { default as PersonalizedAdvicePage } from './features/education/components/PersonalizedAdvicePage';

// 앱
export { SettingsPage } from './app/pages/SettingsPage';

// ===================
// 모달
// ===================
export { TransactionModal } from './features/transactions/components/TransactionModal';
export { BudgetModal } from './features/budgets/components/BudgetModal';
export { ExportModal } from './features/analytics/components/ExportModal';
export { RecurringTemplateModal } from './features/transactions/components/RecurringTemplateModal';
export { ProfileSettingsModal } from './features/auth/components/ProfileSettingsModal';
export { RegisterModal } from './features/auth/components/RegisterModal';
export { LoginModal } from './features/auth/components/LoginModal';

// ===================
// Providers & Context
// ===================
export { AppContext } from './app/providers/AppContext';
export { AuthContext } from './app/providers/AuthContext';

// ===================
// Types & Constants
// ===================
export * from './shared/types';
export * from './shared/utils';