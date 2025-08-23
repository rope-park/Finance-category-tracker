import React, { useState } from 'react';
import { useApp } from '../../hooks/useApp';
import { useTransactionFilter } from '../../hooks/useTransactionFilter';
import { useCategoryStats } from '../../hooks/useCategoryStats';
import { 
  PageLayout, 
  Section, 
  Card, 
  Grid, 
  Button, 
  StatCard,
  Tooltip
} from '../ui';
import { colors } from '../../styles/theme';
import type { AnalysisPeriod, DateRange, TransactionCategory } from '../../types';

interface LocalPeriodOption {
  id: AnalysisPeriod;
  label: string;
  value: AnalysisPeriod;
}
import { getCategoryIcon, getCategoryName, formatCurrency } from '../../utils';

export const CategoriesPage: React.FC = () => {
  const { darkMode } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState<AnalysisPeriod>('month');
  const [customDateRange, setCustomDateRange] = useState<DateRange>({
    start: '',
    end: ''
  });

  const { filteredTransactions, totalIncome, totalExpense } = useTransactionFilter(
    selectedPeriod, 
    selectedPeriod === 'custom' ? customDateRange : undefined
  );

  const periodOptions: LocalPeriodOption[] = [
    { id: 'week', label: '최근 1주', value: 'week' },
    { id: 'month', label: '최근 1개월', value: 'month' },
    { id: 'year', label: '최근 1년', value: 'year' },
    { id: 'all', label: '전체 기간', value: 'all' },
    { id: 'custom', label: '직접 설정', value: 'custom' }
  ];

  const { categoryStats } = useCategoryStats(filteredTransactions);

  return (
    <PageLayout>
      <Section 
        title="카테고리 분석" 
        subtitle="지출과 수입을 카테고리별로 상세하게 분석해보세요" 
        icon="📊"
      >
        <div></div>
      </Section>

      {/* 분석 기간 선택 */}
      <Section title="분석 기간 선택" icon="📅">
        <div style={{ 
          display: 'flex', 
// ...이하 생략 (기존 코드 동일하게 복사)...
