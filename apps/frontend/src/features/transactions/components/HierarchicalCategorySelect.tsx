/**
 * 계층적 카테고리 선택 컴포넌트
 * 
 * 주요 기능:
 * - 거래 유형(수입/지출) 선택
 * - 선택된 거래 유형에 따른 카테고리 목록 표시
 * - 카테고리 선택 시 부모 컴포넌트에 선택된 카테고리 전달
 */
import React, { useState } from 'react';
import { 
  type TransactionCategory, 
  type TransactionType,
  getCategoryLabel,
  getCategoryIcon,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES
} from '../../../index';

// 카테고리 옵션 인터페이스
interface CategoryOption {
  value: string;
  label: string;
  icon: string;
}

// 컴포넌트 props 인터페이스
interface HierarchicalCategorySelectProps {
  value?: TransactionCategory;
  onChange: (category: TransactionCategory) => void;
  transactionType?: TransactionType;
  className?: string;
  placeholder?: string;
  darkMode?: boolean;
}

/**
 * 계층적 카테고리 선택 컴포넌트
 * @param param0 컴포넌트 props
 * @returns JSX.Element
 */
const HierarchicalCategorySelect: React.FC<HierarchicalCategorySelectProps> = ({
  value,
  onChange,
  transactionType,
  className = '',
  placeholder = '카테고리를 선택하세요',
  darkMode = false
}) => {
  const [selectedType, setSelectedType] = useState<TransactionType | ''>('');
  const [isOpen, setIsOpen] = useState(false);
  
  // 현재 타입에 따른 카테고리 목록 생성
  const getCategories = (): CategoryOption[] => {
    if (selectedType === 'expense') {
      return Object.values(EXPENSE_CATEGORIES).map(category => ({
        value: category,
        label: getCategoryLabel(category as TransactionCategory),
        icon: getCategoryIcon(category as TransactionCategory)
      }));
    } else if (selectedType === 'income') {
      return Object.values(INCOME_CATEGORIES).map(category => ({
        value: category,
        label: getCategoryLabel(category as TransactionCategory),
        icon: getCategoryIcon(category as TransactionCategory)
      }));
    }
    return [];
  };

  // value가 변경되면 선택된 카테고리의 타입 설정
  React.useEffect(() => {
    if (value) {
      // 선택된 카테고리의 타입 결정
      const isExpenseCategory = Object.values(EXPENSE_CATEGORIES).some(cat => cat === value);
      const isIncomeCategory = Object.values(INCOME_CATEGORIES).some(cat => cat === value);
      
      if (isExpenseCategory) {
        setSelectedType('expense');
      } else if (isIncomeCategory) {
        setSelectedType('income');
      }
    }
  }, [value]);

  // props로 transactionType이 전달된 경우 자동 설정
  React.useEffect(() => {
    if (transactionType) {
      setSelectedType(transactionType);
    }
  }, [transactionType]);
  
  const handleCategorySelect = (category: TransactionCategory) => {
    onChange(category);
    setIsOpen(false);
  };
  
  const categories = getCategories();
  
  return (
    <div className={`relative ${darkMode ? 'text-white' : 'text-gray-900'} ${className}`}>
      {/* Transaction Type Selection */}
      {!transactionType && (
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">
            거래 유형
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSelectedType('expense')}
              className={`px-4 py-2 rounded-md border ${
                selectedType === 'expense'
                  ? 'bg-red-100 border-red-500 text-red-700'
                  : darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-300'
                    : 'bg-gray-100 border-gray-300 text-gray-700'
              }`}
            >
              💸 지출
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('income')}
              className={`px-4 py-2 rounded-md border ${
                selectedType === 'income'
                  ? 'bg-green-100 border-green-500 text-green-700'
                  : darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-300'
                    : 'bg-gray-100 border-gray-300 text-gray-700'
              }`}
            >
              💰 수입
            </button>
          </div>
        </div>
      )}

      {/* Category Selection */}
      {selectedType && (
        <div>
          <label className="block mb-2 text-sm font-medium">
            카테고리
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className={`w-full px-4 py-2 text-left border rounded-md ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              {value ? (
                <span className="flex items-center">
                  <span className="mr-2">{getCategoryIcon(value)}</span>
                  {getCategoryLabel(value)}
                </span>
              ) : (
                <span className="text-gray-500">{placeholder}</span>
              )}
              <span className="absolute transform -translate-y-1/2 right-3 top-1/2">
                {isOpen ? '▲' : '▼'}
              </span>
            </button>

            {isOpen && (
              <div className={`absolute z-10 w-full mt-1 max-h-60 overflow-auto border rounded-md shadow-lg ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600'
                  : 'bg-white border-gray-300'
              }`}>
                {categories.map((category) => (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => handleCategorySelect(category.value as TransactionCategory)}
                    className={`w-full px-4 py-2 text-left hover:bg-blue-100 focus:outline-none focus:bg-blue-100 ${
                      darkMode ? 'hover:bg-gray-600 focus:bg-gray-600' : ''
                    } ${value === category.value ? 'bg-blue-100' : ''}`}
                  >
                    <span className="flex items-center">
                      <span className="mr-2">{category.icon}</span>
                      {category.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HierarchicalCategorySelect;