import React, { useState, useMemo, useContext } from 'react';
import {
  Card,
  PageLayout, 
  Button
} from '../ui';
import { TransactionModal, ExportModal } from '../modals';
import { AppContext } from '../../context/AppContext';
import type { Transaction } from '../../types';
import { formatCurrency, formatDate, getCategoryName } from '../../utils';
import { colors } from '../../styles/theme';

export const TransactionsPage: React.FC = () => {
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error('TransactionsPage must be used within an AppProvider');
  }
  
  const { 
    state: { transactions, darkMode }, 
    deleteTransaction 
  } = context;
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  
  // 검색 및 필터 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  
  // 고급 검색 상태
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [merchantFilter, setMerchantFilter] = useState('');

  // 필터링된 거래 내역
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(transaction => {
        const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            transaction.merchant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            getCategoryName(transaction.category).toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = !categoryFilter || transaction.category === categoryFilter;
        const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
        
        // 고급 검색 필터
        const matchesAmountRange = (!amountRange.min || transaction.amount >= parseFloat(amountRange.min)) &&
                                 (!amountRange.max || transaction.amount <= parseFloat(amountRange.max));
        
        const matchesDateRange = (!dateRange.start || new Date(transaction.date) >= new Date(dateRange.start)) &&
                               (!dateRange.end || new Date(transaction.date) <= new Date(dateRange.end));
        
        const matchesMerchant = !merchantFilter || 
                              (transaction.merchant && transaction.merchant.toLowerCase().includes(merchantFilter.toLowerCase()));

        return matchesSearch && matchesCategory && matchesType && matchesAmountRange && matchesDateRange && matchesMerchant;
      })
      .sort((a, b) => {
        if (sortBy === 'date') {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        } else {
          return b.amount - a.amount;
        }
      });
  }, [transactions, searchTerm, categoryFilter, typeFilter, sortBy, amountRange, dateRange, merchantFilter]);

  // 카테고리 목록 생성
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(transactions.map(t => t.category)));
    return uniqueCategories.sort();
  }, [transactions]);

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('이 거래 내역을 삭제하시겠습니까?')) {
      deleteTransaction(id);
    }
  };

  const clearAdvancedFilters = () => {
    setAmountRange({ min: '', max: '' });
    setDateRange({ start: '', end: '' });
    setMerchantFilter('');
    setSearchTerm('');
    setCategoryFilter('');
    setTypeFilter('all');
  };

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

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
          거래 내역
        </h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="secondary" onClick={() => setShowExportModal(true)}>
            📊 내보내기
          </Button>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            거래 추가
          </Button>
        </div>
      </div>

      {/* 요약 통계 */}
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
            총 수입
          </div>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            color: colors.success[600],
            fontFamily: "'Noto Sans KR', sans-serif"
          }}>
            {formatCurrency(totalIncome)}
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
            {formatCurrency(totalExpense)}
          </div>
        </Card>
        
        <Card style={{ padding: '20px' }}>
          <div style={{ 
            fontSize: '14px', 
            color: darkMode ? colors.dark[400] : colors.gray[600],
            marginBottom: '8px',
            fontFamily: "'Noto Sans KR', sans-serif"
          }}>
            순 손익
          </div>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            color: totalIncome - totalExpense >= 0 ? colors.success[600] : colors.error[600],
            fontFamily: "'Noto Sans KR', sans-serif"
          }}>
            {formatCurrency(totalIncome - totalExpense)}
          </div>
        </Card>
      </div>

      {/* 검색 및 필터 */}
      <Card style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 기본 검색 */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="거래 내역 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '10px 12px',
                backgroundColor: darkMode ? colors.dark[700] : 'white',
                color: darkMode ? colors.dark[100] : colors.gray[900],
                border: `1px solid ${darkMode ? colors.dark[600] : colors.gray[300]}`,
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: "'Noto Sans KR', sans-serif"
              }}
            />

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                padding: '10px 12px',
                backgroundColor: darkMode ? colors.dark[700] : 'white',
                color: darkMode ? colors.dark[100] : colors.gray[900],
                border: `1px solid ${darkMode ? colors.dark[600] : colors.gray[300]}`,
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: "'Noto Sans KR', sans-serif"
              }}
            >
              <option value="">모든 카테고리</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {getCategoryName(category)}
                </option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'all' | 'income' | 'expense')}
              style={{
                padding: '10px 12px',
                backgroundColor: darkMode ? colors.dark[700] : 'white',
                color: darkMode ? colors.dark[100] : colors.gray[900],
                border: `1px solid ${darkMode ? colors.dark[600] : colors.gray[300]}`,
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: "'Noto Sans KR', sans-serif"
              }}
            >
              <option value="all">수입/지출 전체</option>
              <option value="income">수입만</option>
              <option value="expense">지출만</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant="secondary"
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              style={{ fontSize: '14px' }}
            >
              {showAdvancedSearch ? '고급 검색 숨기기' : '고급 검색'}
            </Button>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
              style={{
                padding: '8px 10px',
                backgroundColor: darkMode ? colors.dark[700] : 'white',
                color: darkMode ? colors.dark[100] : colors.gray[900],
                border: `1px solid ${darkMode ? colors.dark[600] : colors.gray[300]}`,
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: "'Noto Sans KR', sans-serif"
              }}
            >
              <option value="date">날짜순</option>
              <option value="amount">금액순</option>
            </select>
          </div>

          {/* 고급 검색 패널 */}
          {showAdvancedSearch && (
            <div style={{
              padding: '16px',
              backgroundColor: darkMode ? colors.dark[800] : colors.gray[50],
              borderRadius: '8px',
              border: `1px solid ${darkMode ? colors.dark[600] : colors.gray[200]}`
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* 금액 범위 */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: darkMode ? colors.dark[200] : colors.gray[700],
                    marginBottom: '8px',
                    fontFamily: "'Noto Sans KR', sans-serif"
                  }}>
                    금액 범위
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="number"
                      placeholder="최소 금액"
                      value={amountRange.min}
                      onChange={(e) => setAmountRange(prev => ({ ...prev, min: e.target.value }))}
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        backgroundColor: darkMode ? colors.dark[700] : 'white',
                        color: darkMode ? colors.dark[100] : colors.gray[900],
                        border: `1px solid ${darkMode ? colors.dark[600] : colors.gray[300]}`,
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontFamily: "'Noto Sans KR', sans-serif"
                      }}
                    />
                    <span style={{ color: darkMode ? colors.dark[400] : colors.gray[500] }}>~</span>
                    <input
                      type="number"
                      placeholder="최대 금액"
                      value={amountRange.max}
                      onChange={(e) => setAmountRange(prev => ({ ...prev, max: e.target.value }))}
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        backgroundColor: darkMode ? colors.dark[700] : 'white',
                        color: darkMode ? colors.dark[100] : colors.gray[900],
                        border: `1px solid ${darkMode ? colors.dark[600] : colors.gray[300]}`,
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontFamily: "'Noto Sans KR', sans-serif"
                      }}
                    />
                  </div>
                </div>

                {/* 날짜 범위 */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: darkMode ? colors.dark[200] : colors.gray[700],
                    marginBottom: '8px',
                    fontFamily: "'Noto Sans KR', sans-serif"
                  }}>
                    날짜 범위
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        backgroundColor: darkMode ? colors.dark[700] : 'white',
                        color: darkMode ? colors.dark[100] : colors.gray[900],
                        border: `1px solid ${darkMode ? colors.dark[600] : colors.gray[300]}`,
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontFamily: "'Noto Sans KR', sans-serif"
                      }}
                    />
                    <span style={{ color: darkMode ? colors.dark[400] : colors.gray[500] }}>~</span>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        backgroundColor: darkMode ? colors.dark[700] : 'white',
                        color: darkMode ? colors.dark[100] : colors.gray[900],
                        border: `1px solid ${darkMode ? colors.dark[600] : colors.gray[300]}`,
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontFamily: "'Noto Sans KR', sans-serif"
                      }}
                    />
                  </div>
                </div>

                {/* 상점/장소 필터 */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: darkMode ? colors.dark[200] : colors.gray[700],
                    marginBottom: '8px',
                    fontFamily: "'Noto Sans KR', sans-serif"
                  }}>
                    상점/장소
                  </label>
                  <input
                    type="text"
                    placeholder="상점명 또는 장소 검색..."
                    value={merchantFilter}
                    onChange={(e) => setMerchantFilter(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      backgroundColor: darkMode ? colors.dark[700] : 'white',
                      color: darkMode ? colors.dark[100] : colors.gray[900],
                      border: `1px solid ${darkMode ? colors.dark[600] : colors.gray[300]}`,
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontFamily: "'Noto Sans KR', sans-serif"
                    }}
                  />
                </div>

                {/* 초기화 버튼 */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="secondary"
                    onClick={clearAdvancedFilters}
                    style={{ fontSize: '14px', padding: '8px 16px' }}
                  >
                    모든 필터 초기화
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* 거래 내역 목록 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredTransactions.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: darkMode ? colors.dark[100] : colors.gray[900],
              margin: '0 0 8px 0',
              fontFamily: "'Noto Sans KR', sans-serif"
            }}>
              거래 내역이 없습니다
            </h3>
            <p style={{
              fontSize: '14px',
              color: darkMode ? colors.dark[400] : colors.gray[600],
              margin: '0 0 24px 0',
              fontFamily: "'Noto Sans KR', sans-serif"
            }}>
              첫 번째 거래를 추가해보세요
            </p>
            <Button 
              variant="primary"
              onClick={() => setShowAddModal(true)}
            >
              거래 추가
            </Button>
          </Card>
        ) : (
          filteredTransactions.map((transaction) => (
            <Card key={transaction.id} style={{ padding: '16px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                gap: '16px'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    marginBottom: '8px' 
                  }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: darkMode ? colors.dark[100] : colors.gray[900],
                      margin: 0,
                      fontFamily: "'Noto Sans KR', sans-serif"
                    }}>
                      {transaction.description}
                    </h3>
                    <span style={{
                      fontSize: '12px',
                      color: darkMode ? colors.dark[400] : colors.gray[500],
                      backgroundColor: darkMode ? colors.dark[700] : colors.gray[100],
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontFamily: "'Noto Sans KR', sans-serif"
                    }}>
                      {getCategoryName(transaction.category)}
                    </span>
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    gap: '16px', 
                    alignItems: 'center',
                    flexWrap: 'wrap'
                  }}>
                    <span style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: transaction.type === 'income' ? colors.success[600] : colors.error[600],
                      fontFamily: "'Noto Sans KR', sans-serif"
                    }}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </span>
                    
                    <span style={{
                      fontSize: '14px',
                      color: darkMode ? colors.dark[400] : colors.gray[600],
                      fontFamily: "'Noto Sans KR', sans-serif"
                    }}>
                      {formatDate(transaction.date)}
                    </span>
                    
                    {transaction.merchant && (
                      <span style={{
                        fontSize: '14px',
                        color: darkMode ? colors.dark[400] : colors.gray[600],
                        fontFamily: "'Noto Sans KR', sans-serif"
                      }}>
                        {transaction.merchant}
                      </span>
                    )}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button
                    variant="secondary"
                    onClick={() => handleEdit(transaction)}
                    style={{ 
                      fontSize: '12px', 
                      padding: '6px 12px',
                      minWidth: 'auto'
                    }}
                  >
                    수정
                  </Button>
                  <Button
                    variant="error"
                    onClick={() => handleDelete(transaction.id || '')}
                    style={{ 
                      fontSize: '12px', 
                      padding: '6px 12px',
                      minWidth: 'auto'
                    }}
                  >
                    삭제
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* 거래 추가 모달 */}
      <TransactionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      {/* 거래 수정 모달 */}
      <TransactionModal
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        transaction={editingTransaction || undefined}
      />

      {/* 내보내기 모달 */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </PageLayout>
  );
};