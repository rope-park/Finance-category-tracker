import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Card } from '../Card';
import { AppContext } from '../../../context/AppContext';

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

describe('Card', () => {
  it('renders card with children', () => {
    render(
      <AppContext.Provider value={mockApp}>
        <Card>
          <p>카드 내용</p>
        </Card>
      </AppContext.Provider>
    );

    expect(screen.getByText('카드 내용')).toBeInTheDocument();
  });

  it('applies hover effect when hoverable', () => {
    render(
      <AppContext.Provider value={mockApp}>
        <Card hoverable>
          <p>카드 내용</p>
        </Card>
      </AppContext.Provider>
    );

    const card = screen.getByText('카드 내용').closest('div');
    expect(card).toHaveStyle('cursor: pointer');
  });

  it('supports custom className', () => {
    render(
      <AppContext.Provider value={mockApp}>
        <Card className="custom-class">
          <p>카드 내용</p>
        </Card>
      </AppContext.Provider>
    );

    const card = screen.getByText('카드 내용').closest('div');
    expect(card).toHaveClass('custom-class');
  });

  it('renders as different variants', () => {
    const { rerender } = render(
      <AppContext.Provider value={mockApp}>
        <Card variant="elevated">
          <p>카드 내용</p>
        </Card>
      </AppContext.Provider>
    );

    let card = screen.getByText('카드 내용').closest('div');
    expect(card).toHaveStyle('box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1)');

    rerender(
      <AppContext.Provider value={mockApp}>
        <Card variant="gradient">
          <p>카드 내용</p>
        </Card>
      </AppContext.Provider>
    );

    card = screen.getByText('카드 내용').closest('div');
    expect(card).toHaveStyle('background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)');
  });

  it('renders with different padding sizes', () => {
    const { rerender } = render(
      <AppContext.Provider value={mockApp}>
        <Card padding="sm">
          <p>카드 내용</p>
        </Card>
      </AppContext.Provider>
    );

    let card = screen.getByText('카드 내용').closest('div');
    expect(card).toHaveStyle('padding: 16px');

    rerender(
      <AppContext.Provider value={mockApp}>
        <Card padding="lg">
          <p>카드 내용</p>
        </Card>
      </AppContext.Provider>
    );

    card = screen.getByText('카드 내용').closest('div');
    expect(card).toHaveStyle('padding: 32px');
  });

  it('handles click events when interactive', () => {
    const handleClick = vi.fn();
    render(
      <AppContext.Provider value={mockApp}>
        <Card onClick={handleClick} interactive>
          <p>카드 내용</p>
        </Card>
      </AppContext.Provider>
    );

    const card = screen.getByText('카드 내용').closest('div');
    fireEvent.click(card!);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies dark mode styles', () => {
    const darkModeApp = {
      ...mockApp,
      state: { ...mockApp.state, darkMode: true },
      darkMode: true
    };

    render(
      <AppContext.Provider value={darkModeApp}>
        <Card>
          <p>카드 내용</p>
        </Card>
      </AppContext.Provider>
    );

    const card = screen.getByText('카드 내용').closest('div');
    expect(card).toHaveStyle('background-color: #1e293b');
  });
});
