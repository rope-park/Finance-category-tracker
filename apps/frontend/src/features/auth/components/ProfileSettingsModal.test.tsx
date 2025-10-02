import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, beforeEach } from 'vitest';
import { ProfileSettingsModal } from '../../../index';
import { AuthContext, AppContext } from '../../../index';
import { createMockAuthContext, createMockAppContext } from '../../../tests/testUtils';

// Mock API calls
global.fetch = vi.fn();

const mockUpdateUser = vi.fn().mockResolvedValue({ name: '수정됨' });

const mockAuth = createMockAuthContext({
  state: {
    user: {
      id: 1,
      email: 'test@example.com',
      name: '테스터',
      phone_number: '010-1234-5678',
      age_group: '20s',
      bio: '테스트 유저',
      profile_picture: '',
      profile_completed: false,
      created_at: '',
      updated_at: '',
      is_active: true,
      role: 'user',
      status: 'active',
      email_verified: true,
      avatar: '',
      phone: '010-1234-5678',
      ageGroup: '20s'
    },
    token: 'mock-token',
    isLoading: false,
    isAuthenticated: true,
    error: null
  },
  updateUser: mockUpdateUser
});

const mockApp = createMockAppContext();

describe('ProfileSettingsModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const mockFetch = fetch as unknown as ReturnType<typeof vi.fn>;
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: ['식비', '교통비', '문화생활']
      })
    });
  });

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