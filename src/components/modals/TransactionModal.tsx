import React, { useState, useContext } from 'react';
import { Modal, Input, DatePicker, Select, HierarchicalCategorySelect } from '../ui';
import { Button } from '../ui/Button';
import { AppContext } from '../../context/AppContext';
import type { Transaction, TransactionCategory } from '../../types';
import { ExpenseSecondaryCategory } from '../../types';
import { colors } from '../../styles/theme';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: Transaction;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  transaction
}) => {
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error('TransactionModal must be used within an AppProvider');
  }

  const { addTransaction, updateTransaction, state: { darkMode } } = context;
  const isEditing = !!transaction;

  const [formData, setFormData] = useState<{
    amount: string;
    description: string;
    category: TransactionCategory;
    type: 'income' | 'expense';
    date: string;
    merchant: string;
  }>({
    amount: transaction?.amount.toString() || '',
    description: transaction?.description || '',
    category: (transaction?.category as TransactionCategory) || ExpenseSecondaryCategory.FOOD_RESTAURANT,
    type: transaction?.type || 'expense',
    date: transaction?.date || new Date().toISOString().split('T')[0],
    merchant: transaction?.merchant || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 거래 유형 옵션들
  const typeOptions = [
    { value: 'expense', label: '지출' },
    { value: 'income', label: '수입' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 유효성 검사
    const newErrors: Record<string, string> = {};
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = '금액을 올바르게 입력해주세요.';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = '거래 설명을 입력해주세요.';
    }
    
    if (!formData.date) {
      newErrors.date = '날짜를 선택해주세요.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const transactionData: Omit<Transaction, 'id'> = {
      amount: parseFloat(formData.amount),
      description: formData.description.trim(),
      category: formData.category as TransactionCategory,
      type: formData.type,
      date: formData.date,
      merchant: formData.merchant.trim() || undefined
    };

    if (isEditing && transaction) {
      updateTransaction({ ...transactionData, id: transaction.id });
    } else {
      addTransaction(transactionData);
    }

    onClose();
  };

  const handleClose = () => {
    setFormData({
      amount: '',
      description: '',
      category: ExpenseSecondaryCategory.FOOD_RESTAURANT,
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      merchant: ''
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? '📝 거래 내역 수정' : '✨ 새 거래 추가'}
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
        {/* 헤더 정보 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px',
          padding: '16px',
          background: formData.type === 'income'
            ? darkMode ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)'
            : darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
          borderRadius: '12px',
          border: `1px solid ${
            formData.type === 'income'
              ? darkMode ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)'
              : darkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)'
          }`
        }}>
          <span style={{ fontSize: '24px' }}>
            {formData.type === 'income' ? '💰' : '💸'}
          </span>
          <div>
            <h3 style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: '600',
              color: darkMode ? colors.gray[100] : colors.gray[800]
            }}>
              {formData.type === 'income' ? '수입' : '지출'} 거래 {isEditing ? '수정' : '추가'}
            </h3>
            <p style={{
              margin: 0,
              fontSize: '14px',
              color: darkMode ? colors.gray[400] : colors.gray[600]
            }}>
              정확한 거래 정보를 입력하여 가계부를 관리하세요
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* 기본 정보 섹션 */}
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
              <span style={{ fontSize: '18px' }}>📋</span>
              <h4 style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: '600',
                color: darkMode ? colors.gray[100] : colors.gray[800]
              }}>
                기본 정보
              </h4>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', alignItems: 'start' }}>
              <Select
                label="거래 유형"
                value={formData.type}
                onChange={(value: string) => setFormData(prev => ({ ...prev, type: value as 'income' | 'expense' }))}
                options={typeOptions}
                required
                darkMode={darkMode}
              />

              <Input
                label="금액"
                type="number"
                value={formData.amount}
                onChange={(value) => setFormData(prev => ({ ...prev, amount: value }))}
                placeholder="금액을 입력하세요"
                required
                error={errors.amount}
                darkMode={darkMode}
                min={0}
                step={100}
              />
            </div>

            <div style={{ marginTop: '16px' }}>
              <Input
                label="거래 설명"
                value={formData.description}
                onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                placeholder="거래 내용을 입력하세요"
                required
                error={errors.description}
                darkMode={darkMode}
              />
            </div>
          </div>

          {/* 카테고리 섹션 */}
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
            <HierarchicalCategorySelect
              value={formData.category}
              onChange={(category) => setFormData(prev => ({ ...prev, category }))}
              placeholder="카테고리를 선택하세요"
              darkMode={darkMode}
            />
          </div>

          {/* 부가 정보 섹션 */}
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
              <span style={{ fontSize: '18px' }}>📅</span>
              <h4 style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: '600',
                color: darkMode ? colors.gray[100] : colors.gray[800]
              }}>
                부가 정보
              </h4>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <DatePicker
                label="날짜"
                value={formData.date}
                onChange={(value) => setFormData(prev => ({ ...prev, date: value }))}
                required
                darkMode={darkMode}
              />

              <Input
                label="상점/장소 (선택)"
                value={formData.merchant}
                onChange={(value) => setFormData(prev => ({ ...prev, merchant: value }))}
                placeholder="상점명이나 장소를 입력하세요"
                darkMode={darkMode}
              />
            </div>
          </div>

          {/* 요약 미리보기 */}
          {(formData.amount && formData.description) && (
            <div style={{
              padding: '16px',
              background: darkMode 
                ? 'rgba(59, 130, 246, 0.1)' 
                : 'rgba(59, 130, 246, 0.05)',
              borderRadius: '12px',
              border: `1px solid ${darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)'}`
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
                  color: darkMode ? colors.primary[400] : colors.primary[700]
                }}>
                  거래 요약
                </span>
              </div>
              <p style={{
                margin: 0,
                fontSize: '13px',
                color: darkMode ? colors.gray[300] : colors.gray[600],
                lineHeight: 1.5
              }}>
                <strong>{formData.type === 'income' ? '수입' : '지출'}</strong>: {formData.description}<br/>
                <strong>금액</strong>: {formData.amount ? `${Number(formData.amount).toLocaleString()}원` : '0원'}<br/>
                <strong>날짜</strong>: {formData.date}
                {formData.merchant && <><br/><strong>장소</strong>: {formData.merchant}</>}
              </p>
            </div>
          )}

          {/* 액션 버튼들 */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            paddingTop: '20px',
            borderTop: `1px solid ${darkMode ? colors.gray[700] : colors.gray[200]}`,
            marginTop: '20px'
          }}>
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              size="md"
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={formData.type === 'income' ? '💰' : '💸'}
              size="md"
            >
              {isEditing ? '수정하기' : '추가하기'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
