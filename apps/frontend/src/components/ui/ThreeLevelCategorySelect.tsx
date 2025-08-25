import React, { useState, useEffect } from 'react';
import type {
  Transaction,
  TransactionCategory
} from '../../types';
import {
  CategoryHierarchy,
  getPrimaryCategoryLabel
} from '../../types';

interface ThreeLevelCategorySelectProps {
  value?: TransactionCategory;
  onChange: (category: TransactionCategory) => void;
  placeholder?: string;
  className?: string;
  error?: string;
  darkMode?: boolean;
}

export const ThreeLevelCategorySelect: React.FC<ThreeLevelCategorySelectProps> = ({
  value,
  onChange,
  className = "",
  error,
  darkMode = false
}) => {
  const [selectedType, setSelectedType] = useState<Transaction['type'] | ''>('');
  const [selectedPrimary, setSelectedPrimary] = useState<string>('');
  const [selectedSecondary, setSelectedSecondary] = useState<TransactionCategory | ''>('');

  // value가 변경될 때 상태 업데이트
  useEffect(() => {
    if (value) {
      // value로부터 type과 primary를 역추적
      let foundType: Transaction['type'] | '' = '';
      let foundPrimary = '';

      // 지출 카테고리에서 검색
      for (const [primaryKey, primaryInfo] of Object.entries(CategoryHierarchy.expense)) {
        for (const [secondaryKey] of Object.entries(primaryInfo.subcategories)) {
          if (secondaryKey === value) {
            foundType = 'expense';
            foundPrimary = primaryKey;
            break;
          }
        }
        if (foundType) break;
      }

      // 수입 카테고리에서 검색
      if (!foundType) {
        for (const [primaryKey, primaryInfo] of Object.entries(CategoryHierarchy.income)) {
          for (const [secondaryKey] of Object.entries(primaryInfo.subcategories)) {
            if (secondaryKey === value) {
              foundType = 'income';
              foundPrimary = primaryKey;
              break;
            }
          }
          if (foundType) break;
        }
      }

      setSelectedType(foundType);
      setSelectedPrimary(foundPrimary);
      setSelectedSecondary(value);
    }
  }, [value]);

  const handleTypeChange = (type: Transaction['type']) => {
    setSelectedType(type);
    setSelectedPrimary('');
    setSelectedSecondary('');
    // onChange는 2차 카테고리가 선택될 때만 호출
  };

  const handlePrimaryChange = (primary: string) => {
    setSelectedPrimary(primary);
    setSelectedSecondary('');
    // onChange는 2차 카테고리가 선택될 때만 호출
  };

  const handleSecondaryChange = (secondary: TransactionCategory) => {
    setSelectedSecondary(secondary);
    onChange(secondary);
  };

  const getPrimaryCategories = () => {
    if (selectedType === 'expense') {
      return Object.keys(CategoryHierarchy.expense);
    } else if (selectedType === 'income') {
      return Object.keys(CategoryHierarchy.income);
    }
    return [];
  };

  const getSecondaryCategories = () => {
    if (!selectedType || !selectedPrimary) return {};
    
    if (selectedType === 'expense') {
      const primary = selectedPrimary as keyof typeof CategoryHierarchy.expense;
      return CategoryHierarchy.expense[primary]?.subcategories || {};
    } else if (selectedType === 'income') {
      const primary = selectedPrimary as keyof typeof CategoryHierarchy.income;
      return CategoryHierarchy.income[primary]?.subcategories || {};
    }
    
    return {};
  };

  const baseSelectStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: `2px solid ${error ? '#ef4444' : (darkMode ? '#374151' : '#d1d5db')}`,
    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
    color: darkMode ? '#f9fafb' : '#1f2937',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s ease',
    appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: 'right 12px center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '16px',
    paddingRight: '48px'
  };

  const focusStyle = {
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* 1단계: 수입/지출 선택 */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
          거래 유형
        </label>
        <select
          value={selectedType}
          onChange={(e) => handleTypeChange(e.target.value as Transaction['type'])}
          style={baseSelectStyle}
          onFocus={(e) => Object.assign(e.target.style, focusStyle)}
          onBlur={(e) => Object.assign(e.target.style, { borderColor: error ? '#ef4444' : (darkMode ? '#374151' : '#d1d5db'), boxShadow: 'none' })}
        >
          <option value="">거래 유형을 선택하세요</option>
          <option value="expense">지출</option>
          <option value="income">수입</option>
        </select>
      </div>

      {/* 2단계: 1차 카테고리 선택 */}
      {selectedType && (
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            카테고리
          </label>
          <select
            value={selectedPrimary}
            onChange={(e) => handlePrimaryChange(e.target.value)}
            style={baseSelectStyle}
            onFocus={(e) => Object.assign(e.target.style, focusStyle)}
            onBlur={(e) => Object.assign(e.target.style, { borderColor: error ? '#ef4444' : (darkMode ? '#374151' : '#d1d5db'), boxShadow: 'none' })}
          >
            <option value="">카테고리를 선택하세요</option>
            {getPrimaryCategories().map((primary) => (
              <option key={primary} value={primary}>
                {getPrimaryCategoryLabel(selectedType, primary)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 3단계: 2차 카테고리 선택 */}
      {selectedType && selectedPrimary && (
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            세부 카테고리
          </label>
          <select
            value={selectedSecondary}
            onChange={(e) => handleSecondaryChange(e.target.value as TransactionCategory)}
            style={baseSelectStyle}
            onFocus={(e) => Object.assign(e.target.style, focusStyle)}
            onBlur={(e) => Object.assign(e.target.style, { borderColor: error ? '#ef4444' : (darkMode ? '#374151' : '#d1d5db'), boxShadow: 'none' })}
          >
            <option value="">세부 카테고리를 선택하세요</option>
            {Object.entries(getSecondaryCategories()).map(([key, label]) => (
              <option key={key} value={key}>
                {label as string}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};