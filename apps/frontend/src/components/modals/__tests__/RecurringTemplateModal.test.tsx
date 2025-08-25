import { render, screen, fireEvent } from '@testing-library/react';
import RecurringTemplateModal from '../RecurringTemplateModal';
import { AuthContext } from '../../../context/AuthContextObject';
import { AppContext } from '../../../context/AppContext';
import { ExpenseSecondaryCategory } from '../../../types';

const mockTemplate = {
  id: '1',
  name: '월세',
  description: '월세 자동 이체',
  amount: 500000,
  category: ExpenseSecondaryCategory.FOOD_RESTAURANT,
  type: 'expense',
  recurrenceType: 'monthly',
  recurrenceDay: 1,
  isActive: true,
  nextDueDate: '2025-08-01',
  lastExecuted: '',
  autoExecute: false,
  notificationEnabled: true,
  createdAt: '',
  updatedAt: ''
} as const;

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
      avatar: null,
      phone: null,
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

const mockApp = {
  state: {
    transactions: [],
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
  transactions: [],
  budgets: [],
  recurringTemplates: [],
  notifications: [],
  loading: false,
  error: null,
  darkMode: false,
  notificationsEnabled: true
};

describe('RecurringTemplateModal', () => {
  it('renders and submits recurring template', () => {
    render(
      <AuthContext.Provider value={mockAuth}>
        <AppContext.Provider value={mockApp}>
          <RecurringTemplateModal isOpen={true} onClose={vi.fn()} template={mockTemplate} />
        </AppContext.Provider>
      </AuthContext.Provider>
    );
    expect(screen.getByDisplayValue('월세')).toBeInTheDocument();
    // 금액 input은 type=number로, getAllByRole('spinbutton')의 첫 번째로 접근
    fireEvent.change(screen.getAllByRole('spinbutton')[0], { target: { value: '600000' } });
    fireEvent.click(screen.getByRole('button', { name: '수정' }));
    // 실제 저장 함수 호출 여부 등은 추가 mock 필요
  });
});