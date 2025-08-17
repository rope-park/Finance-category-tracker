import React, { useMemo } from 'react';
import { useApp } from '../../hooks/useApp';
import { 
  PageLayout, 
  Section, 
  Card, 
  Grid, 
  StatCard,
  ProgressBar
} from '../ui';
import { colors } from '../../styles/theme';
import { type TransactionCategory } from '../../types';
import { formatCurrency, getCategoryIcon, getCategoryName } from '../../utils';

export const AnalyticsPage: React.FC = () => {
  const { transactions, darkMode } = useApp();

  // 기본 통계 계산
  const analytics = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income');
    const expenses = transactions.filter(t => t.type === 'expense');
    
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const netAmount = totalIncome - totalExpenses;
    
    // 카테고리별 지출 분석
    const expensesByCategory = expenses.reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
      return acc;
    }, {} as Record<TransactionCategory, number>);

    // 가장 큰 지출 카테고리
    const topExpenseCategory = Object.entries(expensesByCategory)
      .sort(([,a], [,b]) => b - a)[0];

    // 최근 7일 지출
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentExpenses = expenses.filter(t => 
      new Date(t.date) >= sevenDaysAgo
    );
    const recentTotal = recentExpenses.reduce((sum, t) => sum + t.amount, 0);
    const avgDailySpending = recentTotal / 7;

    // 월별 통계 (현재 월)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
    });
    
    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // 저축률 계산
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    return {
      totalIncome,
      totalExpenses,
      netAmount,
      expensesByCategory,
      topExpenseCategory,
      avgDailySpending,
      monthlyIncome,
      monthlyExpenses,
      savingsRate,
      transactionCount: transactions.length
    };
  }, [transactions]);

  // 카테고리별 지출 상위 5개
  const topCategories = Object.entries(analytics.expensesByCategory)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([category, amount]) => ({
      category: category as TransactionCategory,
      amount,
      percentage: analytics.totalExpenses > 0 ? (amount / analytics.totalExpenses) * 100 : 0
    }));

  return (
    <PageLayout>
      <Section 
        title="분석 리포트" 
        subtitle="지출 패턴과 재정 상태를 한눈에 확인하세요" 
        icon="📊"
      >
        <div></div>
      </Section>

      {/* 주요 지표 */}
      <Grid columns={4} style={{ marginBottom: '32px' }}>
        <StatCard
          title="총 수입"
          value={formatCurrency(analytics.totalIncome)}
          icon="💰"
        />
        <StatCard
          title="총 지출"
          value={formatCurrency(analytics.totalExpenses)}
          icon="💸"
        />
        <StatCard
          title="순 자산"
          value={formatCurrency(analytics.netAmount)}
          icon="💵"
        />
        <StatCard
          title="저축률"
          value={`${analytics.savingsRate.toFixed(1)}%`}
          icon="🎯"
        />
      </Grid>

      {/* 이번 달 현황 */}
      <Section title="이번 달 현황" subtitle="현재 월의 수입과 지출 요약">
        <Grid columns={3} style={{ marginBottom: '32px' }}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📈</div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: darkMode ? colors.dark[100] : colors.gray[900],
                margin: '0 0 4px 0',
                fontFamily: "'Noto Sans KR', sans-serif"
              }}>
                월 수입
              </h3>
              <p style={{
                fontSize: '20px',
                fontWeight: '700',
                color: colors.success[600],
                margin: 0,
                fontFamily: "'Noto Sans KR', sans-serif"
              }}>
                {formatCurrency(analytics.monthlyIncome)}
              </p>
            </div>
          </Card>

          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📉</div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: darkMode ? colors.dark[100] : colors.gray[900],
                margin: '0 0 4px 0',
                fontFamily: "'Noto Sans KR', sans-serif"
              }}>
                월 지출
              </h3>
              <p style={{
                fontSize: '20px',
                fontWeight: '700',
                color: colors.error[600],
                margin: 0,
                fontFamily: "'Noto Sans KR', sans-serif"
              }}>
                {formatCurrency(analytics.monthlyExpenses)}
              </p>
            </div>
          </Card>

          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📅</div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: darkMode ? colors.dark[100] : colors.gray[900],
                margin: '0 0 4px 0',
                fontFamily: "'Noto Sans KR', sans-serif"
              }}>
                일평균 지출
              </h3>
              <p style={{
                fontSize: '20px',
                fontWeight: '700',
                color: darkMode ? colors.dark[100] : colors.gray[900],
                margin: 0,
                fontFamily: "'Noto Sans KR', sans-serif"
              }}>
                {formatCurrency(analytics.avgDailySpending)}
              </p>
            </div>
          </Card>
        </Grid>
      </Section>

      {/* 카테고리별 지출 분석 */}
      <Section title="카테고리별 지출" subtitle="어디에 가장 많이 지출하고 있는지 확인해보세요">
        {topCategories.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: darkMode ? colors.dark[100] : colors.gray[900],
              margin: '0 0 8px 0',
              fontFamily: "'Noto Sans KR', sans-serif"
            }}>
              지출 데이터가 없습니다
            </h3>
            <p style={{
              fontSize: '14px',
              color: darkMode ? colors.dark[400] : colors.gray[600],
              margin: 0,
              fontFamily: "'Noto Sans KR', sans-serif"
            }}>
              거래 내역을 추가하면 분석 결과를 확인할 수 있습니다
            </p>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {topCategories.map(({ category, amount, percentage }) => (
              <Card key={category}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>
                      {getCategoryIcon(category)}
                    </span>
                    <div>
                      <h4 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: darkMode ? colors.dark[100] : colors.gray[900],
                        margin: 0,
                        fontFamily: "'Noto Sans KR', sans-serif"
                      }}>
                        {getCategoryName(category)}
                      </h4>
                      <p style={{
                        fontSize: '14px',
                        color: darkMode ? colors.dark[400] : colors.gray[600],
                        margin: 0,
                        fontFamily: "'Noto Sans KR', sans-serif"
                      }}>
                        전체 지출의 {percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: colors.error[600],
                      fontFamily: "'Noto Sans KR', sans-serif"
                    }}>
                      {formatCurrency(amount)}
                    </div>
                  </div>
                </div>
                
                <ProgressBar 
                  percentage={percentage} 
                  size="sm"
                />
              </Card>
            ))}
          </div>
        )}
      </Section>

      {/* 인사이트 및 권장사항 */}
      <Section title="재정 인사이트" subtitle="데이터 기반 맞춤형 재정 관리 팁">
        <Grid columns={2}>
          <Card>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: darkMode ? colors.dark[100] : colors.gray[900],
                margin: '0 0 8px 0',
                fontFamily: "'Noto Sans KR', sans-serif",
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                💡 저축률 분석
              </h3>
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <ProgressBar 
                percentage={Math.min(analytics.savingsRate, 100)} 
                size="md"
              />
            </div>
            
            <p style={{
              fontSize: '14px',
              color: darkMode ? colors.dark[300] : colors.gray[700],
              margin: 0,
              fontFamily: "'Noto Sans KR', sans-serif",
              lineHeight: '1.5'
            }}>
              {analytics.savingsRate >= 30 
                ? "훌륭한 저축률입니다! 현재 패턴을 유지하세요."
                : analytics.savingsRate >= 20 
                ? "양호한 저축률입니다. 조금 더 절약해보세요."
                : analytics.savingsRate >= 10 
                ? "저축률이 낮습니다. 지출을 재검토해보세요."
                : "저축률이 매우 낮거나 적자입니다. 지출 관리가 필요합니다."
              }
            </p>
          </Card>

          <Card>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: darkMode ? colors.dark[100] : colors.gray[900],
                margin: '0 0 8px 0',
                fontFamily: "'Noto Sans KR', sans-serif",
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🎯 주요 지출 카테고리
              </h3>
            </div>
            
            <p style={{
              fontSize: '14px',
              color: darkMode ? colors.dark[300] : colors.gray[700],
              margin: '0 0 12px 0',
              fontFamily: "'Noto Sans KR', sans-serif",
              lineHeight: '1.5'
            }}>
              {analytics.topExpenseCategory 
                ? `'${getCategoryName(analytics.topExpenseCategory[0] as TransactionCategory)}'에 가장 많이 지출하고 있습니다 (${formatCurrency(analytics.topExpenseCategory[1])})`
                : "아직 지출 데이터가 충분하지 않습니다."
              }
            </p>
            
            {analytics.topExpenseCategory && (
              <div style={{
                padding: '12px',
                backgroundColor: darkMode ? colors.dark[700] : colors.warning[50],
                borderRadius: '8px',
                border: `1px solid ${darkMode ? colors.dark[600] : colors.warning[200]}`
              }}>
                <p style={{
                  fontSize: '12px',
                  color: darkMode ? colors.warning[300] : colors.warning[700],
                  margin: 0,
                  fontFamily: "'Noto Sans KR', sans-serif"
                }}>
                  💡 이 카테고리의 지출을 10% 줄이면 월 {formatCurrency(analytics.topExpenseCategory[1] * 0.1)}을 절약할 수 있습니다.
                </p>
              </div>
            )}
          </Card>
        </Grid>
      </Section>

      {/* 거래 요약 */}
      <Section title="거래 요약" subtitle="전체 거래 현황을 숫자로 확인하세요">
        <Grid columns={3}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📝</div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: darkMode ? colors.dark[100] : colors.gray[900],
                margin: '0 0 4px 0',
                fontFamily: "'Noto Sans KR', sans-serif"
              }}>
                총 거래 수
              </h3>
              <p style={{
                fontSize: '24px',
                fontWeight: '700',
                color: darkMode ? colors.dark[100] : colors.gray[900],
                margin: 0,
                fontFamily: "'Noto Sans KR', sans-serif"
              }}>
                {analytics.transactionCount.toLocaleString()}건
              </p>
            </div>
          </Card>

          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📊</div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: darkMode ? colors.dark[100] : colors.gray[900],
                margin: '0 0 4px 0',
                fontFamily: "'Noto Sans KR', sans-serif"
              }}>
                카테고리 수
              </h3>
              <p style={{
                fontSize: '24px',
                fontWeight: '700',
                color: darkMode ? colors.dark[100] : colors.gray[900],
                margin: 0,
                fontFamily: "'Noto Sans KR', sans-serif"
              }}>
                {Object.keys(analytics.expensesByCategory).length}개
              </p>
            </div>
          </Card>

          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>💳</div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: darkMode ? colors.dark[100] : colors.gray[900],
                margin: '0 0 4px 0',
                fontFamily: "'Noto Sans KR', sans-serif"
              }}>
                평균 거래 금액
              </h3>
              <p style={{
                fontSize: '24px',
                fontWeight: '700',
                color: darkMode ? colors.dark[100] : colors.gray[900],
                margin: 0,
                fontFamily: "'Noto Sans KR', sans-serif"
              }}>
                {analytics.transactionCount > 0 
                  ? formatCurrency((analytics.totalIncome + analytics.totalExpenses) / analytics.transactionCount)
                  : formatCurrency(0)
                }
              </p>
            </div>
          </Card>
        </Grid>
      </Section>
    </PageLayout>
  );
};
