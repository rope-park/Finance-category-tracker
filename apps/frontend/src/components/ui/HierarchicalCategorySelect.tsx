import React, { useState } from 'react';
import { 
  type TransactionCategory, 
  type TransactionType,
  type ExpensePrimaryCategory,
  type IncomePrimaryCategory,
  CategoryHierarchy,
  ExpensePrimaryCategory as ExpensePrimaryCategoryEnum,
  IncomePrimaryCategory as IncomePrimaryCategoryEnum,
  getCategoryLabel,
  getCategoryIcon,
  getPrimaryCategoryLabel
} from '../../types';
import { colors } from '../../styles/theme';

type PrimaryCategory = ExpensePrimaryCategory | IncomePrimaryCategory;

interface CategoryOption {
  value: string;
  label: string;
  icon: string;
}

interface HierarchicalCategorySelectProps {
  value?: TransactionCategory;
  onChange: (category: TransactionCategory) => void;
  className?: string;
  placeholder?: string;
  darkMode?: boolean;
}

export const HierarchicalCategorySelect: React.FC<HierarchicalCategorySelectProps> = ({
  value,
  onChange,
  className = '',
  placeholder = '카테고리를 선택하세요',
  darkMode = false
}) => {
  const [selectedType, setSelectedType] = useState<TransactionType | ''>('');
  const [selectedPrimary, setSelectedPrimary] = useState<PrimaryCategory | ''>('');
  const [isOpen, setIsOpen] = useState(false);
  
  // 현재 타입에 따른 1차 카테고리 목록 생성
  const getMainCategories = (): CategoryOption[] => {
    if (selectedType === 'expense') {
      return Object.entries(ExpensePrimaryCategoryEnum).map(([, value]) => ({
        value,
        label: CategoryHierarchy.expense[value]?.label || value,
        icon: CategoryHierarchy.expense[value]?.icon || '📋'
      }));
    } else if (selectedType === 'income') {
      return Object.entries(IncomePrimaryCategoryEnum).map(([, value]) => ({
        value,
        label: CategoryHierarchy.income[value]?.label || value,
        icon: CategoryHierarchy.income[value]?.icon || '💰'
      }));
    }
    return [];
  };

  // 선택된 1차 카테고리에 따른 2차 카테고리 목록 생성
  const getSubCategories = (primaryCategory: PrimaryCategory): CategoryOption[] => {
    if (selectedType === 'expense' && CategoryHierarchy.expense[primaryCategory as ExpensePrimaryCategory]) {
      const subcategories = CategoryHierarchy.expense[primaryCategory as ExpensePrimaryCategory].subcategories;
      return Object.entries(subcategories).map(([key, label]) => ({
        value: key,
        label: label as string,
        icon: getCategoryIcon(key as TransactionCategory)
      }));
    } else if (selectedType === 'income' && CategoryHierarchy.income[primaryCategory as IncomePrimaryCategory]) {
      const subcategories = CategoryHierarchy.income[primaryCategory as IncomePrimaryCategory].subcategories;
      return Object.entries(subcategories).map(([key, label]) => ({
        value: key,
        label: label as string,
        icon: getCategoryIcon(key as TransactionCategory)
      }));
    }
    return [];
  };

  React.useEffect(() => {
    if (value) {
      // 선택된 카테고리의 타입과 1차 카테고리 찾기
      let foundType: TransactionType | '' = '';
      let foundPrimary: PrimaryCategory | '' = '';

      // 지출 카테고리에서 검색
      for (const [primaryKey, primaryInfo] of Object.entries(CategoryHierarchy.expense)) {
        if (Object.keys(primaryInfo.subcategories).includes(value)) {
          foundType = 'expense';
          foundPrimary = primaryKey as ExpensePrimaryCategory;
          break;
        }
      }

      // 수입 카테고리에서 검색
      if (!foundType) {
        for (const [primaryKey, primaryInfo] of Object.entries(CategoryHierarchy.income)) {
          if (Object.keys(primaryInfo.subcategories).includes(value)) {
            foundType = 'income';
            foundPrimary = primaryKey as IncomePrimaryCategory;
            break;
          }
        }
      }

      setSelectedType(foundType);
      setSelectedPrimary(foundPrimary);
    }
  }, [value]);
  
  const handleTypeSelect = (type: TransactionType) => {
    setSelectedType(type);
    setSelectedPrimary('');
  };

  const handlePrimarySelect = (primary: PrimaryCategory) => {
    setSelectedPrimary(primary);
  };
  
  const handleSubCategorySelect = (category: TransactionCategory) => {
    onChange(category);
    setIsOpen(false);
  };
  
  const getSelectedLabel = () => {
    if (!value) return placeholder;
    
    // 카테고리 라벨 조합 생성
    const categoryLabel = getCategoryLabel(value);
    const primaryLabel = selectedPrimary && selectedType ? getPrimaryCategoryLabel(selectedType, selectedPrimary) : '';
    
    if (primaryLabel) {
      return `${primaryLabel} > ${categoryLabel}`;
    }
    
    return categoryLabel;
  };
  
  const mainCategories = getMainCategories();

  // 스타일 정의
  const containerStyle = {
    position: 'relative' as const,
  };

  const triggerButtonStyle = {
    width: '100%',
    padding: '10px 14px',
    textAlign: 'left' as const,
    backgroundColor: darkMode ? colors.dark[700] : '#ffffff',
    border: `2px solid ${isOpen 
      ? colors.primary[500] 
      : darkMode ? colors.dark[600] : colors.gray[200]}`,
    borderRadius: '12px',
    boxShadow: isOpen ? `0 0 0 4px ${colors.primary[100]}` : 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    fontSize: '14px',
    color: darkMode ? colors.dark[100] : colors.gray[900],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: '40px',
    outline: 'none',
    fontFamily: "'Noto Sans KR', sans-serif",
    transform: isOpen ? 'translateY(-1px)' : 'translateY(0)',
  };

  const dropdownStyle = {
    position: 'absolute' as const,
    top: '100%',
    left: 0,
    right: 0,
    marginTop: '4px',
    backgroundColor: darkMode ? colors.dark[700] : '#ffffff',
    border: `2px solid ${darkMode ? colors.dark[600] : colors.gray[200]}`,
    borderRadius: '12px',
    boxShadow: darkMode 
      ? '0 10px 25px rgba(0, 0, 0, 0.4)' 
      : '0 10px 25px rgba(0, 0, 0, 0.1)',
    zIndex: 50,
    overflow: 'hidden',
    maxHeight: '400px',
    animation: 'fadeIn 0.2s ease-in-out',
  };

  const columnHeaderStyle = {
    padding: '12px 16px',
    backgroundColor: darkMode ? colors.dark[600] : colors.gray[50],
    borderBottom: `1px solid ${darkMode ? colors.dark[600] : colors.gray[200]}`,
    fontSize: '12px',
    fontWeight: '700',
    color: darkMode ? colors.dark[200] : colors.gray[600],
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    fontFamily: "'Noto Sans KR', sans-serif",
  };

  const optionButtonStyle = {
    width: '100%',
    padding: '12px 16px',
    textAlign: 'left' as const,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.15s ease-in-out',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderBottom: `1px solid ${darkMode ? colors.dark[600] : colors.gray[100]}`,
    fontFamily: "'Noto Sans KR', sans-serif",
  };

  const getTypeButtonStyle = (type: 'expense' | 'income', isSelected: boolean) => ({
    ...optionButtonStyle,
    color: darkMode ? colors.dark[200] : colors.gray[700],
    backgroundColor: isSelected 
      ? (type === 'expense' 
          ? (darkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)') 
          : (darkMode ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)'))
      : 'transparent',
  });

  const getPrimaryButtonStyle = (isSelected: boolean) => ({
    ...optionButtonStyle,
    color: darkMode ? colors.dark[200] : colors.gray[700],
    backgroundColor: isSelected 
      ? (darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)')
      : 'transparent',
  });

  const getSecondaryButtonStyle = (isSelected: boolean) => ({
    ...optionButtonStyle,
    color: darkMode ? colors.dark[200] : colors.gray[700],
    backgroundColor: isSelected 
      ? (darkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)')
      : 'transparent',
  });

  const emptyStateStyle = {
    padding: '16px',
    textAlign: 'center' as const,
    color: darkMode ? colors.dark[400] : colors.gray[500],
    fontSize: '14px',
    fontStyle: 'italic' as const,
  };

  const backdropStyle = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 40,
  };
  
  return (
    <div style={containerStyle} className={className}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={triggerButtonStyle}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = darkMode ? colors.dark[500] : colors.gray[300];
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = darkMode ? colors.dark[600] : colors.gray[200];
          }
        }}
      >
        <span style={{ 
          display: 'block', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap',
          flex: 1
        }}>
          {getSelectedLabel()}
        </span>
        <span style={{ 
          marginLeft: '8px',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease-in-out',
          color: darkMode ? colors.gray[400] : colors.gray[500]
        }}>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </span>
      </button>
      
      {isOpen && (
        <>
          <div style={dropdownStyle}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              minHeight: '300px',
            }}>
              {/* 거래 타입 컬럼 */}
              <div style={{ borderRight: `1px solid ${darkMode ? colors.dark[600] : colors.gray[200]}` }}>
                <div style={columnHeaderStyle}>
                  💰 거래 타입
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => handleTypeSelect('expense')}
                    style={getTypeButtonStyle('expense', selectedType === 'expense')}
                    onMouseEnter={(e) => {
                      if (selectedType !== 'expense') {
                        e.currentTarget.style.backgroundColor = darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedType !== 'expense') {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>💸</span>
                    <span>지출</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeSelect('income')}
                    style={getTypeButtonStyle('income', selectedType === 'income')}
                    onMouseEnter={(e) => {
                      if (selectedType !== 'income') {
                        e.currentTarget.style.backgroundColor = darkMode ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedType !== 'income') {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>💰</span>
                    <span>수입</span>
                  </button>
                </div>
              </div>
              
              {/* 1차 카테고리 컬럼 */}
              <div style={{ borderRight: `1px solid ${darkMode ? colors.dark[600] : colors.gray[200]}` }}>
                <div style={columnHeaderStyle}>
                  📂 1차 카테고리
                </div>
                <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                  {selectedType ? (
                    mainCategories.map((category) => (
                      <button
                        key={category.value}
                        type="button"
                        onClick={() => handlePrimarySelect(category.value as PrimaryCategory)}
                        style={getPrimaryButtonStyle(selectedPrimary === category.value)}
                        onMouseEnter={(e) => {
                          if (selectedPrimary !== category.value) {
                            e.currentTarget.style.backgroundColor = darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedPrimary !== category.value) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        <span style={{ fontSize: '16px' }}>{category.icon}</span>
                        <span>{category.label}</span>
                      </button>
                    ))
                  ) : (
                    <div style={emptyStateStyle}>
                      먼저 거래 타입을 선택하세요
                    </div>
                  )}
                </div>
              </div>
              
              {/* 2차 카테고리 컬럼 */}
              <div>
                <div style={columnHeaderStyle}>
                  🏷️ 2차 카테고리
                </div>
                <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                  {selectedType && selectedPrimary ? (
                    getSubCategories(selectedPrimary).map((subcategory) => (
                      <button
                        key={subcategory.value}
                        type="button"
                        onClick={() => handleSubCategorySelect(subcategory.value as TransactionCategory)}
                        style={getSecondaryButtonStyle(value === subcategory.value)}
                        onMouseEnter={(e) => {
                          if (value !== subcategory.value) {
                            e.currentTarget.style.backgroundColor = darkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (value !== subcategory.value) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        <span style={{ fontSize: '16px' }}>{subcategory.icon}</span>
                        <span>{subcategory.label}</span>
                      </button>
                    ))
                  ) : (
                    <div style={emptyStateStyle}>
                      먼저 1차 카테고리를 선택하세요
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div
            style={backdropStyle}
            onClick={() => setIsOpen(false)}
          />
        </>
      )}
    </div>
  );
};