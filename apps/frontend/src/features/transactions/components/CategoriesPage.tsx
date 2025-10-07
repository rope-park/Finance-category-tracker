/**
 * 카테고리 분석 페이지 컴포넌트
 * 
 * 주요 기능:
 * - 다양한 분석 기간 선택 (최근 1주, 1개월, 1년, 전체 기간, 직접 설정)
 * - 선택한 기간 동안의 총 수입, 총 지출, 순 수지 요약
 * - 카테고리별 수입/지출 상세 분석
 */
import React, { useState } from 'react';
import { useApp } from '../../../app/hooks/useApp';
import { useTransactionFilter } from '../hooks/useTransactionFilter';
import { useCategoryStats } from '../../analytics/hooks/useCategoryStats';
import { 
  PageLayout, 
  Section, 
  Card, 
  Grid, 
  Button, 
  StatsCard,
  Tooltip
} from '../../../index';
import { colors } from '../../../styles/theme';
import type { AnalysisPeriod, DateRange, TransactionCategory } from '../../../index';

// 지역화된 기간 옵션 타입
interface LocalPeriodOption {
  id: AnalysisPeriod;
  label: string;
  value: AnalysisPeriod;
}
import { getCategoryIcon, getCategoryName, formatCurrency } from '../../../shared/utils';

/**
 * 카테고리 분석 페이지 컴포넌트
 * @returns 카테고리 분석 페이지 컴포넌트
 */
export const CategoriesPage: React.FC = () => {
  const { darkMode } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState<AnalysisPeriod>('month');
  const [customDateRange, setCustomDateRange] = useState<DateRange>({
    start: '',
    end: ''
  });

  // 필터링된 거래 내역과 총 수입/지출 계산
  const { filteredTransactions, totalIncome, totalExpense } = useTransactionFilter(
    selectedPeriod, 
    selectedPeriod === 'custom' ? customDateRange : undefined
  );

  // 지역화된 기간 옵션
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
          flexWrap: 'wrap', 
          gap: '12px', 
          marginBottom: '24px' 
        }}>
          {periodOptions.map((option) => (
            <Tooltip key={option.id} text={`${option.label} 데이터를 분석합니다`} position="top">
              <Button
                onClick={() => setSelectedPeriod(option.id)}
                variant={selectedPeriod === option.id ? 'primary' : 'secondary'}
                style={{ minWidth: '120px' }}
              >
                {option.label}
              </Button>
            </Tooltip>
          ))}
        </div>
        
        {/* 직접 설정 옵션 */}
        {selectedPeriod === 'custom' && (
          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            alignItems: 'center',
            marginTop: '16px'
          }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px',
                fontSize: '14px',
                color: darkMode ? colors.dark[300] : colors.gray[600]
              }}>
                시작 날짜
              </label>
              <input
                type="date"
                value={customDateRange.start}
                onChange={(e) => setCustomDateRange(prev => ({
                  ...prev,
                  start: e.target.value
                }))}
                style={{
                  padding: '8px 12px',
                  border: `1px solid ${darkMode ? colors.dark[600] : colors.gray[300]}`,
                  borderRadius: '8px',
                  backgroundColor: darkMode ? colors.dark[700] : '#ffffff',
                  color: darkMode ? colors.dark[50] : colors.gray[900],
                  fontSize: '14px'
                }}
              />
            </div>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px',
                fontSize: '14px',
                color: darkMode ? colors.dark[300] : colors.gray[600]
              }}>
                종료 날짜
              </label>
              <input
                type="date"
                value={customDateRange.end}
                onChange={(e) => setCustomDateRange(prev => ({
                  ...prev,
                  end: e.target.value
                }))}
                style={{
                  padding: '8px 12px',
                  border: `1px solid ${darkMode ? colors.dark[600] : colors.gray[300]}`,
                  borderRadius: '8px',
                  backgroundColor: darkMode ? colors.dark[700] : '#ffffff',
                  color: darkMode ? colors.dark[50] : colors.gray[900],
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
        )}
      </Section>

      {/* 전체 요약 */}
      <Grid columns={3} style={{ marginBottom: '32px' }}>
        <Tooltip text="선택한 기간 동안의 총 수입입니다" position="top">
          <StatsCard
            title="총 수입"
            value={formatCurrency(totalIncome)}
            icon="📈"
          />
        </Tooltip>
        <Tooltip text="선택한 기간 동안의 총 지출입니다" position="top">
          <StatsCard
            title="총 지출"
            value={formatCurrency(totalExpense)}
            icon="📉"
          />
        </Tooltip>
        <Tooltip text="수입에서 지출을 뺀 순 수지입니다" position="top">
          <StatsCard
            title="순 수지"
            value={formatCurrency(totalIncome - totalExpense)}
            icon="💰"
          />
        </Tooltip>
      </Grid>

      {/* 카테고리별 상세 분석 */}
      <Section title="카테고리별 상세 분석" icon="📋">
        {categoryStats.length > 0 ? (
          <Grid columns={1}>
            {categoryStats.map((stat) => (
              <Card key={stat.category}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>
                      {getCategoryIcon(stat.category as TransactionCategory)}
                    </span>
                    <div>
                      <h3 style={{ 
                        margin: 0, 
                        fontSize: '18px',
                        color: darkMode ? colors.dark[50] : colors.gray[900]
                      }}>
                        {getCategoryName(stat.category as TransactionCategory)}
                      </h3>
                      <p style={{ 
                        margin: 0, 
                        fontSize: '14px',
                        color: darkMode ? colors.dark[300] : colors.gray[600]
                      }}>
                        거래 {stat.transactionCount}건
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {stat.income > 0 && (
                      <div style={{ 
                        color: colors.success[600], 
                        fontSize: '16px', 
                        fontWeight: '600' 
                      }}>
                        +{formatCurrency(stat.income)}
                      </div>
                    )}
                    {stat.expense > 0 && (
                      <div style={{ 
                        color: colors.error[600], 
                        fontSize: '16px', 
                        fontWeight: '600' 
                      }}>
                        -{formatCurrency(stat.expense)}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </Grid>
        ) : (
          <Card>
            <div style={{ 
              padding: '40px', 
              textAlign: 'center',
              color: darkMode ? colors.dark[300] : colors.gray[600]
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
              <h3 style={{ margin: '0 0 8px 0' }}>분석할 데이터가 없습니다</h3>
              <p style={{ margin: 0 }}>선택한 기간에 거래 내역이 없습니다.</p>
            </div>
          </Card>
        )}
      </Section>
    </PageLayout>
  );
};