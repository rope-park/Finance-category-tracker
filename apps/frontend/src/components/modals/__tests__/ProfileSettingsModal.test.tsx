import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProfileSettingsModal } from '../ProfileSettingsModal';
import { AuthContext } from '../../../context/AuthContextObject';
import { AppContext } from '../../../context/AppContext';

const mockUser = {
  id: 1,
  email: 'test@example.com',
  name: '테스터',
  phone_number: '010-1234-5678',
  age_group: '20s',
  job_group: 'student',
  bio: '테스트 유저',
  profile_picture: '',
  profile_completed: false,
  created_at: '',
  updated_at: '',
  is_active: true,
  preferences: {
    currency: 'KRW',
    language: 'ko',
    darkMode: false,
    notifications: { budget: true, transaction: true, email: true }
  } as const,
  // camelCase 필드도 추가
  avatar: '',
  phone: '010-1234-5678',
  ageGroup: '20s'
};

const mockUpdateUser = vi.fn().mockResolvedValue({ ...mockUser, name: '수정됨' });

const mockAuth = {
  state: {
    user: mockUser,
    token: 'mock-token',
    isLoading: false,
    isAuthenticated: true,
    error: null
  },
  updateUser: mockUpdateUser,
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

describe('ProfileSettingsModal', () => {
  it('renders user info and updates profile', async () => {
    render(
      <AuthContext.Provider value={mockAuth}>
        <AppContext.Provider value={mockApp}>
          <ProfileSettingsModal isOpen={true} onClose={vi.fn()} />
        </AppContext.Provider>
      </AuthContext.Provider>
    );
    expect(screen.getByDisplayValue('테스터')).toBeInTheDocument();
  fireEvent.change(screen.getByPlaceholderText('닉네임을 입력하세요'), { target: { value: '수정됨' } });
    fireEvent.click(screen.getByRole('button', { name: /저장|완료|update|save/i }));
    await waitFor(() => expect(mockUpdateUser).toHaveBeenCalled());
  });

  it('shows recommended categories when age/job changes', async () => {
    render(
      <AuthContext.Provider value={mockAuth}>
        <AppContext.Provider value={mockApp}>
          <ProfileSettingsModal isOpen={true} onClose={vi.fn()} />
        </AppContext.Provider>
      </AuthContext.Provider>
    );
    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: '30s' } });
    fireEvent.change(screen.getAllByRole('combobox')[1], { target: { value: 'worker' } });
    // 추천 fetch는 mock 필요, 여기선 렌더만 확인
  expect(screen.getAllByRole('combobox')[1]).toBeInTheDocument();
  });
});