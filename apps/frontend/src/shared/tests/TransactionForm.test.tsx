import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import TransactionForm from '../components/TransactionForm';

// Mock fetch for the API calls inside the component
global.fetch = vi.fn();

describe('TransactionForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('authToken', 'test-token');
  });

  it('renders form fields correctly', () => {
    render(<TransactionForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/금액/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/설명/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/카테고리/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/거래 유형/i)).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const mockFetch = fetch as unknown as ReturnType<typeof vi.fn>;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          id: 1,
          amount: 10000,
          description: '테스트 거래',
          category_key: 'food',
          transaction_type: 'expense',
          transaction_date: '2025-08-18'
        }
      })
    });

    render(<TransactionForm onSubmit={mockOnSubmit} />);

    // 폼 필드 입력
    const amountInput = screen.getByRole('spinbutton');
    const descriptionInput = screen.getByRole('textbox');
    
    fireEvent.change(amountInput, { target: { value: '10000' } });
    fireEvent.change(descriptionInput, { target: { value: '테스트 거래' } });

    // 폼 제출
    const submitButton = screen.getByRole('button', { name: /저장/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
        id: 1,
        amount: 10000,
        description: '테스트 거래'
      }));
    });
  });

  it('shows validation errors for invalid amount', async () => {
    render(<TransactionForm onSubmit={mockOnSubmit} />);

    // 잘못된 금액으로 제출
    const amountInput = screen.getByRole('spinbutton');
    fireEvent.change(amountInput, { target: { value: '0' } });
    
    const submitButton = screen.getByRole('button', { name: /저장/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/금액은 필수입니다/i)).toBeInTheDocument();
    });
  });

  it('handles transaction type toggle', () => {
    render(<TransactionForm onSubmit={mockOnSubmit} />);

    const transactionTypeSelect = screen.getByRole('combobox', { name: /거래 유형/i });
    
    // 수입으로 변경
    fireEvent.change(transactionTypeSelect, { target: { value: 'income' } });
    expect(transactionTypeSelect).toHaveValue('income');
  });

  it('displays initial data correctly', () => {
    const initialData = {
      amount: 5000,
      description: '초기 데이터',
      category_key: 'transport',
      transaction_type: 'expense' as const
    };

    render(<TransactionForm onSubmit={mockOnSubmit} initialData={initialData} />);

    expect(screen.getByDisplayValue('5000')).toBeInTheDocument();
    expect(screen.getByDisplayValue('초기 데이터')).toBeInTheDocument();
  });
});
