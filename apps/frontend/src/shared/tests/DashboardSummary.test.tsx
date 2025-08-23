import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DashboardSummary from '../components/DashboardSummary';

// Mock 데이터
const mockSummaryData = {
  totalIncome: 1000000,
  totalExpense: 750000,
  balance: 250000,
  monthlyChange: 15.5,
  transactionCount: 45,
  topCategory: '식비'
};

describe('DashboardSummary', () => {
  it('renders summary cards correctly', () => {
    render(<DashboardSummary data={mockSummaryData} />);

    // 총 수입 확인
    expect(screen.getByText('총 수입')).toBeInTheDocument();
    expect(screen.getByText('1,000,000원')).toBeInTheDocument();

    // 총 지출 확인
    expect(screen.getByText('총 지출')).toBeInTheDocument();
    expect(screen.getByText('750,000원')).toBeInTheDocument();

    // 잔액 확인
    expect(screen.getByText('잔액')).toBeInTheDocument();
    expect(screen.getByText('250,000원')).toBeInTheDocument();
  });

  it('displays positive balance with correct styling', () => {
    render(<DashboardSummary data={mockSummaryData} />);
    
    const balanceElement = screen.getByText('250,000원');
    expect(balanceElement).toHaveClass('text-green-600');
  });

  it('displays negative balance with correct styling', () => {
    const negativeBalanceData = {
      ...mockSummaryData,
      balance: -100000
    };

    render(<DashboardSummary data={negativeBalanceData} />);
    
    const balanceElement = screen.getByText('-100,000원');
    expect(balanceElement).toHaveClass('text-red-600');
  });

  it('shows monthly change percentage', () => {
    render(<DashboardSummary data={mockSummaryData} />);
    
    // 포함된 텍스트로 찾기
    expect(screen.getByText('+15.5%')).toBeInTheDocument();
    expect(screen.getByText('전월 대비')).toBeInTheDocument();
  });

  it('displays transaction count', () => {
    render(<DashboardSummary data={mockSummaryData} />);
    
    expect(screen.getByText('45개')).toBeInTheDocument();
    expect(screen.getByText('이번 달 거래')).toBeInTheDocument();
  });

  it('shows top spending category', () => {
    render(<DashboardSummary data={mockSummaryData} />);
    
    expect(screen.getByText('식비')).toBeInTheDocument();
    expect(screen.getByText('주요 지출 카테고리')).toBeInTheDocument();
  });

  it('handles loading state', () => {
    render(<DashboardSummary data={null} isLoading={true} />);
    
    expect(screen.getByText('데이터를 불러오는 중...')).toBeInTheDocument();
  });

  it('handles error state', () => {
    render(<DashboardSummary data={null} error="데이터 로딩 실패" />);
    
    expect(screen.getByText('데이터 로딩 실패')).toBeInTheDocument();
  });
});
