import React, { useState, useContext } from 'react';
import { Modal, Button, Select, Input, Toggle, FormField, AppContext, getCategoryLabel, getCategoryIcon, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../../index';
import type { TransactionCategory, RecurringTemplate } from '../../../index';

// 로컬 RecurrenceType 정의
type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'yearly';

// 로컬 유틸리티 함수들
const calculateNextDueDate = (recurrenceType: RecurrenceType, recurrenceDay?: number): string => {
  const now = new Date();
  const nextDate = new Date(now);
  
  switch (recurrenceType) {
    case 'daily': {
      nextDate.setDate(now.getDate() + 1);
      break;
    }
    case 'weekly': {
      const daysUntilNext = ((recurrenceDay || 0) - now.getDay() + 7) % 7 || 7;
      nextDate.setDate(now.getDate() + daysUntilNext);
      break;
    }
    case 'monthly': {
      nextDate.setMonth(now.getMonth() + 1);
      nextDate.setDate(recurrenceDay || 1);
      break;
    }
    case 'yearly': {
      nextDate.setFullYear(now.getFullYear() + 1);
      nextDate.setMonth(0);
      nextDate.setDate(recurrenceDay || 1);
      break;
    }
  }
  
  return nextDate.toISOString().split('T')[0];
};

const getRecurrenceDayOptions = (recurrenceType: RecurrenceType): { value: number; label: string }[] => {
  switch (recurrenceType) {
    case 'weekly':
      return [
        { value: 0, label: '일요일' },
        { value: 1, label: '월요일' },
        { value: 2, label: '화요일' },
        { value: 3, label: '수요일' },
        { value: 4, label: '목요일' },
        { value: 5, label: '금요일' },
        { value: 6, label: '토요일' }
      ];
    case 'monthly':
      return Array.from({ length: 31 }, (_, i) => ({ value: i + 1, label: `${i + 1}일` }));
    case 'yearly':
      return Array.from({ length: 31 }, (_, i) => ({ value: i + 1, label: `${i + 1}일` }));
    default:
      return [];
  }
};

// 로컬 RecurringTemplate 인터페이스 정의
interface LocalRecurringTemplate {
  id: string;
  name: string;
  description: string;
  amount: number;
  category: TransactionCategory;
  type: 'income' | 'expense';
  recurrenceType: RecurrenceType;
  recurrenceDay?: number;
  isActive: boolean;
  nextDueDate: string;
  lastExecuted?: string;
  autoExecute: boolean;
  notificationEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RecurringTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template?: LocalRecurringTemplate;
  onSave?: (data: Partial<RecurringTemplate>) => void;
}

export const RecurringTemplateModal: React.FC<RecurringTemplateModalProps> = (props) => {
  const { isOpen, onClose, template, onSave } = props;
  const context = useContext(AppContext);
  if (!context) throw new Error('RecurringTemplateModal must be used within an AppProvider');
  const { state: { darkMode } } = context;
  const isEditing = !!template;
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    amount: number;
    category: TransactionCategory;
    type: 'income' | 'expense';
    recurrenceType: RecurrenceType;
    recurrenceDay?: number;
    autoExecute: boolean;
    notificationEnabled: boolean;
  }>({
    name: template?.name || '',
    description: template?.description || '',
    amount: template?.amount || 0,
    category: template?.category || EXPENSE_CATEGORIES.RESTAURANT,
    type: template?.type || 'expense',
    recurrenceType: template?.recurrenceType || 'monthly',
    recurrenceDay: template?.recurrenceDay,
    autoExecute: template?.autoExecute || false,
    notificationEnabled: template?.notificationEnabled ?? true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const categoryOptions = [
    ...Object.values(EXPENSE_CATEGORIES),
    ...Object.values(INCOME_CATEGORIES)
  ].map(category => ({
    value: category as string,
    label: `${getCategoryIcon(category as TransactionCategory)} ${getCategoryLabel(category as TransactionCategory)}`
  }));
  const typeOptions = [
    { value: 'income', label: '💰 수입' },
    { value: 'expense', label: '💸 지출' }
  ];
  const recurrenceTypeOptions = [
    { value: 'daily', label: '매일' },
    { value: 'weekly', label: '매주' },
    { value: 'monthly', label: '매월' },
    { value: 'yearly', label: '매년' }
  ];
  const recurrenceDayOptions = getRecurrenceDayOptions(formData.recurrenceType);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = '템플릿 이름을 입력해주세요.';
    if (!formData.amount || formData.amount <= 0) newErrors.amount = '금액을 올바르게 입력해주세요.';
    if (formData.recurrenceType !== 'daily' && !formData.recurrenceDay) newErrors.recurrenceDay = '반복 날짜를 선택해주세요.';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    const nextDueDate = calculateNextDueDate(formData.recurrenceType, formData.recurrenceDay);
    const templateData: Partial<RecurringTemplate> = {
      ...formData,
      isActive: true,
      nextDueDate,
      lastExecuted: template?.lastExecuted,
      recurrenceType: formData.recurrenceType,
      recurrenceDay: formData.recurrenceDay,
      autoExecute: formData.autoExecute,
      notificationEnabled: formData.notificationEnabled,
    };
    if (onSave) await onSave(templateData);
    onClose();
  };
  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      amount: 0,
      category: EXPENSE_CATEGORIES.RESTAURANT,
      type: 'expense',
      recurrenceType: 'monthly',
      recurrenceDay: undefined,
      autoExecute: false,
      notificationEnabled: true,
    });
    setErrors({});
    onClose();
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? '반복 거래 템플릿 수정' : '반복 거래 템플릿 추가'}
    >
      <form onSubmit={handleSubmit}>
        {/* 기본 정보 */}
        <FormField label="템플릿 이름" required error={errors.name} darkMode={darkMode}>
          <Input value={formData.name} onChange={value => setFormData(prev => ({ ...prev, name: value }))} placeholder="예: 월급, 월세, 용돈 등" darkMode={darkMode} />
        </FormField>
        <FormField label="설명" darkMode={darkMode}>
          <Input value={formData.description} onChange={value => setFormData(prev => ({ ...prev, description: value }))} placeholder="상세 설명 (선택사항)" darkMode={darkMode} />
        </FormField>
        {/* 거래 정보 */}
        <FormField label="타입" required darkMode={darkMode}>
          <Select value={formData.type} onChange={value => setFormData(prev => ({ ...prev, type: value as 'income' | 'expense' }))} options={typeOptions} darkMode={darkMode} />
        </FormField>
        <FormField label="카테고리" required darkMode={darkMode}>
          <Select value={formData.category} onChange={value => setFormData(prev => ({ ...prev, category: value as TransactionCategory }))} options={categoryOptions} darkMode={darkMode} />
        </FormField>
        <FormField label="금액" required error={errors.amount} darkMode={darkMode}>
          <Input type="number" value={formData.amount.toString()} onChange={value => setFormData(prev => ({ ...prev, amount: parseInt(value) || 0 }))} placeholder="0" darkMode={darkMode} />
        </FormField>
        {/* 반복 설정 */}
        <FormField label="반복 주기" required darkMode={darkMode}>
          <Select value={formData.recurrenceType} onChange={value => setFormData(prev => ({ ...prev, recurrenceType: value as RecurrenceType, recurrenceDay: undefined }))} options={recurrenceTypeOptions} darkMode={darkMode} />
        </FormField>
        {formData.recurrenceType !== 'daily' && (
          <FormField label={formData.recurrenceType === 'weekly' ? '요일' : '날짜'} required error={errors.recurrenceDay} darkMode={darkMode}>
            <Select value={formData.recurrenceDay?.toString() || ''} onChange={value => setFormData(prev => ({ ...prev, recurrenceDay: parseInt(value) }))} options={[{ value: '', label: '선택해주세요' }, ...recurrenceDayOptions.map((option: { value: number; label: string }) => ({ value: option.value.toString(), label: option.label }))]} darkMode={darkMode} />
          </FormField>
        )}
        {/* 자동화 설정 */}
        <FormField label="자동 실행" darkMode={darkMode}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Toggle enabled={formData.autoExecute} onChange={() => setFormData(prev => ({ ...prev, autoExecute: !prev.autoExecute }))} />
            <span style={{ color: darkMode ? '#d1d5db' : '#6b7280', fontSize: '14px' }}>활성화하면 자동으로 거래가 등록됩니다</span>
          </div>
        </FormField>
        <FormField label="알림" darkMode={darkMode}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Toggle enabled={formData.notificationEnabled} onChange={() => setFormData(prev => ({ ...prev, notificationEnabled: !prev.notificationEnabled }))} />
            <span style={{ color: darkMode ? '#d1d5db' : '#6b7280', fontSize: '14px' }}>반복 거래 알림을 받습니다</span>
          </div>
        </FormField>
        {/* 버튼들 */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
          <Button variant="secondary" onClick={handleClose}>취소</Button>
          <Button variant="primary" type="submit">{isEditing ? '수정' : '추가'}</Button>
        </div>
      </form>
    </Modal>
  );
};
export default RecurringTemplateModal;