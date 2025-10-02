import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Select } from '../../../index';

describe('Select', () => {
  const mockOptions = [
    { value: 'option1', label: '옵션 1' },
    { value: 'option2', label: '옵션 2' },
    { value: 'option3', label: '옵션 3' }
  ];

  it('renders select with options', () => {
    render(
      <Select
        value=""
        onChange={vi.fn()}
        options={mockOptions}
        placeholder="선택하세요"
      />
    );

    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('선택하세요')).toBeInTheDocument();
  });

  it('shows selected value', () => {
    render(
      <Select
        value="option2"
        onChange={vi.fn()}
        options={mockOptions}
        placeholder="선택하세요"
      />
    );

    expect(screen.getByDisplayValue('옵션 2')).toBeInTheDocument();
  });

  it('calls onChange when selection changes', () => {
    const mockOnChange = vi.fn();
    render(
      <Select
        value=""
        onChange={mockOnChange}
        options={mockOptions}
        placeholder="선택하세요"
      />
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'option1' } });

    expect(mockOnChange).toHaveBeenCalledWith('option1');
  });

  it('renders with label', () => {
    render(
      <Select
        value=""
        onChange={vi.fn()}
        options={mockOptions}
        placeholder="선택하세요"
        label="카테고리"
      />
    );

    expect(screen.getByText('카테고리')).toBeInTheDocument();
  });

  it('renders required state', () => {
    render(
      <Select
        value=""
        onChange={vi.fn()}
        options={mockOptions}
        placeholder="선택하세요"
        required
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeRequired();
  });

  it('renders with dark mode', () => {
    render(
      <Select
        value=""
        onChange={vi.fn()}
        options={mockOptions}
        placeholder="선택하세요"
        darkMode
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toHaveStyle({
      backgroundColor: expect.stringContaining('#374151')
    });
  });

  it('renders all options correctly', () => {
    render(
      <Select
        value=""
        onChange={vi.fn()}
        options={mockOptions}
        placeholder="선택하세요"
      />
    );

    mockOptions.forEach(option => {
      expect(screen.getByText(option.label)).toBeInTheDocument();
    });
  });

  it('handles empty options array', () => {
    render(
      <Select
        value=""
        onChange={vi.fn()}
        options={[]}
        placeholder="선택하세요"
      />
    );

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});