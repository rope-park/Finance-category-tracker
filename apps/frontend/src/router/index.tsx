import { createBrowserRouter } from 'react-router-dom';
import { HomePage, DashboardPage } from '../pages';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/dashboard',
    element: <DashboardPage />,
  },
  {
    path: '/transactions',
    element: <div>Transactions Page</div>, // TODO: TransactionsPage 컴포넌트 추가
  },
  {
    path: '/categories', 
    element: <div>Categories Page</div>, // TODO: CategoriesPage 컴포넌트 추가
  },
  {
    path: '/budgets',
    element: <div>Budgets Page</div>, // TODO: BudgetsPage 컴포넌트 추가
  },
  {
    path: '/automation',
    element: <div>Automation Page</div>, // TODO: AutomationPage 컴포넌트 추가
  },
  {
    path: '/profile',
    element: <div>Profile Page</div>, // TODO: ProfilePage 컴포넌트 추가
  },
  {
    path: '/analytics',
    element: <div>Analytics Page</div>, // TODO: AnalyticsPage 컴포넌트 추가
  },
]);
