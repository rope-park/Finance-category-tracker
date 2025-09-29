import React, { useState, useContext, useEffect } from 'react';
import { Modal, FormField, CurrencyInput, PercentageInput, HierarchicalCategorySelect } from '../ui';
import { Button } from '../ui/Button';
import type { CurrencyType } from '../ui/CurrencyInput';
import { AppContext } from '../../context/AppContext';
import type { CategoryBudget, TransactionCategory } from '../../types';
import { getCategoryLabel, ExpenseSecondaryCategory } from '../../types';
import { colors } from '../../styles/theme';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget?: CategoryBudget;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  budget
}) => {
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error('BudgetModal must be used within an AppProvider');
  }

  const { updateBudget, deleteBudget, state: { darkMode, budgets } } = context;
  const isEditing = !!budget;

  // formatCurrency 헬퍼 함수
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()}원`;
  };

  // 현재 선택된 카테고리에 이미 예산이 설정되어 있는지 확인
  const hasExistingBudget = (category: string) => {
    return budgets.some(b => b.category === category);
  };

  const [formData, setFormData] = useState<{
    category: TransactionCategory;
    limit: number;
    warningThreshold: number;
    currency: CurrencyType;
  }>({
    category: (budget?.category as TransactionCategory) || ExpenseSecondaryCategory.FOOD_RESTAURANT,
    limit: budget?.limit || 0,
    warningThreshold: budget?.warningThreshold || 80,
    currency: 'KRW'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // budget prop이 변경될 때마다 formData 업데이트
  useEffect(() => {
    if (budget) {
      setFormData({
        category: budget.category as TransactionCategory,
        limit: budget.limit,
        warningThreshold: budget.warningThreshold,
        currency: 'KRW'
      });
    } else {
      setFormData({
        category: ExpenseSecondaryCategory.FOOD_RESTAURANT,
        limit: 0,
        warningThreshold: 80,
        currency: 'KRW'
      });
    }
    // 에러도 초기화
    setErrors({});
  }, [budget]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔵 handleSubmit 호출됨');
    console.log('📝 formData:', formData);
    
    // 유효성 검사
    const newErrors: Record<string, string> = {};
    
    if (!formData.limit || formData.limit <= 0) {
      newErrors.limit = '예산 한도를 올바르게 입력해주세요.';
    }

    if (!formData.warningThreshold || formData.warningThreshold <= 0 || formData.warningThreshold > 100) {
      newErrors.warningThreshold = '경고 임계값을 올바르게 입력해주세요 (1-100%).';
    }

    if (Object.keys(newErrors).length > 0) {
      console.log('❌ 유효성 검사 실패:', newErrors);
      setErrors(newErrors);
      return;
    }

    console.log('✅ 유효성 검사 통과, updateBudget 호출 중...');
    console.log('🏷️ 카테고리:', formData.category);
    console.log('💰 한도:', formData.limit);
    console.log('⚠️ 경고 임계값:', formData.warningThreshold);

    try {
      updateBudget(
        formData.category as TransactionCategory,
        formData.limit,
        formData.warningThreshold
      );
      console.log('🎉 updateBudget 호출 완료');
      onClose();
    } catch (error) {
      console.error('💥 updateBudget 에러:', error);
    }
  };

  const handleDelete = () => {
    console.log('🗑️ handleDelete 호출됨');
    console.log('📝 현재 formData:', formData);
    console.log('📦 전달받은 budget prop:', budget);
    
    if (window.confirm(`${getCategoryLabel(formData.category as TransactionCategory)} 카테고리의 예산을 삭제하시겠습니까?`)) {
      console.log('🗑️ 예산 삭제 요청:', formData.category);
      deleteBudget(formData.category as TransactionCategory);
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({
      category: ExpenseSecondaryCategory.FOOD_RESTAURANT,
      limit: 0,
      warningThreshold: 80,
      currency: 'KRW'
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? '💰 예산 수정' : '🎯 새 예산 설정'}
      size="medium"
      variant="elevated"
    >
      <div style={{
        background: darkMode 
          ? `linear-gradient(135deg, ${colors.gray[800]} 0%, ${colors.gray[900]} 100%)`
          : `linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)`,
        borderRadius: '16px',
        padding: '24px',
        margin: '-24px -24px 0 -24px'
      }}>
        {/* 프로그레스 인디케이터 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '24px',
          padding: '16px',
          background: darkMode 
            ? 'rgba(59, 130, 246, 0.1)' 
            : 'rgba(59, 130, 246, 0.05)',
          borderRadius: '12px',
          border: `1px solid ${darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)'}`
        }}>
          <span style={{ fontSize: '20px' }}>📊</span>
          <div>
            <h3 style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: '600',
              color: darkMode ? colors.gray[100] : colors.gray[800]
            }}>
              스마트 예산 관리
            </h3>
            <p style={{
              margin: 0,
              fontSize: '14px',
              color: darkMode ? colors.gray[400] : colors.gray[600]
            }}>
              카테고리별 지출 한도를 설정하고 효율적으로 관리하세요
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* 카테고리 선택 섹션 */}
          <div style={{
            padding: '20px',
            background: darkMode ? colors.gray[800] : '#ffffff',
            borderRadius: '12px',
            border: `1px solid ${darkMode ? colors.gray[700] : colors.gray[200]}`,
            boxShadow: darkMode 
              ? '0 1px 3px rgba(0, 0, 0, 0.3)' 
              : '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <span style={{ fontSize: '18px' }}>🏷️</span>
              <h4 style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: '600',
                color: darkMode ? colors.gray[100] : colors.gray[800]
              }}>
                카테고리 선택
              </h4>
            </div>
            <div style={{
              background: darkMode ? colors.primary[900] : colors.primary[50],
              borderRadius: '12px',
              padding: '20px',
              border: `2px solid ${darkMode ? colors.primary[700] : colors.primary[200]}`
            }}>
              <FormField
                label=""
                required
                darkMode={darkMode}
              >
                <HierarchicalCategorySelect
                  value={formData.category}
                  onChange={(category) => setFormData(prev => ({ ...prev, category }))}
                  placeholder="카테고리를 선택하세요"
                  className="w-full"
                  darkMode={darkMode}
                />
              </FormField>
            </div>
          </div>

          {/* 예산 설정 섹션 */}
          <div style={{
            padding: '20px',
            background: darkMode ? colors.gray[800] : '#ffffff',
            borderRadius: '12px',
            border: `1px solid ${darkMode ? colors.gray[700] : colors.gray[200]}`,
            boxShadow: darkMode 
              ? '0 1px 3px rgba(0, 0, 0, 0.3)' 
              : '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px'
            }}>
              <span style={{ fontSize: '18px' }}>💰</span>
              <h4 style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: '600',
                color: darkMode ? colors.gray[100] : colors.gray[800]
              }}>
                예산 금액 설정
              </h4>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{
                background: darkMode ? colors.dark[700] : colors.gray[50],
                borderRadius: '12px',
                padding: '16px',
                border: `1px solid ${darkMode ? colors.dark[600] : colors.gray[200]}`
              }}>
                <CurrencyInput
                  label="월 예산 한도"
                  value={formData.limit}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, limit: value }))}
                  onCurrencyChange={(currency) => setFormData(prev => ({ ...prev, currency }))}
                  placeholder="예산 한도를 입력하세요"
                  required
                  error={errors.limit}
                  darkMode={darkMode}
                  min={1000}
                  currency={formData.currency}
                  showCurrencySelector={true}
                />
              </div>

              <div style={{
                background: darkMode ? colors.dark[700] : colors.gray[50],
                borderRadius: '12px',
                padding: '16px',
                border: `1px solid ${darkMode ? colors.dark[600] : colors.gray[200]}`
              }}>
                <PercentageInput
                  label="경고 알림 기준 (%)"
                  value={formData.warningThreshold}
                  onChange={(value) => setFormData(prev => ({ ...prev, warningThreshold: value }))}
                  required
                  error={errors.warningThreshold}
                  darkMode={darkMode}
                  customOptions={[70, 80, 85, 90, 95]}
                />
              </div>
            </div>

            {/* 예산 미리보기 */}
            {formData.limit > 0 && (
              <div style={{
                marginTop: '20px',
                padding: '16px',
                background: darkMode 
                  ? 'rgba(34, 197, 94, 0.1)' 
                  : 'rgba(34, 197, 94, 0.05)',
                borderRadius: '8px',
                border: `1px solid ${darkMode ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)'}`
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <span style={{ fontSize: '16px' }}>💡</span>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: darkMode ? colors.success[400] : colors.success[700]
                  }}>
                    예산 설정 미리보기
                  </span>
                </div>
                <p style={{
                  margin: 0,
                  fontSize: '13px',
                  color: darkMode ? colors.gray[300] : colors.gray[600],
                  lineHeight: 1.5
                }}>
                  월 예산: <strong>{formatCurrency(formData.limit)}</strong><br/>
                  경고 기준: 예산의 <strong>{formData.warningThreshold}%</strong> 사용 시 ({formatCurrency(formData.limit * formData.warningThreshold / 100)})
                </p>
              </div>
            )}
          </div>

          {/* 액션 버튼들 */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '24px',
            borderTop: `2px solid ${darkMode ? colors.gray[700] : colors.gray[200]}`,
            marginTop: '24px'
          }}>
            <div>
              {(isEditing || hasExistingBudget(formData.category)) && (
                <Button
                  variant="error"
                  onClick={handleDelete}
                  type="button"
                  size="lg"
                  style={{ 
                    minWidth: '120px',
                    fontWeight: '600'
                  }}
                >
                  🗑️ 삭제
                </Button>
              )}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button
                variant="secondary"
                onClick={handleClose}
                type="button"
                size="lg"
                style={{ 
                  minWidth: '120px',
                  fontWeight: '600'
                }}
              >
                ❌ 취소
              </Button>
              <Button
                variant="success"
                type="submit"
                size="lg"
                style={{ 
                  minWidth: '140px',
                  fontWeight: '600',
                  background: `linear-gradient(135deg, ${colors.success[500]}, ${colors.success[600]})`
                }}
              >
                💾 {isEditing || hasExistingBudget(formData.category) ? '수정하기' : '추가하기'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};