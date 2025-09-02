import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Input } from '../Input';

describe('Input Component', () => {
  it('renders input with label', () => {
    render(<Input label="테스트 입력" />);
    
    expect(screen.getByLabelText('테스트 입력')).toBeInTheDocument();
    expect(screen.getByText('테스트 입력')).toBeInTheDocument();
  });

  it('renders input without label', () => {
    render(<Input placeholder="입력하세요" />);
    
    expect(screen.getByPlaceholderText('입력하세요')).toBeInTheDocument();
  });

  it('handles value changes', () => {
    const mockOnChange = vi.fn();
    render(<Input onChange={mockOnChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '테스트 값' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('테스트 값');
  });

  it('shows error state', () => {
    render(<Input label="테스트" error="오류 메시지" />);
    
    expect(screen.getByText('오류 메시지')).toBeInTheDocument();
  });

  it('shows disabled state', () => {
    render(<Input label="테스트" disabled />);
    
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('supports different types', () => {
    const { rerender } = render(<Input type="email" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');

    rerender(<Input type="password" />);
    expect(screen.getByDisplayValue('')).toHaveAttribute('type', 'password');
  });

  it('supports icon rendering', () => {
    render(<Input icon="🔍" />);
    
    expect(screen.getByText('🔍')).toBeInTheDocument();
  });

  it('supports different sizes', () => {
    const { rerender } = render(<Input size="sm" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();

    rerender(<Input size="lg" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
