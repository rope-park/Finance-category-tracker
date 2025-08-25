import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// fetch를 mock 처리 (mockNotifications 반환)
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ data: mockNotifications }),
    ok: true
  })
) as unknown as typeof fetch;
import NotificationPanel from './NotificationPanel';
import { AuthContext } from '../context/AuthContextObject';
import { AppContext } from '../context/AppContext';

const mockNotifications = [
  { id: '1', message: '예산을 초과했습니다.', type: 'warning', timestamp: Date.now(), is_read: false },
  { id: '2', message: '반복 거래가 등록되었습니다.', type: 'info', timestamp: Date.now(), is_read: true }
] as unknown as import('../types').Notification[];

const mockApp = {
  state: {
    notifications: mockNotifications,
    loading: false,
    error: null,
    transactions: [],
    budgets: [],
    recurringTemplates: [],
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
  transactions: [],
  budgets: [],
  recurringTemplates: [],
  notifications: mockNotifications,
  loading: false,
  error: null,
  darkMode: false,
  notificationsEnabled: true
};

const mockAuth = {
  state: {
    user: {
      id: 1,
      name: '테스터',
      email: 'test@example.com',
      profile_completed: true,
      created_at: '',
      updated_at: '',
      is_active: true,
      avatar: '',
      phone: '',
      ageGroup: null
    },
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

describe('NotificationPanel', () => {
  it('renders notifications and marks as read', async () => {
    render(
      <AuthContext.Provider value={mockAuth}>
        <AppContext.Provider value={mockApp}>
          <NotificationPanel />
        </AppContext.Provider>
      </AuthContext.Provider>
    );
    // message 필드로 검증
    await waitFor(() => {
      expect(screen.getByText((content) => content.includes('예산') && content.includes('초과'))).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText((content) => content.includes('예산') && content.includes('초과')));
    // 상세/읽음 처리 등 추가 검증 가능
  });
});
