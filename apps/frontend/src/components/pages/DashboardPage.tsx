import React, { useState } from 'react';
import { PageErrorBoundary } from '../ui/ErrorBoundary';
import { useApp } from '../../hooks/useApp';
import { DashboardCharts } from '../DashboardCharts';
import GoalTracker from '../GoalTracker';
import { 
  PageLayout, 
  Section, 
  Card, 
  Grid, 
  Button,
  ProgressBar,
  StatsCard
} from '../ui';
import { TransactionModal, BudgetModal } from '../modals';
import { colors } from '../../styles/theme';
import { getCategoryIcon, getCategoryName, formatCurrency } from '../../utils';

export const DashboardPage: React.FC = () => {
  const { transactions, budgets, darkMode } = useApp();
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);

  // 이번 달 데이터 계산
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyTransactions = transactions.filter(t => {
    const tDate = new Date(t.date);
    return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
  });

  const monthlyIncome = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const monthlyExpense = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyBalance = monthlyIncome - monthlyExpense;

  // 전체 통계
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBalance = totalIncome - totalExpense;

  // 최근 거래 (최대 5개)
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // 예산 사용률 계산
  const budgetUsage = budgets.map(budget => {
    const spent = transactions
      .filter(t => t.category === budget.category && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
    
    return {
      ...budget,
      spent,
      percentage
    };
  }).sort((a, b) => b.percentage - a.percentage);

  // 월별 트렌드 데이터 생성 (최근 6개월)
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const trend = months.map(month => {
    const [year, m] = month.split('-').map(Number);
    const monthTx = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === year && d.getMonth() + 1 === m;
    });
    const income = monthTx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = monthTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return { month, income, expense, balance: income - expense };
  });
  // 카테고리별 지출 데이터 (최근 1개월)
  const now = new Date();
  const catTx = transactions.filter(t => {
    const d = new Date(t.date);
    return t.type === 'expense' && d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
  const catMap: Record<string, { category_name: string; total_amount: number }> = {};
  catTx.forEach(t => {
    const name = getCategoryName(t.category);
    if (!catMap[t.category]) catMap[t.category] = { category_name: name, total_amount: 0 };
    catMap[t.category].total_amount += t.amount;
  });
  const categories = Object.values(catMap).sort((a, b) => b.total_amount - a.total_amount).slice(0, 10);

  return (
    <PageErrorBoundary>
      <PageLayout>

      <Section 
        title="대시보드" 
        subtitle="한눈에 보는 재정 현황과 최신 동향" 
        icon="📊"
      >
        <DashboardCharts trend={trend} categories={categories} />
      </Section>

      {/* 목표 설정 및 추적 */}
      <GoalTracker />

      {/* 주요 지표 */}
      <Grid columns={4} style={{ marginBottom: '32px' }}>
        <StatsCard
          title="총 잔액"
          value={formatCurrency(totalBalance)}
          icon="💰"
          color="blue"
          change={{
            value: `${totalBalance >= 0 ? '+' : ''}${formatCurrency(totalBalance - monthlyBalance)}`,
            trend: totalBalance >= totalBalance - monthlyBalance ? 'up' : 'down'
          }}
        />
        <StatsCard
          title="이번 달 수입"
          value={formatCurrency(monthlyIncome)}
          icon="📈"
          color="green"
          change={{
            value: '+12.5%',
            trend: 'up'
          }}
        />
        <StatsCard
          title="이번 달 지출"
          value={formatCurrency(monthlyExpense)}
          icon="📉"
          color="red"
          change={{
            value: '-5.2%',
            trend: 'down'
          }}
        />
        <StatsCard
          title="이번 달 수지"
          value={formatCurrency(monthlyBalance)}
          icon="💵"
          color={monthlyBalance >= 0 ? 'green' : 'red'}
          change={{
            value: `${monthlyBalance >= 0 ? '+' : ''}${((monthlyBalance / (monthlyIncome || 1)) * 100).toFixed(1)}%`,
            trend: monthlyBalance >= 0 ? 'up' : 'down'
          }}
        />
      </Grid>

      {/* 예산 현황 */}
      <Section title="예산 현황" subtitle="카테고리별 예산 사용 현황을 확인하세요">
        {budgetUsage.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💰</div>
            <h3 className="heading-3 high-contrast" style={{
              color: darkMode ? colors.dark[100] : colors.gray[900],
              margin: '0 0 8px 0',
              fontFamily: "'Noto Sans KR', sans-serif"
            }}>
              설정된 예산이 없습니다
            </h3>
            <p className="text-sm readable-text" style={{
              color: darkMode ? colors.dark[400] : colors.gray[600],
              margin: '0 0 24px 0',
              fontFamily: "'Noto Sans KR', sans-serif"
            }}>
              예산을 설정하여 지출을 체계적으로 관리해보세요
            </p>
            <Button variant="primary" onClick={() => setShowBudgetModal(true)}>
              예산 설정하기
            </Button>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {budgetUsage.slice(0, 3).map(budget => (
              <Card key={budget.category}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>
                      {getCategoryIcon(budget.category)}
                    </span>
                    <div>
                      <h4 className="heading-4 high-contrast" style={{
                        color: darkMode ? colors.dark[100] : colors.gray[900],
                        margin: 0,
                        fontFamily: "'Noto Sans KR', sans-serif"
                      }}>
                        {getCategoryName(budget.category)}
                      </h4>
                      <p className="text-sm readable-text" style={{
                        color: darkMode ? colors.dark[400] : colors.gray[600],
                        margin: 0,
                        fontFamily: "'Noto Sans KR', sans-serif"
                      }}>
                        {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <div className="text-base high-contrast" style={{
                      fontWeight: '600',
                      color: budget.percentage >= 100 ? colors.error[600] : 
                             budget.percentage >= budget.warningThreshold ? colors.warning[500] : colors.success[600],
                      fontFamily: "'Noto Sans KR', sans-serif"
                    }}>
                      {budget.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
                
                <ProgressBar 
                  percentage={Math.min(budget.percentage, 100)} 
                  size="sm"
                />
              </Card>
            ))}
            
            {budgetUsage.length > 3 && (
              <Card style={{ textAlign: 'center', padding: '16px' }}>
                <Button variant="secondary">
                  모든 예산 보기 ({budgetUsage.length}개)
                </Button>
              </Card>
            )}
          </div>
        )}
      </Section>

      {/* 최근 거래 */}
      <Section title="최근 거래" subtitle="최근 발생한 거래 내역을 확인하세요">
        {recentTransactions.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
            <h3 className="heading-3 high-contrast" style={{
              color: darkMode ? colors.dark[100] : colors.gray[900],
              margin: '0 0 8px 0',
              fontFamily: "'Noto Sans KR', sans-serif"
            }}>
              거래 내역이 없습니다
            </h3>
            <p className="text-sm readable-text" style={{
              color: darkMode ? colors.dark[400] : colors.gray[600],
              margin: '0 0 24px 0',
              fontFamily: "'Noto Sans KR', sans-serif"
            }}>
              첫 번째 거래를 추가해보세요
            </p>
            <Button variant="primary" onClick={() => setShowTransactionModal(true)}>
              거래 추가하기
            </Button>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentTransactions.map(transaction => (
              <Card key={transaction.id} interactive={true}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '20px' }}>
                      {getCategoryIcon(transaction.category)}
                    </span>
                    <div>
                      <h4 className="text-sm high-contrast" style={{
                        color: darkMode ? colors.dark[100] : colors.gray[900],
                        margin: 0,
                        fontFamily: "'Noto Sans KR', sans-serif"
                      }}>
                        {transaction.description}
                      </h4>
                      <p className="text-xs readable-text" style={{
                        color: darkMode ? colors.dark[400] : colors.gray[600],
                        margin: 0,
                        fontFamily: "'Noto Sans KR', sans-serif"
                      }}>
                        {transaction.merchant} • {new Date(transaction.date).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <div className="text-sm high-contrast" style={{
                      fontWeight: '600',
                      color: transaction.type === 'income' ? colors.success[600] : colors.error[600],
                      fontFamily: "'Noto Sans KR', sans-serif"
                    }}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            
            <Card style={{ textAlign: 'center', padding: '16px' }}>
              <Button variant="secondary">
                모든 거래 보기
              </Button>
            </Card>
          </div>
        )}
      </Section>

      {/* 빠른 액션 */}
      <Section title="빠른 액션" subtitle="자주 사용하는 기능들을 빠르게 실행하세요">
        <Grid columns={3}>
          <Card interactive={true} style={{ textAlign: 'center', padding: '32px 24px' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>➕</div>
            <h3 className="heading-4 high-contrast" style={{
              color: darkMode ? colors.dark[100] : colors.gray[900],
              margin: '0 0 8px 0',
              fontFamily: "'Noto Sans KR', sans-serif"
            }}>
              거래 추가
            </h3>
            <p className="text-sm readable-text" style={{
              color: darkMode ? colors.dark[400] : colors.gray[600],
              margin: '0 0 16px 0',
              fontFamily: "'Noto Sans KR', sans-serif"
            }}>
              새로운 수입 또는 지출을 기록하세요
            </p>
            <Button variant="primary" style={{ width: '100%' }} onClick={() => setShowTransactionModal(true)}>
              거래 추가
            </Button>
          </Card>

          <Card interactive={true} style={{ textAlign: 'center', padding: '32px 24px' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>💰</div>
            <h3 className="heading-4 high-contrast" style={{
              color: darkMode ? colors.dark[100] : colors.gray[900],
              margin: '0 0 8px 0',
              fontFamily: "'Noto Sans KR', sans-serif"
            }}>
              예산 설정
            </h3>
            <p className="text-sm readable-text" style={{
              color: darkMode ? colors.dark[400] : colors.gray[600],
              margin: '0 0 16px 0',
              fontFamily: "'Noto Sans KR', sans-serif"
            }}>
              카테고리별 예산 한도를 설정하세요
            </p>
            <Button variant="primary" style={{ width: '100%' }} onClick={() => setShowBudgetModal(true)}>
              예산 관리
            </Button>
          </Card>

          <Card interactive={true} style={{ textAlign: 'center', padding: '32px 24px' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📤</div>
            <h3 className="heading-4 high-contrast" style={{
              color: darkMode ? colors.dark[100] : colors.gray[900],
              margin: '0 0 8px 0',
              fontFamily: "'Noto Sans KR', sans-serif"
            }}>
              데이터 내보내기
            </h3>
            <p className="text-sm readable-text" style={{
              color: darkMode ? colors.dark[400] : colors.gray[600],
              margin: '0 0 16px 0',
              fontFamily: "'Noto Sans KR', sans-serif"
            }}>
              거래 내역을 CSV로 내보내세요
            </p>
            <Button variant="secondary" style={{ width: '100%' }} onClick={() => window.location.href='/transactions/export'}>
              내보내기
            </Button>
          </Card>
        </Grid>
      </Section>

      {/* 거래 추가 모달 */}
      <TransactionModal
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
      />

      {/* 예산 설정 모달 */}
      <BudgetModal
        isOpen={showBudgetModal}
        onClose={() => setShowBudgetModal(false)}
      />
    </PageLayout>
  </PageErrorBoundary>
  );
};
