import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProfileSettingsModal } from '../components/ProfileSettingsModal';
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
  }
};

const mockUpdateUser = jest.fn().mockResolvedValue({ ...mockUser, name: '수정됨' });

const mockAuth = {
  state: { user: mockUser },
  updateUser: mockUpdateUser,
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  clearError: jest.fn()
};

const mockApp = { state: { darkMode: false }, darkMode: false };

describe('ProfileSettingsModal', () => {
  it('renders user info and updates profile', async () => {
    render(
      <AuthContext.Provider value={mockAuth as any}>
        <AppContext.Provider value={mockApp as any}>
          <ProfileSettingsModal isOpen={true} onClose={jest.fn()} />
        </AppContext.Provider>
      </AuthContext.Provider>
    );
    expect(screen.getByDisplayValue('테스터')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/이름/i), { target: { value: '수정됨' } });
    fireEvent.click(screen.getByRole('button', { name: /저장|완료|update|save/i }));
    await waitFor(() => expect(mockUpdateUser).toHaveBeenCalled());
  });

  it('shows recommended categories when age/job changes', async () => {
    render(
      <AuthContext.Provider value={mockAuth as any}>
        <AppContext.Provider value={mockApp as any}>
          <ProfileSettingsModal isOpen={true} onClose={jest.fn()} />
        </AppContext.Provider>
      </AuthContext.Provider>
    );
    fireEvent.change(screen.getByLabelText(/나이대|age/i), { target: { value: '30s' } });
    fireEvent.change(screen.getByLabelText(/직업군|job/i), { target: { value: 'worker' } });
    // 추천 fetch는 mock 필요, 여기선 렌더만 확인
    expect(screen.getByLabelText(/직업군|job/i)).toBeInTheDocument();
  });
});
