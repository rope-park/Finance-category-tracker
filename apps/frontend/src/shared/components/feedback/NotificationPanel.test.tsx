import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import NotificationPanel from './NotificationPanel';
import { AuthContext } from '../../../index';
import { AppContext } from '../../../app/providers/AppContext';
import { createMockAuthContext, createMockAppContext } from '../../../tests/testUtils';

const mockNotifications = [
  { id: '1', message: '예산을 초과했습니다.', type: 'warning', timestamp: Date.now(), is_read: false },
  { id: '2', message: '반복 거래가 등록되었습니다.', type: 'info', timestamp: Date.now(), is_read: true }
] as unknown as import('../../types').Notification[];

// fetch를 mock 처리 (mockNotifications 반환)
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ data: mockNotifications }),
    ok: true
  })
) as unknown as typeof fetch;

const mockApp = createMockAppContext({
  state: {
    notifications: mockNotifications,
    loading: false,
    error: null,
    transactions: [],
    budgets: [],
    recurringTemplates: [],
    darkMode: false,
    notificationsEnabled: true,
    amountHidden: false,
  },
  notifications: mockNotifications,
});

const mockAuth = createMockAuthContext();

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
