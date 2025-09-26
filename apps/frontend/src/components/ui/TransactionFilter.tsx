import React, { useState } from 'react';
import { Card, Input, Select, DatePicker, Button, HierarchicalCategorySelect } from '../ui';
import { RangeSlider } from '../ui/RangeSlider';
import { colors } from '../../styles/theme';
import type { TransactionCategory } from '../../types';

interface FilterOptions {
  searchText: string;
  dateFrom: string;
  dateTo: string;
  category: TransactionCategory | '';
  type: 'all' | 'income' | 'expense';
  amountRange: [number, number];
  merchant: string;
}

interface TransactionFilterProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onReset: () => void;
  darkMode?: boolean;
  minAmount: number;
  maxAmount: number;
}

export const TransactionFilter: React.FC<TransactionFilterProps> = ({
  filters,
  onFiltersChange,
  onReset,
  darkMode = false,
  minAmount,
  maxAmount
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleFilterChange = <K extends keyof FilterOptions>(key: K, value: FilterOptions[K]) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  const typeOptions = [
    { value: 'all', label: '전체' },
    { value: 'income', label: '수입' },
    { value: 'expense', label: '지출' }
  ];

  const hasActiveFilters = 
    filters.searchText || 
    filters.dateFrom || 
    filters.dateTo || 
    filters.category || 
    filters.type !== 'all' || 
    filters.amountRange[0] !== minAmount || 
    filters.amountRange[1] !== maxAmount ||
    filters.merchant;

  return (
    <Card style={{ 
      marginBottom: '24px',
      backgroundColor: darkMode ? colors.dark[800] : '#ffffff',
      border: `2px solid ${darkMode ? colors.dark[600] : colors.gray[200]}`
    }}>
      {/* 필터 헤더 */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '16px 24px',
          borderBottom: isExpanded ? `1px solid ${darkMode ? colors.dark[600] : colors.gray[200]}` : 'none',
          cursor: 'pointer'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: darkMode ? colors.dark[100] : colors.gray[900],
            margin: 0,
            fontFamily: "'Noto Sans KR', sans-serif"
          }}>
            🔍 필터
          </h3>
          {hasActiveFilters && (
            <span style={{
              fontSize: '12px',
              color: '#ffffff',
              backgroundColor: colors.primary[500],
              padding: '2px 8px',
              borderRadius: '12px',
              fontFamily: "'Noto Sans KR', sans-serif"
            }}>
              활성
            </span>
          )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {hasActiveFilters && (
            <Button 
              variant="secondary" 
              onClick={() => {
                onReset();
              }}
              style={{ 
                fontSize: '12px', 
                padding: '6px 12px',
                fontFamily: "'Noto Sans KR', sans-serif"
              }}
            >
              초기화
            </Button>
          )}
          <span style={{
            color: darkMode ? colors.dark[300] : colors.gray[500],
            transition: 'transform 0.2s ease',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
          }}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </span>
        </div>
      </div>

      {/* 필터 옵션들 */}
      {isExpanded && (
        <div style={{ padding: '24px' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '20px',
            marginBottom: '20px'
          }}>
            {/* 검색어 */}
            <div>
              <Input
                type="text"
                label="검색어"
                placeholder="거래 내용을 검색하세요"
                value={filters.searchText}
                onChange={(value) => handleFilterChange('searchText', value)}
                darkMode={darkMode}
                icon="🔍"
                iconPosition="left"
              />
            </div>

            {/* 거래 유형 */}
            <div>
              <Select
                label="거래 유형"
                value={filters.type}
                onChange={(value) => handleFilterChange('type', value as 'all' | 'income' | 'expense')}
                options={typeOptions}
                darkMode={darkMode}
              />
            </div>

            {/* 가맹점 */}
            <div>
              <Input
                type="text"
                label="가맹점"
                placeholder="가맹점명을 입력하세요"
                value={filters.merchant}
                onChange={(value) => handleFilterChange('merchant', value)}
                darkMode={darkMode}
                icon="🏪"
                iconPosition="left"
              />
            </div>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '20px',
            marginBottom: '20px'
          }}>
            {/* 시작 날짜 */}
            <div>
              <DatePicker
                label="시작 날짜"
                value={filters.dateFrom}
                onChange={(value) => handleFilterChange('dateFrom', value)}
                darkMode={darkMode}
              />
            </div>

            {/* 종료 날짜 */}
            <div>
              <DatePicker
                label="종료 날짜"
                value={filters.dateTo}
                onChange={(value) => handleFilterChange('dateTo', value)}
                darkMode={darkMode}
              />
            </div>
          </div>

          {/* 카테고리 */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: darkMode ? colors.dark[100] : colors.gray[900],
              fontFamily: "'Noto Sans KR', sans-serif"
            }}>
              카테고리
            </label>
            <HierarchicalCategorySelect
              value={filters.category || undefined}
              onChange={(category) => handleFilterChange('category', category)}
              placeholder="카테고리를 선택하세요 (선택사항)"
              darkMode={darkMode}
            />
          </div>

          {/* 금액 범위 */}
          <div>
            <RangeSlider
              label="금액 범위"
              min={minAmount}
              max={maxAmount}
              value={filters.amountRange}
              onChange={(value) => handleFilterChange('amountRange', value)}
              formatValue={formatCurrency}
              darkMode={darkMode}
            />
          </div>
        </div>
      )}
    </Card>
  );
};