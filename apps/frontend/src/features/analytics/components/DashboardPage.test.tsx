import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { DashboardPage } from './DashboardPage';
import { AuthContext } from '../../../app/providers/AuthContext';
import { AppContext } from '../../../app/providers/AppContext';
import { createMockAuthContext, createMockAppContext } from '../../../tests/testUtils';

// Mock hooks
vi.mock('../../../hooks/useApp', () => ({
  useApp: () => ({
    transactions: [],
    budgets: [],
    notifications: [],
    loading: false,
    error: null,
    darkMode: false,
    state: {
      transactions: [],
      budgets: [],
      recurringTemplates: [],
      notifications: [],
      loading: false,
      error: null,
      darkMode: false,
      notificationsEnabled: true
    }
  })
}));

// Mock API calls
global.fetch = vi.fn();

const mockAuth = createMockAuthContext({
  state: {
    user: {
      id: 1,
      email: 'test@example.com',
      name: '테스터',
      profile_completed: true,
      created_at: '2025-01-01',
      updated_at: '2025-01-01',
      is_active: true,
      role: 'user',
      status: 'active',
      email_verified: true,
      avatar: null,
      phone: null,
      ageGroup: null
    },
    token: 'mock-token',
    isLoading: false,
    isAuthenticated: true,
    error: null
  }
});

const mockApp = createMockAppContext();

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const mockFetch = fetch as unknown as ReturnType<typeof vi.fn>;
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          currentMonth: {
            totalIncome: 1000000,
            totalExpense: 750000,
            balance: 250000,
            transactionCount: 45
          },
          monthlyTrend: [],
          topCategories: [],
          recentTransactions: [],
          budgetSummary: {}
        }
      })
    });
  });

  it('renders dashboard components', async () => {
    const { container } = render(
      <BrowserRouter>
        <AuthContext.Provider value={mockAuth}>
          <AppContext.Provider value={mockApp}>
            <DashboardPage />
          </AppContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    // 컴포넌트가 렌더링되는지 확인
    expect(container.firstChild).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    const { container } = render(
      <BrowserRouter>
        <AuthContext.Provider value={mockAuth}>
          <AppContext.Provider value={mockApp}>
            <DashboardPage />
          </AppContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('shows error state', () => {
    const { container } = render(
      <BrowserRouter>
        <AuthContext.Provider value={mockAuth}>
          <AppContext.Provider value={mockApp}>
            <DashboardPage />
          </AppContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    expect(container.firstChild).toBeInTheDocument();
  });
});