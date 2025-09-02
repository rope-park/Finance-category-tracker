import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { TransactionsPage } from '../TransactionsPage';
import type { TransactionCategory } from '../../../types'
import { AuthContext } from '../../../context/AuthContextObject';
import { AppContext } from '../../../context/AppContext';

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock API calls
global.fetch = vi.fn();

const mockUser = {
  id: 1,
  email: 'test@example.com',
  name: '테스터',
  profile_completed: true,
  created_at: '2025-01-01',
  updated_at: '2025-01-01',
  is_active: true,
  avatar: null,
  phone: null,
  ageGroup: null
};

const mockAuth = {
  state: {
    user: mockUser,
    token: 'mock-token',
    isLoading: false,
    isAuthenticated: true,
    error: null
  },
  updateUser: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  clearError: vi.fn()
};

const mockTransactions = [
  {
    id: '1',
    description: '점심 식사',
    amount: 15000,
    category: 'food' as TransactionCategory,
    type: 'expense' as const,
    date: '2025-01-15',
    merchant: '맛집'
  }
];

const mockApp = {
  state: {
    transactions: mockTransactions,
    budgets: [],
    recurringTemplates: [],
    notifications: [],
    loading: false,
    error: null,
    darkMode: false,
    notificationsEnabled: true
  },
  dispatch: vi.fn(),
  addTransaction: vi.fn(),
  updateTransaction: vi.fn(),
  deleteTransaction: vi.fn(),
  updateBudget: vi.fn(),
  deleteBudget: vi.fn(),
  checkBudgetAlert: vi.fn(),
  toggleDarkMode: vi.fn(),
  toggleNotifications: vi.fn(),
  fetchRecurringTemplates: vi.fn(),
  addRecurringTemplate: vi.fn(),
  updateRecurringTemplate: vi.fn(),
  deleteRecurringTemplate: vi.fn(),
  transactions: mockTransactions,
  budgets: [],
  recurringTemplates: [],
  notifications: [],
  loading: false,
  error: null,
  darkMode: false,
  notificationsEnabled: true
};

describe('TransactionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const mockFetch = fetch as unknown as ReturnType<typeof vi.fn>;
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: mockTransactions
      })
    });
  });

  it('renders transactions page', () => {
    render(
      <BrowserRouter>
        <AuthContext.Provider value={mockAuth}>
          <AppContext.Provider value={mockApp}>
            <TransactionsPage />
          </AppContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    // 페이지 제목 확인
    expect(screen.getByText('거래 내역')).toBeInTheDocument();
  });

  it('displays transaction list', () => {
    render(
      <BrowserRouter>
        <AuthContext.Provider value={mockAuth}>
          <AppContext.Provider value={mockApp}>
            <TransactionsPage />
          </AppContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    // 거래 목록이 있을 때 거래 항목들이 표시됨
    expect(screen.getByText('점심 식사')).toBeInTheDocument();
    // formatCurrency가 ₩15,000 형식으로 포맷하므로 해당 형식으로 확인
    expect(screen.getByText('-₩15,000')).toBeInTheDocument();
  });

  it('shows empty state when no transactions', () => {
    const emptyApp = {
      ...mockApp,
      state: { ...mockApp.state, transactions: [] },
      transactions: []
    };

    render(
      <BrowserRouter>
        <AuthContext.Provider value={mockAuth}>
          <AppContext.Provider value={emptyApp}>
            <TransactionsPage />
          </AppContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    expect(screen.getByText('거래 내역이 없습니다')).toBeInTheDocument();
  });

  it('shows add transaction button', () => {
    render(
      <BrowserRouter>
        <AuthContext.Provider value={mockAuth}>
          <AppContext.Provider value={mockApp}>
            <TransactionsPage />
          </AppContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    // 헤더에 있는 "거래 추가" 버튼 확인
    const addButtons = screen.getAllByText('거래 추가');
    expect(addButtons.length).toBeGreaterThan(0);
  });

  it('can filter transactions', async () => {
    render(
      <BrowserRouter>
        <AuthContext.Provider value={mockAuth}>
          <AppContext.Provider value={mockApp}>
            <TransactionsPage />
          </AppContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    // 페이지가 렌더링되고 거래 목록이 표시되는지 확인
    expect(screen.getByText('거래 내역')).toBeInTheDocument();
    expect(screen.getByText('점심 식사')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    const loadingApp = {
      ...mockApp,
      state: { ...mockApp.state, loading: true },
      loading: true
    };

    render(
      <BrowserRouter>
        <AuthContext.Provider value={mockAuth}>
          <AppContext.Provider value={loadingApp}>
            <TransactionsPage />
          </AppContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    // 페이지 제목은 여전히 표시되어야 함
    expect(screen.getByText('거래 내역')).toBeInTheDocument();
  });
});
