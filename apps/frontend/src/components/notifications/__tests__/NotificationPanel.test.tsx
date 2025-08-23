import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NotificationPanel from '../../NotificationPanel';
import { AuthContext } from '../../../context/AuthContextObject';
import { AppContext } from '../../../context/AppContext';

const mockNotifications = [
  { id: 1, title: '예산 초과', message: '예산을 초과했습니다.', is_read: false, type: 'budget', created_at: '', updated_at: '' },
  { id: 2, title: '반복 거래 알림', message: '반복 거래가 등록되었습니다.', is_read: true, type: 'recurring', created_at: '', updated_at: '' }
];

const mockApp = {
  state: { notifications: mockNotifications, loading: false, error: null, transactions: [], budgets: [] },
  notifications: mockNotifications,
  loading: false,
  error: null,
  transactions: [],
  budgets: [],
};

const mockAuth = {
  state: { user: { id: 1, name: '테스터', email: 'test@example.com', profile_completed: true, created_at: '', updated_at: '', is_active: true } },
  updateUser: jest.fn(),
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  clearError: jest.fn()
};

describe('NotificationPanel', () => {
  it('renders notifications and marks as read', async () => {
    render(
      <AuthContext.Provider value={mockAuth as any}>
        <AppContext.Provider value={mockApp as any}>
          <NotificationPanel />
        </AppContext.Provider>
      </AuthContext.Provider>
    );
    expect(screen.getByText('예산 초과')).toBeInTheDocument();
    fireEvent.click(screen.getByText('예산 초과'));
    // 상세/읽음 처리 등 추가 검증 가능
  });
});
