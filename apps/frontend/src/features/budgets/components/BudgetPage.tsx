import React, { useState, useContext } from 'react';
import { PageLayout, Card, Button, ProgressBar } from '../../../index';
import { BudgetModal } from './BudgetModal';
import { AppContext } from '../../../index';
import type { CategoryBudget } from '../../../index';
import { getCategoryName, getCategoryIcon } from '../../../index';
import { colors } from '../../../styles/theme';

export const BudgetPage: React.FC = () => {
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error('BudgetPage must be used within an AppProvider');
  }

  const { state: { budgets, transactions, darkMode } } = context;
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<CategoryBudget | null>(null);

  // 카테고리별 지출 계산
  const getSpentAmount = (category: string) => {
    return transactions
      .filter(t => t.category === category && t.transaction_type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  // 전체 예산 통계
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.limit, 0);
  const totalSpent = budgets.reduce((sum, budget) => {
    const spent = getSpentAmount(budget.category);
    return sum + spent;
  }, 0);

  const handleEditBudget = (budget: CategoryBudget) => {
    setEditingBudget(budget);
  };

  return (
    <PageLayout>
      {/* 헤더 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px' 
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: darkMode ? colors.dark[100] : colors.gray[900],
          margin: 0,
          fontFamily: "'Noto Sans KR', sans-serif"
        }}>
          예산 관리
        </h1>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          예산 추가
        </Button>
      </div>

      {/* 전체 예산 요약 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px',
        marginBottom: '24px' 
      }}>
        <Card style={{ padding: '20px' }}>
          <div style={{ 
            fontSize: '14px', 
            color: darkMode ? colors.dark[400] : colors.gray[600],
            marginBottom: '8px',
            fontFamily: "'Noto Sans KR', sans-serif"
          }}>
            총 예산
          </div>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            color: colors.primary[600],
            fontFamily: "'Noto Sans KR', sans-serif"
          }}>
            {new Intl.NumberFormat('ko-KR', {
              style: 'currency',
              currency: 'KRW'
            }).format(totalBudget)}
          </div>
        </Card>
        
        <Card style={{ padding: '20px' }}>
          <div style={{ 
            fontSize: '14px', 
            color: darkMode ? colors.dark[400] : colors.gray[600],
            marginBottom: '8px',
            fontFamily: "'Noto Sans KR', sans-serif"
          }}>
            총 지출
          </div>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            color: colors.error[600],
            fontFamily: "'Noto Sans KR', sans-serif"
          }}>
            {new Intl.NumberFormat('ko-KR', {
              style: 'currency',
              currency: 'KRW'
            }).format(totalSpent)}
          </div>
        </Card>
        
        <Card style={{ padding: '20px' }}>
          <div style={{ 
            fontSize: '14px', 
            color: darkMode ? colors.dark[400] : colors.gray[600],
            marginBottom: '8px',
            fontFamily: "'Noto Sans KR', sans-serif"
          }}>
            남은 예산
          </div>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            color: totalBudget - totalSpent >= 0 ? colors.success[600] : colors.error[600],
            fontFamily: "'Noto Sans KR', sans-serif"
          }}>
            {new Intl.NumberFormat('ko-KR', {
              style: 'currency',
              currency: 'KRW'
            }).format(totalBudget - totalSpent)}
          </div>
        </Card>
      </div>

      {/* 예산 목록 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {budgets.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💰</div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: darkMode ? colors.dark[100] : colors.gray[900],
              margin: '0 0 8px 0',
              fontFamily: "'Noto Sans KR', sans-serif"
            }}>
              설정된 예산이 없습니다
            </h3>
            <p style={{
              fontSize: '14px',
              color: darkMode ? colors.dark[400] : colors.gray[600],
              margin: '0 0 24px 0',
              fontFamily: "'Noto Sans KR', sans-serif"
            }}>
              첫 번째 예산을 설정해보세요
            </p>
            <Button 
              variant="primary"
              onClick={() => setShowAddModal(true)}
            >
              예산 설정
            </Button>
          </Card>
        ) : (
          budgets.map((budget) => {
            const spent = getSpentAmount(budget.category);
            const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
            const isOverBudget = spent > budget.limit;
            const isNearLimit = percentage >= budget.warningThreshold;

            return (
              <Card key={budget.category} style={{ padding: '20px' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>
                      {getCategoryIcon(budget.category)}
                    </span>
                    <div>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: darkMode ? colors.dark[100] : colors.gray[900],
                        margin: '0 0 4px 0',
                        fontFamily: "'Noto Sans KR', sans-serif"
                      }}>
                        {getCategoryName(budget.category)}
                      </h3>
                      <p style={{
                        fontSize: '14px',
                        color: darkMode ? colors.dark[400] : colors.gray[600],
                        margin: 0,
                        fontFamily: "'Noto Sans KR', sans-serif"
                      }}>
                        {new Intl.NumberFormat('ko-KR', {
                          style: 'currency',
                          currency: 'KRW'
                        }).format(spent)} / {new Intl.NumberFormat('ko-KR', {
                          style: 'currency',
                          currency: 'KRW'
                        }).format(budget.limit)}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                      variant="secondary"
                      onClick={() => handleEditBudget(budget)}
                      style={{ 
                        fontSize: '12px', 
                        padding: '6px 12px',
                        minWidth: 'auto'
                      }}
                    >
                      수정
                    </Button>
                  </div>
                </div>

                {/* 진행률 바 */}
                <div style={{ marginBottom: '12px' }}>
                  <ProgressBar
                    percentage={Math.min(percentage, 100)}
                    color={
                      isOverBudget 
                        ? 'error'
                        : isNearLimit 
                          ? 'warning' 
                          : 'success'
                    }
                  />
                </div>

                {/* 상태 메시지 */}
                <div style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: isOverBudget 
                    ? colors.error[600] 
                    : isNearLimit 
                      ? colors.warning[600] 
                      : colors.success[600],
                  fontFamily: "'Noto Sans KR', sans-serif"
                }}>
                  {isOverBudget 
                    ? `예산 초과! ${percentage.toFixed(1)}%` 
                    : isNearLimit 
                      ? `주의! ${percentage.toFixed(1)}%` 
                      : `${percentage.toFixed(1)}% 사용`}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* 예산 추가 모달 */}
      <BudgetModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      {/* 예산 수정 모달 */}
      <BudgetModal
        isOpen={!!editingBudget}
        onClose={() => setEditingBudget(null)}
        budget={editingBudget || undefined}
      />
    </PageLayout>
  );
};