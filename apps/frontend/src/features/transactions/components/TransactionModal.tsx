import React, { useState, useContext, useEffect } from 'react';
import { Modal, Button, Input, DatePicker, Select, HierarchicalCategorySelect } from '../../../index';
import { CurrencyInput } from '../../../shared/components/forms/CurrencyInput';
import { AppContext } from '../../../index';
import type { Transaction, TransactionCategory } from '../../../index';
import { EXPENSE_CATEGORIES } from '../../../index';
import { colors } from '../../../styles/theme';

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
    category: (transaction?.category as TransactionCategory) || EXPENSE_CATEGORIES.RESTAURANT,
    type: (transaction?.transaction_type === 'income' || transaction?.transaction_type === 'expense') ? transaction.transaction_type : 'expense',
    date: transaction?.date || new Date().toISOString().split('T')[0],
    merchant: transaction?.merchant || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // transaction prop이 변경될 때마다 폼 데이터 업데이트
  useEffect(() => {
    console.log('🔍 TransactionModal - transaction prop 변경됨:', transaction);
    if (transaction) {
      console.log('📝 거래 데이터 구조:', {
        amount: transaction.amount,
        description: transaction.description,
        category: transaction.category,
        type: transaction.transaction_type,
        date: transaction.date,
        merchant: transaction.merchant
      });
      setFormData({
        amount: transaction.amount.toString(),
        description: transaction.description || '',
        category: transaction.category as TransactionCategory,
        type: (transaction.transaction_type === 'income' || transaction.transaction_type === 'expense') ? transaction.transaction_type : 'expense',
        date: transaction.date,
        merchant: transaction.merchant || ''
      });
    } else {
      console.log('✨ 새 거래 추가 모드 - 폼 초기화');
      // 새 거래 추가 시 초기값으로 리셋
      setFormData({
        amount: '',
        description: '',
        category: EXPENSE_CATEGORIES.RESTAURANT,
        type: 'expense',
        date: new Date().toISOString().split('T')[0],
        merchant: ''
      });
    }
    // 에러도 초기화
    setErrors({});
  }, [transaction]);

  // 거래 유형 옵션들
  const typeOptions = [
    { value: 'expense', label: '💸 지출' },
    { value: 'income', label: '💰 수입' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔥 TransactionModal handleSubmit 시작');
    console.log('📝 현재 폼 데이터:', formData);
    console.log('✏️ 수정 모드인가?', isEditing);
    console.log('📄 거래 객체:', transaction);
    
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
      console.log('❌ 유효성 검사 실패:', newErrors);
      setErrors(newErrors);
      return;
    }

    try {
      const transactionData: Omit<Transaction, 'id'> = {
        amount: parseFloat(formData.amount),
        description: formData.description.trim() || undefined,
        category: formData.category as TransactionCategory,
        transaction_type: formData.type as 'expense' | 'income',
        date: formData.date,
        transaction_date: formData.date,
        merchant: formData.merchant.trim() || undefined,
        user_id: 1, // TODO: 실제 사용자 ID로 변경
        category_key: formData.category,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('🚀 API 호출 준비:', transactionData);

      if (isEditing && transaction) {
        console.log('📝 거래 수정 API 호출 시작');
        await updateTransaction({ ...transactionData, id: transaction.id });
        console.log('✅ 거래 수정 완료');
      } else {
        console.log('➕ 거래 추가 API 호출 시작');
        await addTransaction(transactionData);
        console.log('✅ 거래 추가 완료');
      }

      console.log('🎉 모달 닫기');
      onClose();
    } catch (error) {
      console.error('❌ 거래 처리 실패:', error);
      setErrors({ general: '거래 처리 중 오류가 발생했습니다.' });
    }
  };

  const handleClose = () => {
    setFormData({
      amount: '',
      description: '',
      category: EXPENSE_CATEGORIES.RESTAURANT,
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
              <div style={{
                background: darkMode ? colors.dark[700] : colors.gray[50],
                borderRadius: '12px',
                padding: '16px',
                border: `1px solid ${darkMode ? colors.dark[600] : colors.gray[200]}`
              }}>
                <Select
                  label="거래 유형"
                  value={formData.type}
                  onChange={(value: string) => setFormData(prev => ({ ...prev, type: value as 'income' | 'expense' }))}
                  options={typeOptions}
                  required
                  darkMode={darkMode}
                  size="lg"
                />
              </div>

              <div style={{
                background: darkMode ? colors.dark[700] : colors.gray[50],
                borderRadius: '12px',
                padding: '16px',
                border: `1px solid ${darkMode ? colors.dark[600] : colors.gray[200]}`
              }}>
                <CurrencyInput
                  label="금액"
                  value={parseFloat(formData.amount) || 0}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, amount: value.toString() }))}
                  placeholder="금액을 입력하세요"
                  required
                  error={errors.amount}
                  darkMode={darkMode}
                  min={0}
                  showCurrencySelector={false}
                  currency="KRW"
                />
              </div>
            </div>

            <div style={{ 
              marginTop: '16px',
              background: darkMode ? colors.dark[700] : colors.gray[50],
              borderRadius: '12px',
              padding: '16px',
              border: `1px solid ${darkMode ? colors.dark[600] : colors.gray[200]}`
            }}>
              <Input
                label="거래 설명"
                value={formData.description}
                onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                placeholder="거래 내용을 입력하세요 (예: 점심 식사, 커피, 월급 등)"
                required
                error={errors.description}
                darkMode={darkMode}
                size="lg"
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
            <div style={{
              background: darkMode ? colors.primary[900] : colors.primary[50],
              borderRadius: '12px',
              padding: '20px',
              border: `2px solid ${darkMode ? colors.primary[700] : colors.primary[200]}`
            }}>
              <HierarchicalCategorySelect
                value={formData.category}
                onChange={(category: TransactionCategory) => setFormData(prev => ({ ...prev, category }))}
                placeholder="카테고리를 선택하세요"
                darkMode={darkMode}
              />
            </div>
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
              <div style={{
                background: darkMode ? colors.dark[700] : colors.gray[50],
                borderRadius: '12px',
                padding: '16px',
                border: `1px solid ${darkMode ? colors.dark[600] : colors.gray[200]}`
              }}>
                <DatePicker
                  label="날짜"
                  value={formData.date}
                  onChange={(value) => setFormData(prev => ({ ...prev, date: value }))}
                  required
                  darkMode={darkMode}
                  size="lg"
                />
              </div>

              <div style={{
                background: darkMode ? colors.dark[700] : colors.gray[50],
                borderRadius: '12px',
                padding: '16px',
                border: `1px solid ${darkMode ? colors.dark[600] : colors.gray[200]}`
              }}>
                <Input
                  label="상점/장소 (선택)"
                  value={formData.merchant}
                  onChange={(value) => setFormData(prev => ({ ...prev, merchant: value }))}
                  placeholder="상점명이나 장소를 입력하세요"
                  darkMode={darkMode}
                  size="lg"
                  icon="🏢"
                  iconPosition="left"
                />
              </div>
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
            paddingTop: '24px',
            borderTop: `2px solid ${darkMode ? colors.gray[700] : colors.gray[200]}`,
            marginTop: '24px'
          }}>
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              size="lg"
              style={{ 
                minWidth: '120px',
                fontWeight: '600'
              }}
            >
              ❌ 취소
            </Button>
            <Button
              type="submit"
              variant={formData.type === 'income' ? 'success' : 'primary'}
              size="lg"
              style={{ 
                minWidth: '140px',
                fontWeight: '600',
                background: formData.type === 'income' 
                  ? `linear-gradient(135deg, ${colors.success[500]}, ${colors.success[600]})`
                  : `linear-gradient(135deg, ${colors.primary[500]}, ${colors.primary[600]})`
              }}
            >
              {formData.type === 'income' ? '💰' : '💸'} {isEditing ? '수정하기' : '추가하기'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};