import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RecurringTemplateModal from '../components/RecurringTemplateModal';
import { AuthContext } from '../../../context/AuthContextObject';
import { AppContext } from '../../../context/AppContext';

const mockTemplate = {
  id: 1,
  name: '월세',
  amount: 500000,
  category: '주거',
  start_date: '2025-08-01',
  frequency: 'monthly',
  is_active: true,
  created_at: '',
  updated_at: ''
};

const mockAuth = {
  state: { user: { id: 1, name: '테스터', email: 'test@example.com', profile_completed: true, created_at: '', updated_at: '', is_active: true } },
  updateUser: jest.fn(),
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  clearError: jest.fn()
};

const mockApp = { state: { darkMode: false }, darkMode: false };

describe('RecurringTemplateModal', () => {
  it('renders and submits recurring template', () => {
    render(
      <AuthContext.Provider value={mockAuth as any}>
        <AppContext.Provider value={mockApp as any}>
          <RecurringTemplateModal isOpen={true} onClose={jest.fn()} template={mockTemplate} />
        </AppContext.Provider>
      </AuthContext.Provider>
    );
    expect(screen.getByDisplayValue('월세')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/금액|amount/i), { target: { value: '600000' } });
    fireEvent.click(screen.getByRole('button', { name: /저장|완료|update|save/i }));
    // 실제 저장 함수 호출 여부 등은 추가 mock 필요
  });
});
