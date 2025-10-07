/**
 * 거래 내역 내보내기 모달 컴포넌트
 * 
 * 주요 기능:
 * - 전체 거래 내역, 필터된 거래 내역, 월별 리포트, 연간 리포트 내보내기 지원
 * - 거래 타입, 카테고리, 날짜 범위 등 다양한 필터 옵션 제공
 * - CSV 파일로 내보내기 기능 구현
 */
import React, { useState, useContext } from 'react';
import { Modal, Button, FormField, Select } from '../../../index';
import { AppContext } from '../../../index';
import { type TransactionCategory, ExpenseSecondaryCategory, IncomeSecondaryCategory, getCategoryLabel, getCategoryIcon } from '../../../index';
import { exportToCSV, downloadCSV, generateMonthlyReport, generateYearlyReport, type ExportOptions } from '../../../shared/utils/exportUtils';

// ExportModal 컴포넌트의 Props 인터페이스
interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 내보내기 모달 컴포넌트
 * @param param0 - 내보내기 모달 컴포넌트의 Props
 * @returns 내보내기 모달 컴포넌트
 */
export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose
}) => {
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error('ExportModal must be used within an AppProvider');
  }

  const { state: { transactions, darkMode } } = context;

  const [exportType, setExportType] = useState<'all' | 'filtered' | 'monthly' | 'yearly'>('all');
  const [filterOptions, setFilterOptions] = useState<ExportOptions>({
    type: 'all',
    categories: [],
    dateRange: undefined
  });
  const [reportDate, setReportDate] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  });

  const categoryOptions = [
    ...Object.values(ExpenseSecondaryCategory),
    ...Object.values(IncomeSecondaryCategory)
  ].map(category => ({
    value: category as string,
    label: `${getCategoryIcon(category as TransactionCategory)} ${getCategoryLabel(category as TransactionCategory)}`
  }));

  const typeOptions = [
    { value: 'all', label: '전체' },
    { value: 'income', label: '수입' },
    { value: 'expense', label: '지출' }
  ];

  const handleExport = () => {
    const now = new Date();
    let filename = '';
    let csvContent = '';

    switch (exportType) {
      case 'all':
        csvContent = exportToCSV(transactions);
        filename = `거래내역_전체_${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}.csv`;
        break;

      case 'filtered':
        csvContent = exportToCSV(transactions, filterOptions);
        filename = `거래내역_필터_${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}.csv`;
        break;

      case 'monthly': {
        const monthlyReport = generateMonthlyReport(transactions, reportDate.year, reportDate.month);
        
        // 월별 리포트 CSV 생성
        const monthlyHeaders = ['구분', '금액'];
        const monthlyData = [
          ['총 수입', monthlyReport.totalIncome.toLocaleString()],
          ['총 지출', monthlyReport.totalExpense.toLocaleString()],
          ['잔액', monthlyReport.balance.toLocaleString()],
          ['', ''], // 빈 줄
          ['카테고리별 지출', ''],
          ...Object.entries(monthlyReport.categoryExpenses).map(([category, amount]) => [
            getCategoryLabel(category as TransactionCategory),
            amount.toLocaleString()
          ]),
          ['', ''], // 빈 줄
          ['거래 내역', ''],
          ['날짜', '타입', '카테고리', '설명', '금액'],
          ...monthlyReport.transactions.map(t => [
            new Date(t.date).toLocaleDateString('ko-KR'),
            (t.transaction_type === 'income' ? '수입' : '지출'),
            getCategoryLabel(t.category),
            t.description,
            t.amount.toLocaleString()
          ])
        ];

        csvContent = '\uFEFF' + [
          monthlyHeaders.join(','),
          ...monthlyData.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
        
        filename = `월별리포트_${reportDate.year}년${reportDate.month}월.csv`;
        break;
      }

      case 'yearly': {
        const yearlyReport = generateYearlyReport(transactions, reportDate.year);
        
        // 연별 리포트 CSV 생성
        const yearlyHeaders = ['구분', '금액'];
        const yearlyData = [
          [`${reportDate.year}년 연간 리포트`, ''],
          ['총 수입', yearlyReport.totalIncome.toLocaleString()],
          ['총 지출', yearlyReport.totalExpense.toLocaleString()],
          ['잔액', yearlyReport.balance.toLocaleString()],
          ['', ''], // 빈 줄
          ['월별 요약', ''],
          ['월', '수입', '지출', '잔액'],
          ...yearlyReport.monthlyData.map(data => [
            `${data.month}월`,
            data.income.toLocaleString(),
            data.expense.toLocaleString(),
            data.balance.toLocaleString()
          ])
        ];

        csvContent = '\uFEFF' + [
          yearlyHeaders.join(','),
          ...yearlyData.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
        
        filename = `연간리포트_${reportDate.year}년.csv`;
        break;
      }
    }

    downloadCSV(csvContent, filename);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="거래 내역 내보내기"
    >
      <form onSubmit={(e) => { e.preventDefault(); handleExport(); }}>
        {/* 내보내기 타입 선택 */}
        <FormField
          label="내보내기 타입"
          required
          darkMode={darkMode}
        >
          <Select
            value={exportType}
            onChange={(value) => setExportType(value as typeof exportType)}
            options={[
              { value: 'all', label: '전체 거래 내역' },
              { value: 'filtered', label: '필터된 거래 내역' },
              { value: 'monthly', label: '월별 리포트' },
              { value: 'yearly', label: '연간 리포트' }
            ]}
            darkMode={darkMode}
          />
        </FormField>

        {/* 필터 옵션 (필터된 거래 내역 선택 시) */}
        {exportType === 'filtered' && (
          <>
            <FormField
              label="거래 타입"
              darkMode={darkMode}
            >
              <Select
                value={filterOptions.type || 'all'}
                onChange={(value) => setFilterOptions(prev => ({ ...prev, type: value as 'all' | 'income' | 'expense' }))}
                options={typeOptions}
                darkMode={darkMode}
              />
            </FormField>

            <FormField
              label="카테고리 (복수 선택 가능)"
              darkMode={darkMode}
            >
              <Select
                value={filterOptions.categories?.[0] || ''}
                onChange={(value) => {
                  if (value) {
                    const newCategories = filterOptions.categories?.includes(value)
                      ? filterOptions.categories.filter(c => c !== value)
                      : [...(filterOptions.categories || []), value];
                    setFilterOptions(prev => ({ ...prev, categories: newCategories }));
                  }
                }}
                options={[
                  { value: '', label: '전체 카테고리' },
                  ...categoryOptions
                ]}
                darkMode={darkMode}
              />
            </FormField>

            {filterOptions.categories && filterOptions.categories.length > 0 && (
              <div style={{ 
                display: 'flex', 
                gap: '8px', 
                flexWrap: 'wrap',
                marginTop: '8px' 
              }}>
                {filterOptions.categories.map(category => (
                  <span
                    key={category}
                    style={{
                      backgroundColor: darkMode ? '#374151' : '#f3f4f6',
                      color: darkMode ? '#f9fafb' : '#374151',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      const newCategories = filterOptions.categories?.filter(c => c !== category) || [];
                      setFilterOptions(prev => ({ ...prev, categories: newCategories }));
                    }}
                  >
                    {getCategoryLabel(category as TransactionCategory)} ✕
                  </span>
                ))}
              </div>
            )}
          </>
        )}

        {/* 리포트 날짜 선택 (월별/연간 리포트 선택 시) */}
        {(exportType === 'monthly' || exportType === 'yearly') && (
          <>
            <FormField
              label="연도"
              darkMode={darkMode}
            >
              <Select
                value={reportDate.year.toString()}
                onChange={(value) => setReportDate(prev => ({ ...prev, year: parseInt(value) }))}
                options={Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return { value: year.toString(), label: `${year}년` };
                })}
                darkMode={darkMode}
              />
            </FormField>

            {exportType === 'monthly' && (
              <FormField
                label="월"
                darkMode={darkMode}
              >
                <Select
                  value={reportDate.month.toString()}
                  onChange={(value) => setReportDate(prev => ({ ...prev, month: parseInt(value) }))}
                  options={Array.from({ length: 12 }, (_, i) => ({
                    value: (i + 1).toString(),
                    label: `${i + 1}월`
                  }))}
                  darkMode={darkMode}
                />
              </FormField>
            )}
          </>
        )}

        {/* 버튼들 */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          justifyContent: 'flex-end',
          marginTop: '24px'
        }}>
          <Button
            variant="secondary"
            onClick={onClose}
          >
            취소
          </Button>
          <Button
            variant="primary"
            type="submit"
          >
            내보내기
          </Button>
        </div>
      </form>
    </Modal>
  );
};